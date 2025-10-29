"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Upload } from "lucide-react";
import Swal from "sweetalert2";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (updatedData: {
    name: string | null;
    avatar_url: string | null;
  }) => void;
}

interface HRData {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "hr";
  avatar_url: string | null;
  position?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
}

export default function ProfileDialog({
  open,
  onClose,
  onUpdate,
}: ProfileDialogProps) {
  const [hr, setHR] = useState<HRData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [bioWordCount, setBioWordCount] = useState(0);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchHR = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("hr_users")
        .select(
          "id, name, email, role, avatar_url, position, bio, skills, linkedin, github, website"
        )
        .eq("email", user.email)
        .maybeSingle();

      if (error) {
        console.error("Error fetching HR:", error);
        return;
      }

      if (data) {
        setHR(data);
        setSkillInput(Array.isArray(data.skills) ? data.skills.join(", ") : "");
        setBioWordCount(
          data.bio ? data.bio.split(/\s+/).filter(Boolean).length : 0
        );
      }
    };

    fetchHR();
  }, [open]);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSave = async () => {
    if (!hr) return;
    setLoading(true);

    try {
      let avatarUrl = hr.avatar_url;

      if (file) {
        const filePath = `avatars/${hr.id}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("hr_users")
        .update({
          name: hr.name,
          avatar_url: avatarUrl,
          position: hr.position,
          bio: hr.bio,
          skills: hr.skills,
          linkedin: hr.linkedin,
          github: hr.github,
          website: hr.website,
        })
        .eq("id", hr.id);

      if (error) throw error;

      onUpdate({ name: hr.name, avatar_url: avatarUrl });

      await Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been updated successfully.",
        confirmButtonColor: "#4f46e5",
      });

      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "There was an error updating your profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hr)
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Loading Profile</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <p className="text-center text-gray-500 py-4">
            Loading profile data...
          </p>
        </DialogContent>
      </Dialog>
    );

  const isEditable = hr.role === "admin" || hr.role === "hr";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 p-6">
        <DialogHeader>
          <DialogTitle>Profile Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
              <Image
                src={
                  file
                    ? URL.createObjectURL(file)
                    : hr.avatar_url || "/default-avatar.png"
                }
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            {isEditable && (
              <label
                htmlFor="avatar-upload"
                className="flex items-center gap-2 text-sm text-indigo-600 cursor-pointer hover:underline"
              >
                <Upload className="h-4 w-4" /> Change Photo
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
            )}
          </div>

          <div>
            <Label>Name</Label>
            <Input
              type="text"
              value={hr.name || ""}
              disabled={!isEditable}
              onChange={(e) =>
                setHR((prev) =>
                  prev ? { ...prev, name: e.target.value } : prev
                )
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={hr.email} disabled />
            </div>
            <div>
              <Label>Role</Label>
              <Input type="text" value={hr.role} disabled />
            </div>
          </div>

          <div>
            <Label>Position</Label>
            <Input
              type="text"
              value={hr.position || ""}
              disabled={!isEditable}
              onChange={(e) =>
                setHR((prev) =>
                  prev ? { ...prev, position: e.target.value } : prev
                )
              }
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label>Bio</Label>
              <span
                className={`text-xs ${
                  bioWordCount > 75 ? "text-red-500" : "text-gray-400"
                }`}
              >
                {bioWordCount}/75 words
              </span>
            </div>
            <Textarea
              rows={3}
              className="resize-none"
              disabled={!isEditable}
              value={hr.bio || ""}
              onChange={(e) => {
                const text = e.target.value;
                const words = text.split(/\s+/).filter(Boolean);
                if (words.length <= 75) {
                  setHR((prev) => (prev ? { ...prev, bio: text } : prev));
                  setBioWordCount(words.length);
                }
              }}
            />
          </div>

          <div>
            <Label>Skills (comma separated)</Label>
            <Input
              type="text"
              value={skillInput}
              disabled={!isEditable}
              placeholder="e.g., HTML, CSS, React"
              onChange={(e) => {
                const text = e.target.value;
                setSkillInput(text);
                const arr = text
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                setHR((prev) => (prev ? { ...prev, skills: arr } : prev));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>LinkedIn</Label>
              <Input
                type="text"
                value={hr.linkedin || ""}
                disabled={!isEditable}
                onChange={(e) =>
                  setHR((prev) =>
                    prev ? { ...prev, linkedin: e.target.value } : prev
                  )
                }
              />
            </div>
            <div>
              <Label>GitHub</Label>
              <Input
                type="text"
                value={hr.github || ""}
                disabled={!isEditable}
                onChange={(e) =>
                  setHR((prev) =>
                    prev ? { ...prev, github: e.target.value } : prev
                  )
                }
              />
            </div>
          </div>

          <div>
            <Label>Website</Label>
            <Input
              type="text"
              value={hr.website || ""}
              disabled={!isEditable}
              onChange={(e) =>
                setHR((prev) =>
                  prev ? { ...prev, website: e.target.value } : prev
                )
              }
            />
          </div>

          <Button
            className="w-full mt-2"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
