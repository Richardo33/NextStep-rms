"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Workflow from "@/components/Workflow";
import Contact from "@/components/Contact";

export default function HomePage() {
  useEffect(() => {
    // 1) Kalau sudah ada session saat membuka landing → langsung pindah
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        window.location.replace("/dashboard/company");
      }
    });

    // 2) Ketika login berhasil dari AuthDialog (SIGNED_IN) → langsung pindah
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        window.location.replace("/dashboard/company");
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="flex flex-col">
      <Hero />
      <Features />
      <Workflow />
      <Contact />
    </main>
  );
}
