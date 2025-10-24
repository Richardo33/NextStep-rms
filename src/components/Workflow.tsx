"use client";

import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Reveal from "./Reveal";

const steps = [
  {
    title: "1. Create Job Openings",
    desc: "Add new open positions with detailed descriptions and requirements.",
  },
  {
    title: "2. Candidates Apply",
    desc: "Candidates submit applications directly from your public job page.",
  },
  {
    title: "3. Monitor Progress",
    desc: "Track candidate status across different stages effortlessly.",
  },
  {
    title: "4. Automate Actions",
    desc: "Move candidates automatically when AI screening is completed.",
  },
];

export default function Workflow() {
  return (
    <section id="workflow" className="py-20 bg-indigo-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Simple Workflow, Big Results
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.15}>
              <Card className="border-gray-200 text-left">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-indigo-600">
                    {s.title}
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 text-gray-700">
                  {s.desc}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
