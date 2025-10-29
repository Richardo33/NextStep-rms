/* eslint-disable @typescript-eslint/no-unused-expressions */
export const dynamic = "force-dynamic";

("use client");

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Globe, Users, Pencil, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface CompanyProfile {
  id: string;
  name: string;
  logo_url: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  team_size: string | null;
  about: string | null;
}

export default function CompanyDashboardPage() {
  const [openEdit, setOpenEdit] = useState(false);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  /* ===================================================
     ✅ Fetch Company Profile (single company system)
  =================================================== */
  const fetchCompany = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("company_profile")
        .select(
          "id, name, logo_url, industry, location, website, team_size, about"
        )
        .limit(1)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (err) {
      console.error("Error fetching company:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCompany();
  }, []);

  const handleSave = async () => {
    if (!company) return;

    try {
      let logoUrl = company.logo_url;

      if (file) {
        const filePath = `logos/${company.id}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("logos")
          .getPublicUrl(filePath);

        logoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("company_profile")
        .update({
          name: company.name,
          industry: company.industry,
          location: company.location,
          website: company.website,
          team_size: company.team_size,
          about: company.about,
          logo_url: logoUrl,
        })
        .eq("id", company.id);

      if (error) throw error;

      alert("✅ Company profile updated successfully!");
      setCompany({ ...company, logo_url: logoUrl });
      setOpenEdit(false);
      setFile(null);
    } catch (err) {
      console.error("Error updating company:", err);
      alert("❌ Failed to update company profile.");
    }
  };

  const createDefaultCompany = async () => {
    try {
      const { error } = await supabase.from("company_profile").insert({
        name: "NextStep HR",
        industry: "HR Automation",
        location: "Jakarta, Indonesia",
        website: "https://nextstep.richardoo.cyou",
        team_size: "10-20",
        about:
          "NextStep2 helps automate your HR and recruitment processes with AI-powered workflows.",
        logo_url: null,
      });

      if (error) throw error;

      alert("✅ Default company profile created!");
      await fetchCompany();
    } catch (err) {
      console.error("Error creating default company:", err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading company data...
      </div>
    );

  if (!company)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500 space-y-3">
        <p>No company profile found.</p>
        <Button onClick={createDefaultCompany}>Create Default Company</Button>
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Company Profile
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your company information and branding.
          </p>
        </div>
        <Button onClick={() => setOpenEdit(true)} variant="outline">
          <Pencil size={16} className="mr-2" /> Edit
        </Button>
      </div>

      <Separator />

      {/* ===== Company Info ===== */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Image
            src={company.logo_url || "/default-company.png"}
            alt={company.name}
            width={96}
            height={96}
            className="rounded-full ring-4 ring-indigo-200 dark:ring-indigo-800 object-cover"
          />
          <div>
            <CardTitle className="text-2xl mb-1">{company.name}</CardTitle>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {company.industry}
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {company.location || "—"}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <a
                  href={company.website || "#"}
                  target="_blank"
                  className="text-indigo-600 hover:underline"
                >
                  {company.website?.replace(/^https?:\/\//, "") || "—"}
                </a>
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {company.team_size || "—"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">
            {company.about || "No company description yet."}
          </p>
        </CardContent>
      </Card>

      {/* ===== Edit Company Modal ===== */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Company Profile</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            className="space-y-4"
          >
            {/* Upload logo */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Company Logo
              </label>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    file
                      ? URL.createObjectURL(file)
                      : company.logo_url || "/default-company.png"
                  }
                  alt="Preview"
                  className="h-16 w-16 rounded-full object-cover"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center gap-2 text-sm text-indigo-600 cursor-pointer hover:underline"
                >
                  <Upload className="h-4 w-4" /> Upload New
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
            </div>

            <Input
              value={company.name || ""}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              placeholder="Company Name"
            />
            <Input
              value={company.website || ""}
              onChange={(e) =>
                setCompany({ ...company, website: e.target.value })
              }
              placeholder="Website"
            />
            <Input
              value={company.location || ""}
              onChange={(e) =>
                setCompany({ ...company, location: e.target.value })
              }
              placeholder="Location"
            />
            <Input
              value={company.industry || ""}
              onChange={(e) =>
                setCompany({ ...company, industry: e.target.value })
              }
              placeholder="Industry"
            />
            <Input
              value={company.team_size || ""}
              onChange={(e) =>
                setCompany({ ...company, team_size: e.target.value })
              }
              placeholder="Team Size"
            />
            <Textarea
              value={company.about || ""}
              onChange={(e) =>
                setCompany({ ...company, about: e.target.value })
              }
              placeholder="About the company"
              rows={4}
            />
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
