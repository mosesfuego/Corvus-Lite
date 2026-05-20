"use client";

import { signOutCurrentUser } from "@/lib/firebase/auth";
import { useCompanyContext } from "@/context/CompanyContext";
import {
  ClipboardList,
  Factory,
  FileText,
  Gauge,
  LogOut,
  PackageCheck,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/command-center", label: "Command Center", icon: Gauge },
  { href: "/jobs", label: "Jobs", icon: ClipboardList },
  { href: "/command-center", label: "Shop Floor", icon: Factory },
  { href: "/command-center", label: "Quality", icon: ShieldCheck },
  { href: "/command-center", label: "Customers", icon: Users },
  { href: "/command-center", label: "Files", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { company, profile } = useCompanyContext();

  async function handleSignOut() {
    await signOutCurrentUser();
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <Link href="/command-center" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
            <PackageCheck size={20} />
          </div>
          <div>
            <div className="text-base font-semibold text-slate-950">
              Corvus Lite
            </div>
            <div className="text-xs text-slate-500">
              {company?.name ?? "Shop control panel"}
            </div>
          </div>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="mt-8 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          onClick={handleSignOut}
          type="button"
        >
          <LogOut size={18} />
          Sign out
        </button>

        {profile ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Signed in as
            </div>
            <div className="mt-1 truncate text-sm font-medium text-slate-800">
              {profile.displayName || profile.email}
            </div>
            <div className="mt-1 text-xs capitalize text-slate-500">
              {profile.role}
            </div>
          </div>
        ) : null}
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
