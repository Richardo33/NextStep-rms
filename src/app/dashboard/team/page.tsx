/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Linkedin, Github, Globe, Mail } from "lucide-react";

const MySwal = withReactContent(Swal);

interface HRUser {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  avatar_url: string | null;
  approved: boolean;
  created_at: string;
  approved_at?: string | null;
  position?: string | null;
  bio?: string | null;
  skills?: string[];
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
}

export default function TeamPage() {
  const [role, setRole] = useState<"admin" | "hr" | null>(null);
  const [approvedHRs, setApprovedHRs] = useState<HRUser[]>([]);
  const [pendingHRs, setPendingHRs] = useState<HRUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: session } = await supabase.auth.getUser();
      const user = session.user;
      if (!user) return;

      const { data: me } = await supabase
        .from("hr_users")
        .select("role")
        .eq("email", user.email)
        .maybeSingle();

      setRole(me?.role || null);

      const { data, error } = await supabase
        .from("hr_users")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      if (data) {
        setApprovedHRs(data.filter((u) => u.approved));
        setPendingHRs(data.filter((u) => !u.approved));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    const confirm = await MySwal.fire({
      title: "Approve this HR?",
      text: "They will gain full access to the dashboard.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4f46e5",
    });

    if (!confirm.isConfirmed) return;

    const { error } = await supabase
      .from("hr_users")
      .update({ approved: true, approved_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      MySwal.fire("Error", error.message, "error");
      return;
    }

    MySwal.fire("Approved!", "HR has been approved successfully.", "success");
    setPendingHRs((prev) => prev.filter((u) => u.id !== id));
    const updated = pendingHRs.find((u) => u.id === id);
    if (updated)
      setApprovedHRs((prev) => [...prev, { ...updated, approved: true }]);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading team data...
      </div>
    );

  if (role === "admin") {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Approved HR Team</h2>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Approved At</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedHRs.length ? (
                  approvedHRs.map((hr) => (
                    <TableRow key={hr.id}>
                      <TableCell>{hr.name || "—"}</TableCell>
                      <TableCell>{hr.email}</TableCell>
                      <TableCell>{hr.role}</TableCell>
                      <TableCell>
                        {hr.approved_at
                          ? new Date(hr.approved_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-gray-500"
                    >
                      No approved HRs yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-yellow-600">
              Pending HR Approvals
            </h2>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Requested At</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingHRs.length ? (
                  pendingHRs.map((hr) => (
                    <TableRow key={hr.id}>
                      <TableCell>{hr.name || "—"}</TableCell>
                      <TableCell>{hr.email}</TableCell>
                      <TableCell>
                        {new Date(hr.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(hr.id)}
                        >
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-gray-500"
                    >
                      No pending HR approvals.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        Meet Your HR Team
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {approvedHRs.map((hr, idx) => (
          <motion.div
            key={hr.id}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 150, damping: 12 }}
          >
            <Card className="h-[360px] flex flex-col border border-gray-200 rounded-xl shadow hover:shadow-md transition">
              <CardHeader className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarImage src={hr.avatar_url || undefined} />
                  <AvatarFallback>
                    {hr.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">{hr.name}</p>
                <p className="text-sm text-gray-500">
                  {hr.position || "HR Staff"}
                </p>
              </CardHeader>
              <CardContent className="flex-1 text-center text-sm text-gray-600">
                {hr.bio || "No bio provided."}
                <div className="mt-3 flex justify-center gap-3 text-gray-500">
                  {hr.linkedin && (
                    <a href={hr.linkedin} target="_blank" rel="noreferrer">
                      <Linkedin className="h-4 w-4 hover:text-indigo-600" />
                    </a>
                  )}
                  {hr.github && (
                    <a href={hr.github} target="_blank" rel="noreferrer">
                      <Github className="h-4 w-4 hover:text-indigo-600" />
                    </a>
                  )}
                  {hr.website && (
                    <a href={hr.website} target="_blank" rel="noreferrer">
                      <Globe className="h-4 w-4 hover:text-indigo-600" />
                    </a>
                  )}
                  <a href={`mailto:${hr.email}`}>
                    <Mail className="h-4 w-4 hover:text-indigo-600" />
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {hr.skills?.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
