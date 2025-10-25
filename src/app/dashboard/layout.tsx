"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ProfileDialog from "@/components/dashboard/ProfileDialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<"admin" | "hr" | null>(null);
  const [hr, setHR] = useState<{
    id: string;
    name: string | null;
    email: string;
    role: string | null;
    avatar_url: string | null;
    approved: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* ✅ Fetch HR login data */
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data: hrData, error } = await supabase
        .from("hr_users")
        .select("id, name, email, role, avatar_url, approved")
        .eq("email", user.email)
        .maybeSingle();

      if (error || !hrData) {
        console.warn("❌ HR record not found for", user.email);
        await supabase.auth.signOut();
        router.push("/");
        return;
      }

      if (!hrData.approved) {
        router.push("/pending-approval");
        return;
      }

      setHR(hrData);
      setRole(hrData.role as "admin" | "hr");
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  /* 🚪 Logout */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  /* 🧠 Tutup dropdown saat klik di luar */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* 🕒 Loading state */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  /* 🔗 Dynamic sidebar links */
  const baseLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
    { href: "/dashboard/candidates", label: "Candidates", icon: Users },
  ];

  const adminLinks = [
    ...baseLinks,
    { href: "/dashboard/team", label: "Team", icon: Users },
    { href: "/dashboard/company", label: "Company", icon: Building2 },
  ];

  const links = role === "admin" ? adminLinks : baseLinks;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar
        links={links}
        pathname={pathname}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-20 flex items-center justify-between px-6 py-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-600 dark:text-gray-300"
          >
            <Menu size={22} />
          </button>

          <h1 className="text-lg font-semibold text-indigo-600 capitalize">
            {pathname.includes("jobs")
              ? "Jobs"
              : pathname.includes("candidates")
              ? "Candidates"
              : pathname.includes("company")
              ? "Company"
              : pathname.includes("team")
              ? "Team"
              : "Dashboard"}
          </h1>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition"
            >
              <span className="hidden sm:block font-semibold">
                {hr?.name ? hr.name.split(" ")[0] : "User"}
              </span>
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
                <Image
                  src={hr?.avatar_url || "/default-avatar.png"}
                  alt="User Avatar"
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setDropdownOpen(false);
                    setOpenProfile(true);
                  }}
                >
                  <User className="h-4 w-4" /> Profile
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="min-h-screen p-6 md:p-8">{children}</div>

        {/* Profile Modal */}
        <ProfileDialog
          open={openProfile}
          onClose={() => setOpenProfile(false)}
          onUpdate={(updated) => {
            setHR((prev) => (prev ? { ...prev, ...updated } : prev));
          }}
        />
      </main>
    </div>
  );
}

/* Sidebar Component */
function Sidebar({
  links,
  pathname,
  sidebarOpen,
  setSidebarOpen,
}: {
  links: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  return (
    <aside
      className={cn(
        "fixed z-40 inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-bold text-indigo-600">NextStep</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-gray-600 dark:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors",
                active &&
                  "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-950/40"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} NextStep
      </div>
    </aside>
  );
}
