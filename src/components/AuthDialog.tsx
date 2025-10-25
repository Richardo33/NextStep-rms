"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MySwal = withReactContent(Swal);

export default function AuthDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showAlert = async (
    icon: "success" | "error" | "info" | "warning",
    title: string,
    text: string
  ) => {
    await MySwal.fire({
      icon,
      title,
      text,
      background: "#fff",
      confirmButtonColor: icon === "error" ? "#EF4444" : "#6366F1",
      customClass: {
        popup: "!z-[9999]",
      },
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) popup.onclick = (e) => e.stopPropagation();
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ===================== LOGIN =====================
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (signInError) throw new Error(signInError.message || "Login failed");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw new Error("Failed to get user session.");

        const { data: hr, error: hrError } = await supabase
          .from("hr_users")
          .select("approved, role, name")
          .eq("id", user.id)
          .maybeSingle();

        if (hrError) throw new Error(hrError.message || "Query failed.");
        if (!hr) throw new Error("Account not found in HR records.");

        if (!hr.approved) {
          await showAlert(
            "info",
            "Awaiting Approval",
            "Your account has been created but is still pending admin approval."
          );
          return;
        }

        await MySwal.fire({
          icon: "success",
          title: `Welcome back, ${hr.name || "HR"}!`,
          text: "Redirecting to your dashboard...",
          timer: 1800,
          showConfirmButton: false,
          background: "#fff",
          customClass: { popup: "!z-[9999]" },
        });

        setOpen(false);
        router.push("/dashboard");
      } else {
        // ===================== REGISTER =====================
        const { error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } },
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered"))
            throw new Error("This email is already registered.");
          throw new Error(signUpError.message || "Registration failed.");
        }

        // Tunggu trigger create_hr_user_on_signup jalan
        await new Promise((r) => setTimeout(r, 1000));

        const { error: autoLoginError } =
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });

        if (autoLoginError)
          throw new Error(autoLoginError.message || "Auto-login failed.");

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Failed to retrieve user session.");

        const { data: hr } = await supabase
          .from("hr_users")
          .select("approved, role, name")
          .eq("id", user.id)
          .maybeSingle();

        if (!hr) {
          await showAlert(
            "warning",
            "Almost there!",
            "Your account was created, but the system may take a few seconds to sync. Try logging in again shortly."
          );
          return;
        }

        if (!hr.approved) {
          await showAlert(
            "info",
            "Registration Successful!",
            "Your account has been created but is pending admin approval."
          );
          setIsLogin(true);
          return;
        }

        await MySwal.fire({
          icon: "success",
          title: `Welcome, ${hr.name || "Admin"}!`,
          text: "Redirecting to dashboard...",
          timer: 1800,
          showConfirmButton: false,
          background: "#fff",
          customClass: { popup: "!z-[9999]" },
        });

        setOpen(false);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);

      let message = "Unexpected error occurred.";
      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;
      else if (typeof err === "object" && err !== null && "message" in err) {
        message = String((err as { message?: string }).message);
      }

      await showAlert("error", "Oops!", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Get Started (HR)
        </Button>
      </DialogTrigger>

      {/* Modal Auth */}
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()} // cegah SweetAlert nutup dialog
      >
        <DialogHeader>
          <DialogTitle>
            {isLogin ? "Login HR" : "Register HR Account"}
          </DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Welcome back! Please login to access your dashboard."
              : "Create your HR account. The first registered user becomes admin, others require approval."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="hr@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Logging in..."
                : "Registering..."
              : isLogin
              ? "Login"
              : "Register"}
          </Button>

          <p className="text-center text-sm mt-2">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-indigo-600 hover:underline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-indigo-600 hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
