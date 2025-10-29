/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";

interface CandidateDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  resume_url: string;
  status: string;
  applied_at: string;
  ai_reason?: string | null;
  interview_proposed_at?: string | null;
  meeting_link?: string | null;
  screening_reason?: string | null;
  job: { id: string; title: string };
}

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dateTime: "",
    meetingLink: "",
    notes: "",
  });

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
          ai_reason,
          interview_proposed_at,
          meeting_link,
          screening_reason,
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

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("candidates")
        .update({
          status: "interview_set",
          interview_proposed_at: new Date(form.dateTime).toISOString(),
          meeting_link: form.meetingLink,
          screening_reason: form.notes || null,
        })
        .eq("id", candidate.id);

      if (error) throw error;

      Swal.fire("✅ Success", "Interview schedule saved!", "success");
      setOpen(false);
      setForm({ dateTime: "", meetingLink: "", notes: "" });
      await fetchCandidate();
    } catch (err) {
      console.error("Error scheduling interview:", err);
      Swal.fire("❌ Error", "Failed to set interview schedule.", "error");
    } finally {
      setSaving(false);
    }
  };

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
                  : candidate.status === "interview_set"
                  ? "bg-indigo-100 text-indigo-700"
                  : candidate.status === "technical_test"
                  ? "bg-orange-100 text-orange-700"
                  : candidate.status === "hired"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {candidate.status.replace("_", " ")}
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

      {candidate.ai_reason && (
        <div className="mt-6 bg-gray-50 border-l-4 border-indigo-500 p-4 rounded">
          <h3 className="font-semibold text-gray-800 mb-1">
            AI Evaluation Reason
          </h3>
          <p className="text-gray-700 whitespace-pre-line text-sm">
            {candidate.ai_reason}
          </p>
        </div>
      )}

      {candidate.status === "interview_set" &&
        candidate.interview_proposed_at && (
          <div className="mt-8 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
            <h3 className="font-semibold text-indigo-900 mb-2">
              Interview Schedule
            </h3>
            <p className="text-sm text-gray-700">
              <strong>Date:</strong>{" "}
              {new Date(candidate.interview_proposed_at).toLocaleString(
                "en-GB",
                {
                  dateStyle: "full",
                  timeStyle: "short",
                }
              )}
            </p>

            {candidate.meeting_link && (
              <p className="text-sm text-gray-700">
                <strong>Meeting Link:</strong>{" "}
                <a
                  href={candidate.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline"
                >
                  {candidate.meeting_link}
                </a>
              </p>
            )}

            {candidate.screening_reason && (
              <p className="text-sm text-gray-700">
                <strong>Notes:</strong> {candidate.screening_reason}
              </p>
            )}
          </div>
        )}

      {candidate.status === "interview" && (
        <div className="mt-8">
          <Button
            onClick={() => setOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Set Interview Schedule
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Interview Schedule</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSchedule} className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Date & Time
              </label>
              <Input
                type="datetime-local"
                value={form.dateTime}
                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Meeting Link
              </label>
              <Input
                type="url"
                placeholder="https://meet.google.com/xyz"
                value={form.meetingLink}
                onChange={(e) =>
                  setForm({ ...form, meetingLink: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Notes (Optional)
              </label>
              <Textarea
                placeholder="Any additional info for this interview"
                className="resize-none"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 text-white"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Interview"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
