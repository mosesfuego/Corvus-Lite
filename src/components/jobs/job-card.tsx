import { StatusPill } from "@/components/ui/status-pill";
import type { Job } from "@/types/core";
import Link from "next/link";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      className="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-teal-300 hover:shadow-md"
      href={`/jobs/${job.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-950">
            Job {job.jobNumber}
          </div>
          <div className="mt-1 text-xs text-slate-500">{job.customer}</div>
        </div>
        <StatusPill tone={job.risk}>{job.risk}</StatusPill>
      </div>
      <div className="mt-3 text-xs text-slate-600">
        {job.part} / Rev {job.revision}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Due {job.dueDate || "not set"}</span>
        <span>
          {job.quantityComplete}/{job.quantityTotal}
        </span>
      </div>
      {job.issueCount > 0 ? (
        <div className="mt-3 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
          {job.issueCount} issue{job.issueCount === 1 ? "" : "s"}
        </div>
      ) : null}
    </Link>
  );
}
