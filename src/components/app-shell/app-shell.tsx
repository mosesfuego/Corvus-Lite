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
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/issues", label: "Issues", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/command-center", label: "Shop Floor", icon: Factory, soon: true },
  { href: "/command-center", label: "Quality", icon: ShieldCheck, soon: true },
  { href: "/command-center", label: "Files", icon: FileText, soon: true },
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
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5 shadow-[1px_0_0_rgba(15,23,42,0.02)] lg:block">
        <Link
          href="/command-center"
          className="mb-7 flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-teal-200 hover:bg-teal-50/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <PackageCheck size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-950">
              Corvus Lite
            </div>
            <div className="truncate text-xs text-slate-500">
              {company?.name ?? "Shop control panel"}
            </div>
          </div>
        </Link>

        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              !item.soon &&
              (pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <Link
                href={item.href}
                key={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-teal-200 bg-teal-50 text-slate-950 shadow-sm shadow-teal-950/5"
                    : "border-transparent text-slate-600 hover:border-teal-200 hover:bg-white hover:text-slate-950 hover:shadow-sm hover:shadow-slate-950/5"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                    isActive
                      ? "border-teal-200 bg-white text-teal-700"
                      : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-teal-200 group-hover:bg-teal-50 group-hover:text-teal-700"
                  }`}
                >
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.soon ? (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 group-hover:border-teal-200 group-hover:text-teal-700">
                    Soon
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <button
          className="mt-8 flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          onClick={handleSignOut}
          type="button"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
            <LogOut size={17} />
          </span>
          Sign out
        </button>

        {profile ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
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
