"use client";

import { EmptyRecords } from "@/components/core/empty-records";
import { CreateJobForm } from "@/components/jobs/create-job-form";
import { JobCard } from "@/components/jobs/job-card";
import { useCompanyContext } from "@/context/CompanyContext";
import { useCoreRecords } from "@/hooks/useCoreRecords";
import type { JobStatus } from "@/types/core";

const boardColumns: Array<{ label: string; statuses: JobStatus[] }> = [
  { label: "Ready", statuses: ["ready", "queued"] },
  { label: "In Progress", statuses: ["in_progress"] },
  { label: "Blocked", statuses: ["blocked"] },
  { label: "Inspection", statuses: ["inspection"] },
  { label: "Ready to Ship", statuses: ["ready_to_ship"] },
];

export function JobsPageContent() {
  const { profile } = useCompanyContext();
  const { addJob, error, jobs, loading, seedDemo } = useCoreRecords();
  const isAdmin = profile?.role === "admin";

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading jobs...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Jobs</h1>
          <p className="mt-2 text-sm text-slate-600">
            Real Firestore-backed job board for the shop control panel.
          </p>
        </div>
        {isAdmin && jobs.length > 0 ? (
          <button
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            onClick={() => void seedDemo()}
            type="button"
          >
            Seed demo records
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {jobs.length === 0 ? (
        <EmptyRecords
          onSeed={seedDemo}
          showSeed={isAdmin}
          title="No jobs in Firestore yet"
        />
      ) : (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 xl:grid-cols-5">
              {boardColumns.map((column) => {
                const columnJobs = jobs.filter((job) =>
                  column.statuses.includes(job.status),
                );

                return (
                  <div className="rounded-lg bg-slate-50 p-3" key={column.label}>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-700">
                        {column.label}
                      </h2>
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

          <CreateJobForm onCreate={addJob} />
        </div>
      )}
    </div>
  );
}
