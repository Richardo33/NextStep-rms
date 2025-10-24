"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

interface Company {
  name: string | null;
  location: string | null;
  logo_url: string | null;
  about?: string | null;
}

interface Job {
  id: string;
  title: string;
  employment_type: string | null;
  experience: string | null;
  description: string | null;
  status: string;
  location: string | null;
  work_setup: string | null;
  job_level: string | null;
  education: string | null;
  required_skills: string | null;
  company: Company | null;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    resume: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch Job Detail
  useEffect(() => {
    const fetchJobDetail = async (): Promise<void> => {
      setLoading(true);

      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
          id,
          title,
          employment_type,
          experience,
          description,
          status,
          location,
          work_setup,
          job_level,
          education,
          required_skills,
          companies(name, location, logo_url, about)
        `
        )
        .eq("id", jobId)
        .single();

      if (error || !data) {
        console.error("❌ Error fetching job:", error);
        setLoading(false);
        return;
      }

      const companyData = Array.isArray(data.companies)
        ? data.companies[0]
        : data.companies;

      setJob({
        ...data,
        company: companyData || {
          name: null,
          location: null,
          logo_url: null,
          about: null,
        },
      });
      setLoading(false);
    };

    if (jobId) fetchJobDetail();
  }, [jobId]);

  // ✅ Handle Apply
  const handleApply = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 🧩 Validasi file
      if (!form.resume) {
        Swal.fire({
          icon: "warning",
          title: "Resume Required",
          text: "Please upload your resume in PDF format.",
        });
        setSubmitting(false);
        return;
      }

      if (form.resume.type !== "application/pdf") {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Only PDF files are allowed for resumes.",
        });
        setSubmitting(false);
        return;
      }

      // 🧩 Cek duplikasi kandidat (email + job_id)
      const { data: existing } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", form.email)
        .eq("job_id", jobId)
        .maybeSingle();

      if (existing) {
        Swal.fire({
          icon: "info",
          title: "Already Applied",
          text: "You have already applied for this position.",
        });
        setSubmitting(false);
        return;
      }

      // 🧩 Upload resume ke Supabase Storage
      const fileExt = form.resume.name.split(".").pop();
      const safeName = form.name.trim().replace(/\s+/g, "_");
      const fileName = `${Date.now()}-${safeName}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, form.resume, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      const publicUrl = publicData?.publicUrl ?? null;
      if (!publicUrl) throw new Error("Failed to generate resume URL.");

      // 🧩 Insert ke tabel candidates
      const { error: insertError } = await supabase.from("candidates").insert([
        {
          job_id: jobId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          resume_url: publicUrl,
          status: "screening",
        },
      ]);

      if (insertError) throw insertError;

      Swal.fire({
        icon: "success",
        title: "Application Submitted 🎉",
        text: "Your application has been successfully submitted.",
        confirmButtonColor: "#4f46e5",
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        city: "",
        resume: null,
      });
      setOpen(false);
    } catch (error) {
      console.error("❌ Apply error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "There was an issue submitting your application. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Loading job details...
      </main>
    );

  if (!job)
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Job not found.
      </main>
    );

  return (
    <main className="min-h-screen bg-linear-to-b from-indigo-50 to-white text-gray-800">
      <section className="max-w-4xl mx-auto px-6 py-16">
        {/* 🔙 Back Button */}
        <Button
          variant="outline"
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-indigo-700"
          onClick={() => router.back()}
        >
          <ArrowLeft size={18} />
          Back to Job List
        </Button>

        <Card className="p-6">
          {/* Company Info */}
          <div className="flex items-center gap-4 mb-6">
            <Image
              src={job.company?.logo_url || "/placeholder-company.png"}
              alt={job.company?.name || "Company Logo"}
              width={60}
              height={60}
              className="rounded-md object-cover border bg-gray-100"
            />
            <div>
              <h1 className="text-2xl font-bold text-indigo-700">
                {job.title}
              </h1>
              <p className="text-gray-500">
                {job.company?.name || "Unknown Company"}
                {job.location ? ` — ${job.location}` : ""}
              </p>
            </div>
          </div>

          {/* Job Detail */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 mb-4">
              {job.employment_type && (
                <Badge variant="outline">{job.employment_type}</Badge>
              )}
              {job.work_setup && (
                <Badge variant="secondary">{job.work_setup}</Badge>
              )}
              {job.job_level && (
                <Badge variant="secondary">{job.job_level}</Badge>
              )}
            </div>

            <p>
              <strong>Experience:</strong> {job.experience || "Not specified"}
            </p>
            <p>
              <strong>Education:</strong> {job.education || "Not specified"}
            </p>
            <p>
              <strong>Skills:</strong> {job.required_skills || "Not specified"}
            </p>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>

          {/* Apply Button */}
          <div className="mt-8">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Apply Now
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Apply for {job.title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleApply} className="space-y-4 mt-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      required
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Upload Resume (PDF only)</Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      required
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setForm({ ...form, resume: file });
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </section>
    </main>
  );
}
