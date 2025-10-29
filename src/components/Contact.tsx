"use client";

import { Button } from "@/components/ui/button";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section
      id="contact"
      className="py-20 bg-gray-900 text-white text-center px-6"
    >
      <Reveal>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Simplify Your Recruitment Process?
        </h2>
      </Reveal>

      <Reveal delay={0.2}>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
          Start using NextStep to manage your hiring pipeline with ease and
          automation.
        </p>
      </Reveal>
    </section>
  );
}
