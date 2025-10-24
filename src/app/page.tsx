import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Workflow from "@/components/Workflow";
import Contact from "@/components/Contact";

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Features />
      <Workflow />
      <Contact />
    </main>
  );
}
