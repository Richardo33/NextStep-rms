/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Company = {
  name: string | null;
  location: string | null;
  logo_url: string | null;
};

type Job = {
  id: string;
  title: string;
  job_level: string | null;
  education: string | null;
  employment_type: string | null;
  experience: string | null;
  work_setup: string | null;
  location: string | null;
  required_skills: string | null;
  status: string;
  company: Company | null;
};

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data: companyData } = await supabase
          .from("company_profile")
          .select("name, location, logo_url")
          .limit(1)
          .single();

        setCompany(companyData || null);

        const { data, error } = await supabase
          .from("jobs")
          .select(
            "id, title, job_level, education, employment_type, experience, work_setup, location, required_skills, status"
          )
          .eq("status", "open")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formatted: Job[] = (data || []).map((job) => ({
          ...job,
          company: companyData || null,
        }));

        setJobs(formatted);
      } catch (err) {
        console.error("❌ Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.required_skills?.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "all" || job.employment_type === type;
      return matchesSearch && matchesType;
    });
  }, [jobs, search, type]);

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Loading open positions...
      </main>
    );

  return (
    <main className="min-h-screen bg-linear-to-b from-indigo-50 to-white text-gray-800">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">
          Open Positions
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Explore current opportunities and find the right fit for you.
        </p>

        {/* 🔍 Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-10">
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Employment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setType("all");
            }}
          >
            Reset
          </Button>
        </div>

        {/* 🧱 Job List */}
        {filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500">
            No matching positions found.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="cursor-pointer hover:shadow-lg border rounded-xl transition-all duration-300">
                  <CardHeader className="flex flex-col items-start gap-3">
                    <div className="w-full flex items-center justify-start gap-3">
                      <Image
                        src={
                          job.company?.logo_url || "/placeholder-company.png"
                        }
                        alt={job.company?.name || "Company Logo"}
                        width={48}
                        height={48}
                        className="rounded-md object-cover border bg-gray-100"
                      />
                      <div>
                        <CardTitle className="text-lg font-semibold text-indigo-700">
                          {job.title}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {job.company?.name || "Our Company"}
                          {job.company?.location
                            ? ` — ${job.company.location}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Level & Education */}
                    <p className="text-sm text-gray-600">
                      {job.job_level && `${job.job_level} • `}
                      {job.education || ""}
                    </p>

                    {/* Type & Work Setup */}
                    <p className="text-sm text-gray-600">
                      {job.employment_type} • {job.work_setup}
                    </p>

                    {/* Location */}
                    {job.location && (
                      <p className="text-sm text-gray-600">📍 {job.location}</p>
                    )}

                    {/* Skills */}
                    {job.required_skills && (
                      <p className="text-sm text-gray-700">
                        🛠️ <span className="font-medium">Skills:</span>{" "}
                        {job.required_skills}
                      </p>
                    )}

                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={
                        job.status === "open"
                          ? "bg-green-100 text-green-700 border-none"
                          : "bg-red-100 text-red-700 border-none"
                      }
                    >
                      {job.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
