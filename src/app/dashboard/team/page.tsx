"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Github, Linkedin, Mail, Globe } from "lucide-react";
import { motion } from "framer-motion";

const FadeIn = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

type HRMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  position?: string | null;
  bio?: string | null;
  skills?: string[];
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
};

export default function TeamPage() {
  const [team, setTeam] = useState<HRMember[]>([]);
  const [selected, setSelected] = useState<HRMember | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch semua HR berdasarkan company_id HR yang login
  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);

      // 🔍 DEBUG SESSION INFO
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("🔎 Session User:", sessionData.session?.user);
      console.log(
        "🔎 User Metadata:",
        sessionData.session?.user?.user_metadata
      );

      // Ambil user login
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn("❌ Tidak ada user yang login.");
        setLoading(false);
        return;
      }

      // Ambil company_id HR yang login
      const { data: hr, error: hrError } = await supabase
        .from("hr_users")
        .select("company_id")
        .eq("email", user.email)
        .single();

      console.log("🧩 HR record:", hr);
      console.log("🧩 HR error:", hrError);

      if (hrError || !hr?.company_id) {
        console.warn("❌ Tidak ditemukan company_id untuk user ini");
        setLoading(false);
        return;
      }

      // Ambil semua HR di company yang sama
      const { data: members, error: teamError } = await supabase
        .from("hr_users")
        .select(
          "id, name, email, role, avatar_url, position, bio, skills, linkedin, github, website"
        )
        .eq("company_id", hr.company_id);

      console.log("👥 Members:", members);
      console.log("⚠️ Fetch error:", teamError);

      if (teamError) {
        console.error("Error fetching team:", teamError);
      } else {
        setTeam(members || []);
      }

      setLoading(false);
    };

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Loading team data...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-800 dark:bg-gray-950 dark:text-gray-100">
      <section className="max-w-6xl mx-auto px-6 py-20">
        <FadeIn>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Meet Your HR Team
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The dedicated people behind your company’s recruitment success —
              working together to keep hiring simple, fast, and enjoyable with{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                NextStep
              </span>
              .
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Separator className="max-w-md mx-auto mb-12" />
        </FadeIn>

        {/* ✅ Grid HR team dari Supabase */}
        {team.length === 0 ? (
          <p className="text-center text-gray-500">
            Belum ada anggota HR di company ini.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {team.map((m, idx) => (
              <FadeIn key={m.id} delay={0.05 * idx}>
                <motion.div
                  whileHover={{ scale: 1.04, y: -6 }}
                  transition={{ type: "spring", stiffness: 180, damping: 15 }}
                  onClick={() => setSelected(m)}
                  className="cursor-pointer"
                >
                  <Card className="relative overflow-hidden h-[430px] flex flex-col border border-gray-200/70 dark:border-gray-800/70 rounded-2xl bg-linear-to-b from-white to-indigo-50/40 dark:from-gray-900 dark:to-indigo-950/30 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_35px_-5px_rgba(99,102,241,0.25)] transition-all duration-500 hover:border-indigo-300/60">
                    <CardHeader className="flex flex-col items-center text-center space-y-3">
                      <div className="rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-950">
                        <Avatar className="h-28 w-28 rounded-full">
                          <AvatarImage
                            src={m.avatar_url || undefined}
                            alt={m.name}
                          />
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-lg font-semibold">
                            {m.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <CardTitle
                        className="text-lg font-bold truncate max-w-[200px]"
                        title={m.name}
                      >
                        {m.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {m.position || "HR Staff"}
                      </p>
                    </CardHeader>

                    <CardContent className="text-center flex-1 flex flex-col justify-between px-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4 overflow-hidden">
                        {m.bio || "Tidak ada deskripsi tersedia."}
                      </p>

                      {m.skills && (
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          {m.skills.map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="dark:bg-gray-800 dark:text-gray-200"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex justify-center gap-3 pb-4 mt-auto">
                      {m.linkedin && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {m.github && (
                        <a
                          href={m.github}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {m.website && (
                        <a
                          href={m.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <Globe className="h-5 w-5" />
                        </a>
                      )}
                      <a
                        href={`mailto:${m.email}`}
                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <Mail className="h-5 w-5" />
                      </a>
                    </CardFooter>
                  </Card>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* Modal detail */}
      {/* Modal Detail Lengkap */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md sm:max-w-lg p-6 rounded-2xl text-center shadow-xl bg-white dark:bg-gray-900">
          {selected && (
            <>
              {/* Nama */}
              <DialogHeader>
                <DialogTitle className="text-center mb-4 text-2xl font-bold">
                  {selected.name}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 rounded-full ring-4 ring-indigo-500/40">
                    <AvatarImage src={selected.avatar_url || undefined} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-xl font-semibold">
                      {selected.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Position */}
                <p className="text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide text-sm">
                  {selected.position || "HR Staff"}
                </p>

                {/* Bio */}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-md">
                  {selected.bio || "Tidak ada deskripsi tersedia."}
                </p>

                {/* Skills */}
                {selected.skills && selected.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {selected.skills.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="dark:bg-gray-800 dark:text-gray-200"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Separator */}
                <Separator className="my-5 w-3/4 mx-auto" />

                {/* Social Icons */}
                <div className="flex justify-center items-center gap-5">
                  {selected.linkedin && (
                    <a
                      href={selected.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}

                  {selected.github && (
                    <a
                      href={selected.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors"
                      title="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}

                  {selected.website && (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors"
                      title="Website"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}

                  <a
                    href={`mailto:${selected.email}`}
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors"
                    title="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
