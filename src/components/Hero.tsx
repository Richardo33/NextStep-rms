"use client";

import Reveal from "./Reveal";
import AuthDialog from "./AuthDialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-linear-to-b from-indigo-100 to-white text-center px-6">
      <Reveal>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 max-w-3xl leading-tight">
          Streamline Your{" "}
          <span className="text-indigo-600">Recruitment Process</span>
        </h1>
      </Reveal>

      <Reveal delay={0.2}>
        <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl">
          Manage job postings, monitor candidates, and automate your hiring
          steps.
        </p>
      </Reveal>

      <Reveal delay={0.4}>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <AuthDialog />

          <Link href="/jobs" passHref>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition"
            >
              View Open Positions
            </Button>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
