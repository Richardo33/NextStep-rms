"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Workflow from "@/components/Workflow";
import Contact from "@/components/Contact";

const REDIRECT_FLAG = "ns_redirecting_to_dashboard";

export default function HomePage() {
  useEffect(() => {
    // Kalau sudah ada session saat membuka landing, redirect SEKALI saja
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && !sessionStorage.getItem(REDIRECT_FLAG)) {
        sessionStorage.setItem(REDIRECT_FLAG, "1");
        window.location.replace("/dashboard/company");
      }
    });

    // Saat login berhasil dari AuthDialog, redirect SEKALI saja
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && !sessionStorage.getItem(REDIRECT_FLAG)) {
        sessionStorage.setItem(REDIRECT_FLAG, "1");
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
