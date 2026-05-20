"use client";

import { JobFlow } from "@/components/dashboard/job-flow";
import { StatusPill } from "@/components/ui/status-pill";
import { useCoreRecords } from "@/hooks/useCoreRecords";
import { jobStages } from "@/lib/demo/shop-data";
import type { JobStage, JobStatus, RiskLevel } from "@/types/core";
import Link from "next/link";
import { useState } from "react";

const statuses: JobStatus[] = [
  "ready",
  "queued",
  "in_progress",
  "blocked",
  "inspection",
  "ready_to_ship",
  "shipped",
];

const risks: RiskLevel[] = ["low", "medium", "high"];

export function JobDetailPageContent({ jobId }: { jobId: string }) {
  const {
    activityEvents,
    addIssue,
    closeIssue,
    jobs,
    issues,
    loading,
    setJobState,
  } = useCoreRecords();
  const job = jobs.find((item) => item.id === jobId);
  const jobIssues = issues.filter((issue) => issue.jobId === jobId);
  const jobActivity = activityEvents.filter((event) => event.jobId === jobId);
  const [issueTitle, setIssueTitle] = useState("");

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading job...</div>;
  }

  if (!job) {
    return (
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold text-slate-950">Job not found</h1>
        <Link className="mt-4 inline-block text-sm font-semibold text-teal-700" href="/jobs">
          Back to jobs
        </Link>
      </div>
    );
  }

  async function handleCreateIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!job || !issueTitle.trim()) {
      return;
    }

    await addIssue({
      jobId: job.id,
      title: issueTitle,
      severity: "medium",
      target: `Job ${job.jobNumber}`,
      owner: job.owner,
      type: "Job issue",
    });
    setIssueTitle("");
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link className="text-sm font-semibold text-teal-700" href="/jobs">
            Back to jobs
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Job {job.jobNumber}: {job.part}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {job.customer} / Rev {job.revision} / Due {job.dueDate || "not set"}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusPill tone={job.risk}>{job.risk} risk</StatusPill>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium capitalize text-slate-700">
            {job.status.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <JobFlow
          currentStage={job.stage}
          hasIssue={jobIssues.some((issue) => issue.status === "open")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Job state</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Stage
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) =>
                    void setJobState(job, { stage: event.target.value as JobStage })
                  }
                  value={job.stage}
                >
                  {jobStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Status
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) =>
                    void setJobState(job, { status: event.target.value as JobStatus })
                  }
                  value={job.status}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Quantity complete
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  max={job.quantityTotal}
                  min={0}
                  onChange={(event) =>
                    void setJobState(job, {
                      quantityComplete: Number(event.target.value),
                    })
                  }
                  type="number"
                  value={job.quantityComplete}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Risk
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) =>
                    void setJobState(job, { risk: event.target.value as RiskLevel })
                  }
                  value={job.risk}
                >
                  {risks.map((risk) => (
                    <option key={risk} value={risk}>
                      {risk}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Activity timeline</h2>
            <div className="mt-4 space-y-4">
              {jobActivity.length === 0 ? (
                <p className="text-sm text-slate-500">No job activity yet.</p>
              ) : (
                jobActivity.map((event) => (
                  <div className="border-l-2 border-teal-200 pl-3" key={event.id}>
                    <div className="text-sm text-slate-800">{event.message}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {event.timestamp}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <InfoRow label="Owner" value={job.owner || "Unassigned"} />
              <InfoRow label="Machine" value={job.machine || "Unassigned"} />
              <InfoRow
                label="Quantity"
                value={`${job.quantityComplete}/${job.quantityTotal}`}
              />
              <InfoRow label="Notes" value={job.notes || "No notes"} />
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Issues</h2>
            <form className="mt-3 flex gap-2" onSubmit={handleCreateIssue}>
              <input
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) => setIssueTitle(event.target.value)}
                placeholder="What's blocking this job?"
                value={issueTitle}
              />
              <button
                className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
                type="submit"
              >
                Add
              </button>
            </form>
            <div className="mt-4 space-y-3">
              {jobIssues.map((issue) => (
                <div
                  className="rounded-lg border border-slate-200 p-3 text-sm"
                  key={issue.id}
                >
                  <div className="font-semibold text-slate-800">{issue.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {issue.status} / {issue.severity}
                  </div>
                  {issue.status === "open" ? (
                    <button
                      className="mt-3 text-xs font-semibold text-teal-700"
                      onClick={() => void closeIssue(issue)}
                      type="button"
                    >
                      Resolve issue
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-slate-700">{value}</dd>
    </div>
  );
}
