/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CandidateDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  resume_url: string;
  status: string;
  applied_at: string;
  job: { id: string; title: string };
}

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCandidate = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("candidates")
        .select(
          `
          id,
          name,
          email,
          phone,
          city,
          resume_url,
          status,
          applied_at,
          job:jobs(id, title)
        `
        )
        .eq("id", candidateId)
        .single();

      if (error) throw error;

      if (data) {
        const jobItem = Array.isArray(data.job) ? data.job[0] : data.job;
        setCandidate({
          ...data,
          job: { id: jobItem?.id || "", title: jobItem?.title || "" },
        });
      }
    } catch (err) {
      console.error("Error fetching candidate:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) fetchCandidate();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="text-gray-500 p-10 text-center">
        Loading candidate details...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-gray-500 p-10 text-center">
        Candidate not found.
        <Button variant="link" onClick={() => router.back()}>
          ← Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-sm border rounded-lg p-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-sm text-gray-500 hover:text-indigo-600"
      >
        ← Back to Candidates
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {candidate.name}
      </h1>

      <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
        <div>
          <p>
            <span className="font-medium">Email:</span> {candidate.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {candidate.phone}
          </p>
          <p>
            <span className="font-medium">City:</span> {candidate.city}
          </p>
        </div>
        <div>
          <p>
            <span className="font-medium">Applied Job:</span>{" "}
            {candidate.job.title}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                candidate.status === "screening"
                  ? "bg-yellow-100 text-yellow-700"
                  : candidate.status === "interview"
                  ? "bg-blue-100 text-blue-700"
                  : candidate.status === "technical_test"
                  ? "bg-orange-100 text-orange-700"
                  : candidate.status === "hired"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {candidate.status}
            </span>
          </p>
          <p>
            <span className="font-medium">Applied At:</span>{" "}
            {Intl.DateTimeFormat("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }).format(new Date(candidate.applied_at))}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <a
          href={candidate.resume_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline text-sm"
        >
          📄 View Resume
        </a>
      </div>
    </div>
  );
}
