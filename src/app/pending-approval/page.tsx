"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-indigo-50 to-white px-6 text-center">
      <div className="bg-white shadow-md rounded-2xl p-10 max-w-md border border-gray-100">
        <Clock className="w-16 h-16 mx-auto text-yellow-500 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Account Pending Approval
        </h1>
        <p className="text-gray-600 mb-6">
          Your account has been created successfully but is awaiting admin
          approval.
          <br />
          You’ll get access once your account is approved.
        </p>
        <Button
          onClick={handleLogout}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
        >
          Logout
        </Button>
      </div>
      <p className="text-xs text-gray-400 mt-8">
        © {new Date().getFullYear()} NextStep2
      </p>
    </div>
  );
}
