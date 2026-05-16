import Link from "next/link";
import { ArrowRight, Gauge, MessageSquare, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <div className="text-lg font-semibold text-slate-950">Corvus Lite</div>
          <div className="text-xs text-slate-500">Shop-floor clarity</div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            href="/signin"
          >
            Sign in
          </Link>
          <Link
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            href="/signup"
          >
            Create account
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-92px)] max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_520px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Machine shop command center
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-slate-950">
            Know every job, issue, file, and handoff without buying an MES.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Corvus Lite is the lightweight operations control panel for shops
            that still run on drawings, travelers, spreadsheets, chat, and
            human judgment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              href="/signup"
            >
              Start the shop setup
              <ArrowRight size={17} />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              href="/command-center"
            >
              View demo dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="text-sm font-semibold text-slate-950">
                Today&apos;s Shop Pulse
              </div>
              <div className="text-xs text-slate-500">Demo command center</div>
            </div>
            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
              Live soon
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Active", "42"],
              ["At risk", "7"],
              ["Issues", "4"],
            ].map(([label, value]) => (
              <div className="rounded-lg bg-slate-50 p-3" key={label}>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {[
              [Gauge, "Job 1048 is in progress on Haas VF-2."],
              [ShieldCheck, "Job 1055 is waiting on final inspection."],
              [MessageSquare, "Corvus can ask staff short status questions."],
            ].map(([Icon, text]) => {
              const TypedIcon = Icon as typeof Gauge;
              return (
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3" key={text as string}>
                  <TypedIcon className="text-teal-700" size={18} />
                  <span className="text-sm text-slate-700">{text as string}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
