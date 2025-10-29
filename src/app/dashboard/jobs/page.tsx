"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  id: string;
  title: string;
  job_level: string;
  education: string;
  employment_type: string;
  experience: string;
  description: string;
  status: string;
  location: string;
  work_setup: string;
  required_skills: string;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    job_level: "",
    education: "",
    employment_type: "",
    experience: "",
    description: "",
    location: "",
    work_setup: "",
    required_skills: "",
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchJobs();
  }, []);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("jobs").insert([
        {
          title: form.title,
          job_level: form.job_level,
          education: form.education,
          employment_type: form.employment_type,
          experience: form.experience,
          description: form.description,
          location: form.location,
          work_setup: form.work_setup,
          required_skills: form.required_skills,
          status: "open",
        },
      ]);

      if (error) throw error;

      setForm({
        title: "",
        job_level: "",
        education: "",
        employment_type: "",
        experience: "",
        description: "",
        location: "",
        work_setup: "",
        required_skills: "",
      });
      setOpen(false);
      await fetchJobs();
    } catch (err) {
      console.error("Error adding job:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
      await fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Job Listings</h3>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus size={16} className="mr-2" /> Add Job
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Job</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddJob} className="space-y-4 mt-4">
              <div>
                <Label>Job Title</Label>
                <Input
                  name="title"
                  placeholder="e.g. Frontend Developer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Job Level</Label>
                  <Select
                    value={form.job_level}
                    onValueChange={(value) =>
                      setForm({ ...form, job_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Mid">Mid</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Education</Label>
                  <Select
                    value={form.education}
                    onValueChange={(value) =>
                      setForm({ ...form, education: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMA/SMK">SMA / SMK</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="S1">Sarjana (S1)</SelectItem>
                      <SelectItem value="S2">Magister (S2)</SelectItem>
                      <SelectItem value="S3">Doktor (S3)</SelectItem>
                      <SelectItem value="Tidak Wajib">Tidak Wajib</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employment Type</Label>
                  <Select
                    value={form.employment_type}
                    onValueChange={(value) =>
                      setForm({ ...form, employment_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Work Setup</Label>
                  <Select
                    value={form.work_setup}
                    onValueChange={(value) =>
                      setForm({ ...form, work_setup: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select setup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  name="location"
                  placeholder="e.g. Jakarta, Bandung"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Experience</Label>
                <Input
                  name="experience"
                  placeholder="e.g. 1-2 years"
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Required Skills</Label>
                <textarea
                  name="required_skills"
                  rows={2}
                  placeholder="e.g. React, Tailwind, TypeScript"
                  className="w-full border rounded-md p-2 text-sm resize-none"
                  value={form.required_skills}
                  onChange={(e) =>
                    setForm({ ...form, required_skills: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Describe the role and responsibilities..."
                  className="w-full border rounded-md p-2 text-sm resize-none"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? "Saving..." : "Add Job"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">No jobs found. Start by adding one!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="bg-white shadow-sm border rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition cursor-pointer"
            >
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {job.title}
                </h4>
                <p className="text-sm text-gray-500">
                  {job.job_level} • {job.education}
                </p>
                <p className="text-sm text-gray-500">
                  {job.employment_type} • {job.work_setup}
                </p>
                <p className="text-sm text-gray-500">📍 {job.location}</p>

                {job.required_skills && (
                  <p className="mt-2 text-sm text-gray-700">
                    🛠️ <span className="font-medium">Skills:</span>{" "}
                    {job.required_skills}
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    job.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {job.status}
                </span>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(job.id);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
