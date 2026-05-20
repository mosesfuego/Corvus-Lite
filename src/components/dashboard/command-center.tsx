"use client";

import { JobFlow } from "@/components/dashboard/job-flow";
import { StatusPill } from "@/components/ui/status-pill";
import { useCompanyContext } from "@/context/CompanyContext";
import { demoActivity, demoIssues, demoJobs } from "@/lib/demo/shop-data";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileUp,
  MessageSquare,
  ScanLine,
  Search,
} from "lucide-react";

const metrics = [
  { label: "Active Jobs", value: "42", detail: "8 due this week" },
  { label: "At Risk", value: "7", detail: "3 due date risks" },
  { label: "Open Issues", value: "4", detail: "2 machine/material" },
  { label: "Waiting Inspection", value: "5", detail: "1 FAI request" },
  { label: "Ready to Ship", value: "3", detail: "2 need docs" },
];

const boardColumns = [
  { label: "Ready", statuses: ["ready"] },
  { label: "In Progress", statuses: ["in_progress"] },
  { label: "Blocked", statuses: ["blocked"] },
  { label: "Inspection", statuses: ["inspection"] },
  { label: "Ready to Ship", statuses: ["ready_to_ship"] },
];

export function CommandCenter() {
  const selectedJob = demoJobs[0];
  const { company, profile } = useCompanyContext();

  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Friday shop pulse</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Good morning, {profile?.displayName?.split(" ")[0] || "manager"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {company?.name
              ? `${company.name} is set up. Corvus is ready to track active jobs, open issues, quality handoffs, and shipping readiness.`
              : "Corvus is ready to track active jobs, open issues, quality handoffs, and shipping readiness."}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
          <Search size={17} />
          <span className="min-w-64">Search jobs, customers, files...</span>
        </div>
      </header>

      <section className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
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
                  Job flow: Job {selectedJob.jobNumber}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedJob.customer} / {selectedJob.part}
                </p>
              </div>
              <StatusPill tone={selectedJob.risk}>Medium risk</StatusPill>
            </div>
            <JobFlow
              currentStage={selectedJob.stage}
              hasIssue={selectedJob.issueCount > 0}
            />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">Jobs board</h2>
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                <ClipboardList size={16} />
                New RFQ
              </button>
            </div>

            <div className="grid gap-3 xl:grid-cols-5">
              {boardColumns.map((column) => {
                const jobs = demoJobs.filter((job) =>
                  column.statuses.includes(job.status),
                );

                return (
                  <div className="rounded-lg bg-slate-50 p-3" key={column.label}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">
                        {column.label}
                      </h3>
                      <span className="text-xs text-slate-400">{jobs.length}</span>
                    </div>
                    <div className="space-y-3">
                      {jobs.map((job) => (
                        <div
                          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                          key={job.id}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-slate-950">
                                Job {job.jobNumber}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                {job.customer}
                              </div>
                            </div>
                            <StatusPill tone={job.risk}>{job.risk}</StatusPill>
                          </div>
                          <div className="mt-3 text-xs text-slate-600">
                            {job.part} / Rev {job.revision}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>Due {job.dueDate}</span>
                            <span>
                              {job.quantityComplete}/{job.quantityTotal}
                            </span>
                          </div>
                        </div>
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
            <h2 className="text-lg font-semibold text-slate-950">Shop Pulse</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              6 jobs need attention. 2 are blocked by material or machine issues,
              3 are waiting inspection, and Job 1055 has a PO/date mismatch to
              review before release.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                <FileUp size={16} />
                Upload RFQ
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                <ScanLine size={16} />
                Scan traveler
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Open issues</h2>
            <div className="mt-4 space-y-3">
              {demoIssues.map((issue) => (
                <div className="rounded-lg border border-slate-200 p-3" key={issue.id}>
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
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Activity</h2>
            <div className="mt-4 space-y-4">
              {demoActivity.map((event) => (
                <div className="flex gap-3" key={event.id}>
                  <MessageSquare className="mt-0.5 text-teal-700" size={16} />
                  <div>
                    <div className="text-sm text-slate-700">{event.message}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {event.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
              View timeline
              <ArrowRight size={15} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
