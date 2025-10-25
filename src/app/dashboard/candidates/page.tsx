"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  resume_url: string | null;
  status: string;
  applied_at: string;
  job: { id: string; title: string };
}

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // ✅ Ambil semua kandidat (tanpa company filter)
  const fetchCandidates = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("candidates")
        .select(
          `
          id,
          name,
          email,
          phone,
          city,
          resume_url,
          status,
          applied_at,
          job:jobs(id, title)
        `
        )
        .order("applied_at", { ascending: false });

      if (error) throw error;

      const normalized: Candidate[] =
        data?.map((c) => {
          const jobItem = Array.isArray(c.job) ? c.job[0] : c.job;
          return {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            city: c.city,
            resume_url: c.resume_url,
            status: c.status,
            applied_at: c.applied_at,
            job: {
              id: jobItem?.id || "",
              title: jobItem?.title || "",
            },
          };
        }) ?? [];

      setCandidates(normalized);
    } catch (err) {
      console.error("❌ Error fetching candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // ✅ Filter, search, dan sorting kandidat
  const filteredCandidates = useMemo(() => {
    let list = [...candidates];

    if (filter !== "all") {
      list = list.filter((c) => c.status === filter);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.job.title.toLowerCase().includes(query)
      );
    }

    list.sort((a, b) =>
      sort === "newest"
        ? new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
        : new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
    );

    return list;
  }, [candidates, filter, search, sort]);

  // 🗑️ Hapus kandidat
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const { error } = await supabase.from("candidates").delete().eq("id", id);
      if (error) throw error;

      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("❌ Error deleting candidate:", err);
    }
  };

  // 🖼️ Tampilan utama
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Candidates</h3>
          <p className="text-sm text-gray-500">
            View, search, and manage all applicants.
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by name, email, or job"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="technical_test">Technical Test</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(v) => setSort(v as "newest" | "oldest")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <p className="text-gray-500">Loading candidates...</p>
      ) : filteredCandidates.length === 0 ? (
        <p className="text-gray-500">No candidates found.</p>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700 w-[220px]">
                  Candidate
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-[130px]">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-[130px]">
                  Apply Date
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-[120px]">
                  City
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right w-[100px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCandidates.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/dashboard/candidates/${c.id}`)}
                >
                  <TableCell className="flex items-center gap-3 py-4">
                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.job?.title}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${
                          c.status === "screening"
                            ? "bg-blue-100 text-blue-700"
                            : c.status === "interview"
                            ? "bg-yellow-100 text-yellow-700"
                            : c.status === "technical_test"
                            ? "bg-orange-100 text-orange-700"
                            : c.status === "hired"
                            ? "bg-green-100 text-green-700"
                            : c.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {new Date(c.applied_at).toLocaleDateString("en-GB")}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {c.city || "-"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/candidates/${c.id}`);
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(c.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
