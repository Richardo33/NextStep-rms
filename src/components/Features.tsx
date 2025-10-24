"use client";

import { Briefcase, Users, Workflow, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Reveal from "./Reveal";

const features = [
  {
    icon: <Briefcase className="w-8 h-8 text-indigo-600" />,
    title: "Job Management",
    desc: "Create, edit, and track all open positions effortlessly.",
  },
  {
    icon: <Users className="w-8 h-8 text-indigo-600" />,
    title: "Candidate Tracking",
    desc: "View, filter, and update candidate stages in real-time.",
  },
  {
    icon: <Workflow className="w-8 h-8 text-indigo-600" />,
    title: "Smart Automation",
    desc: "Automate screening and stage movement with AI workflows.",
  },
  {
    icon: <Bell className="w-8 h-8 text-indigo-600" />,
    title: "Instant Notifications",
    desc: "Get notified instantly when candidates move between stages.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white text-center px-6">
      <Reveal>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Powerful Features for Every HR Team
        </h2>
      </Reveal>

      <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.1}>
            <Card className="border-gray-200 hover:shadow-lg transition">
              <CardContent className="pt-8 pb-6 px-4 flex flex-col items-center text-center">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
