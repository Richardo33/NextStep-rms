"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Job {
  id: string;
  title: string;
  category: string | null;
  employment_type: string | null;
  experience: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

export default function Test() {
  const [data, setData] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.from("jobs").select("*");
      if (error) console.error(error);
      else setData(data || []);
    };
    fetchJobs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Supabase Connection</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
