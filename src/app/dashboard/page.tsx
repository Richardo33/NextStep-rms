"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    pendingInterviews: 0,
    technicalTests: 0,
    pendingHRs: 0,
    role: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: me } = await supabase
        .from("hr_users")
        .select("role")
        .eq("email", user.email)
        .single();

      const [jobs, candidates, interviews, technicalTests, pendingHRs] =
        await Promise.all([
          supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("status", "open"),

          supabase
            .from("candidates")
            .select("*", { count: "exact", head: true })
            .not("status", "in", "('rejected','hired')"),

          supabase
            .from("candidates")
            .select("*", { count: "exact", head: true })
            .eq("status", "interview"),

          supabase
            .from("candidates")
            .select("*", { count: "exact", head: true })
            .eq("status", "technical_test"),

          supabase
            .from("hr_users")
            .select("*", { count: "exact", head: true })
            .eq("approved", false),
        ]);

      setStats({
        activeJobs: jobs.count ?? 0,
        totalCandidates: candidates.count ?? 0,
        pendingInterviews: interviews.count ?? 0,
        technicalTests: technicalTests.count ?? 0,
        pendingHRs: pendingHRs.count ?? 0,
        role: me?.role || "",
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Overview</h3>
      <p className="text-gray-600">
        Take a quick look at the recruitment progress, active jobs, and the
        latest candidates.
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <StatCard label="Active Jobs" value={stats.activeJobs} />
        <StatCard label="Total Candidates" value={stats.totalCandidates} />
        <StatCard label="Pending Interviews" value={stats.pendingInterviews} />
        <StatCard
          label="Technical Tests"
          value={stats.technicalTests}
          color="text-blue-600"
        />
        {stats.role === "admin" && (
          <StatCard
            label="Pending HR Approvals"
            value={stats.pendingHRs}
            color="text-yellow-600"
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-indigo-600",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
      <h4 className="font-semibold text-gray-800">{label}</h4>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
