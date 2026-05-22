"use client";

import { JobFlow } from "@/components/dashboard/job-flow";
import { EmptyRecords } from "@/components/core/empty-records";
import { JobCard } from "@/components/jobs/job-card";
import { StatusPill } from "@/components/ui/status-pill";
import { useCompanyContext } from "@/context/CompanyContext";
import { useCoreRecords } from "@/hooks/useCoreRecords";
import type { JobStatus } from "@/types/core";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Inbox,
  Sparkles,
  MessageSquare,
  Search,
} from "lucide-react";
import Link from "next/link";

const boardColumns: Array<{ label: string; statuses: JobStatus[] }> = [
  { label: "Ready", statuses: ["ready", "queued"] },
  { label: "In Progress", statuses: ["in_progress"] },
  { label: "Blocked", statuses: ["blocked"] },
  { label: "Inspection", statuses: ["inspection"] },
  { label: "Ready to Ship", statuses: ["ready_to_ship"] },
];

export function CommandCenter() {
  const { company, profile } = useCompanyContext();
  const { activityEvents, error, issues, jobs, loading, rfqs, seedDemo } =
    useCoreRecords();
  const selectedJob = jobs[0];
  const isAdmin = profile?.role === "admin";
  const openIssues = issues.filter((issue) => issue.status === "open");
  const waitingInspection = jobs.filter((job) => job.status === "inspection");
  const readyToShip = jobs.filter((job) => job.status === "ready_to_ship");
  const atRisk = jobs.filter((job) => job.risk !== "low");
  const metrics = [
    {
      label: "RFQs",
      value: String(rfqs.length),
      detail: "Intake packages",
      accent: "border-t-teal-500",
    },
    {
      label: "Active Jobs",
      value: String(jobs.length),
      detail: "In the shop board",
      accent: "border-t-slate-500",
    },
    {
      label: "At Risk",
      value: String(atRisk.length),
      detail: "Medium/high risk",
      accent: "border-t-amber-500",
    },
    {
      label: "Open Issues",
      value: String(openIssues.length),
      detail: "Job or machine issues",
      accent: "border-t-red-500",
    },
    {
      label: "Waiting Inspection",
      value: String(waitingInspection.length),
      detail: "Quality handoffs",
      accent: "border-t-sky-500",
    },
    {
      label: "Ready to Ship",
      value: String(readyToShip.length),
      detail: "Shipping queue",
      accent: "border-t-emerald-500",
    },
  ];

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading Command Center...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Shop pulse
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Good morning, {profile?.displayName?.split(" ")[0] || "manager"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {company?.name
              ? `${company.name} is set up. Corvus is ready to track active jobs, open issues, quality handoffs, and shipping readiness.`
              : "Corvus is ready to track active jobs, open issues, quality handoffs, and shipping readiness."}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
          <Search size={17} />
          <span className="min-w-64">Search jobs, customers, files...</span>
        </div>
      </header>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {jobs.length === 0 ? (
        <EmptyRecords
          onSeed={seedDemo}
          showSeed={isAdmin}
          title="Command Center needs records"
        />
      ) : null}

      <section className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div
            className={`rounded-lg border border-t-2 border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${metric.accent}`}
            key={metric.label}
          >
            <div className="text-sm font-medium text-slate-500">{metric.label}</div>
            <div className="mt-3 text-3xl font-semibold text-slate-950">
              {metric.value}
            </div>
            <div className="mt-2 text-xs text-slate-500">{metric.detail}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Job flow: Job {selectedJob?.jobNumber ?? "not selected"}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedJob
                    ? `${selectedJob.customer} / ${selectedJob.part}`
                    : "Seed or create a job to see its stage flow."}
                </p>
              </div>
              {selectedJob ? (
                <StatusPill tone={selectedJob.risk}>{selectedJob.risk} risk</StatusPill>
              ) : null}
            </div>
            {selectedJob ? (
              <JobFlow
                currentStage={selectedJob.stage}
                hasIssue={selectedJob.issueCount > 0}
              />
            ) : null}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">Jobs board</h2>
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                href="/jobs"
              >
                <ClipboardList size={16} />
                Jobs
              </Link>
            </div>

            <div className="grid gap-3 xl:grid-cols-5">
              {boardColumns.map((column) => {
                const columnJobs = jobs.filter((job) =>
                  column.statuses.includes(job.status),
                );

                return (
                  <div className="rounded-lg bg-slate-50 p-3" key={column.label}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">
                        {column.label}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {columnJobs.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {columnJobs.map((job) => (
                        <JobCard job={job} key={job.id} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="text-teal-700" size={18} />
              <h2 className="text-lg font-semibold text-slate-950">Shop Pulse</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {jobs.length} active job{jobs.length === 1 ? "" : "s"},{" "}
              {openIssues.length} open issue
              {openIssues.length === 1 ? "" : "s"},{" "}
              {waitingInspection.length} waiting inspection, and{" "}
              {readyToShip.length} ready to ship.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                href="/rfqs"
              >
                <Inbox size={15} />
                RFQs
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                href="/jobs"
              >
                Open jobs
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                href="/issues"
              >
                Open issues
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Open issues</h2>
            <div className="mt-4 space-y-3">
              {openIssues.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                  No open issues. Nice and quiet.
                </p>
              ) : (
                openIssues.slice(0, 4).map((issue) => (
                  <div
                    className="rounded-lg border border-slate-200 p-3 transition hover:border-amber-200 hover:bg-amber-50/40"
                    key={issue.id}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 text-amber-600" size={16} />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {issue.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {issue.target} / {issue.owner}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Activity</h2>
            <div className="mt-4 space-y-4">
              {activityEvents.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                  Activity will appear here as jobs, issues, and handoffs move.
                </p>
              ) : (
                activityEvents.slice(0, 5).map((event) => (
                  <div className="flex gap-3" key={event.id}>
                    <MessageSquare className="mt-0.5 text-teal-700" size={16} />
                    <div>
                      <div className="text-sm text-slate-700">{event.message}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {event.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-900">
              View timeline
              <ArrowRight size={15} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
