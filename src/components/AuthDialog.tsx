"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AuthDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registerType, setRegisterType] = useState<"new" | "join">("new");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    []
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    company_id: "",
  });

  // Fetch list company (for join mode)
  useEffect(() => {
    if (!isLogin) {
      supabase
        .from("companies")
        .select("id, name")
        .then(({ data, error }) => {
          if (!error && data) setCompanies(data);
        });
    }
  }, [isLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      // LOGIN =====================================================
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) setError(error.message);
      else {
        setOpen(false);
        router.push("/dashboard");
      }

      setLoading(false);
      return;
    }

    // REGISTER ==================================================
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: form.email,
        password: form.password,
      }
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setError("Failed to get user ID.");
      setLoading(false);
      return;
    }

    let companyId = form.company_id;

    try {
      // Cek apakah registerType = new
      if (registerType === "new") {
        // 1️⃣ Cek apakah perusahaan sudah ada (case-insensitive)
        const { data: existingCompany } = await supabase
          .from("companies")
          .select("id, name")
          .ilike("name", form.company)
          .maybeSingle();

        if (existingCompany) {
          // sudah ada — pakai id-nya
          companyId = existingCompany.id;
        } else {
          // 2️⃣ belum ada — buat baru
          const { data: newCompany, error: companyError } = await supabase
            .from("companies")
            .insert([{ name: form.company }])
            .select()
            .single();

          if (companyError) throw companyError;
          companyId = newCompany.id;
        }
      }

      // 3️⃣ Tambahkan HR baru ke hr_users
      const { error: hrError } = await supabase.from("hr_users").insert([
        {
          id: userId,
          email: form.email,
          name: form.name,
          role: registerType === "new" ? "admin" : "hr",
          company_id: companyId,
        },
      ]);

      if (hrError) throw hrError;

      alert("✅ Registration successful! Please verify your email.");
      setIsLogin(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Get Started (HR)
        </Button>
      </DialogTrigger>

      {/* Modal */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLogin ? "Login HR" : "Register HR Account"}
          </DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Welcome back! Please login to access your dashboard."
              : "Create or join a company to manage your recruitment process."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!isLogin && (
            <>
              {/* Pilih tipe register */}
              <div>
                <Label>Registration Type</Label>
                <Select
                  value={registerType}
                  onValueChange={(v: "new" | "join") => setRegisterType(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">🧑‍💼 Create New Company</SelectItem>
                    <SelectItem value="join">
                      👥 Join Existing Company
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nama & perusahaan */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {registerType === "new" ? (
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="e.g. NextStep Technologies"
                    value={form.company}
                    onChange={handleChange}
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label>Join Existing Company</Label>
                  <Select
                    value={form.company_id}
                    onValueChange={(v) => setForm({ ...form, company_id: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {/* Email & Password */}
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

          {error && <p className="text-sm text-red-500">{error}</p>}

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
