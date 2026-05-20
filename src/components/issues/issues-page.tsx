"use client";

import { EmptyRecords } from "@/components/core/empty-records";
import { useCoreRecords } from "@/hooks/useCoreRecords";
import type { RiskLevel } from "@/types/core";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function IssuesPageContent() {
  const { addIssue, closeIssue, issues, jobs, loading, seedDemo } =
    useCoreRecords();
  const [title, setTitle] = useState("");
  const [jobId, setJobId] = useState("");
  const [severity, setSeverity] = useState<RiskLevel>("medium");
  const [owner, setOwner] = useState("");
  const [type, setType] = useState("Waiting on material");
  const [notes, setNotes] = useState("");

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading issues...</div>;
  }

  const selectedJob = jobs.find((job) => job.id === jobId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await addIssue({
      jobId: jobId || undefined,
      title,
      severity,
      target: selectedJob ? `Job ${selectedJob.jobNumber}` : "Sitewide",
      owner,
      type,
      notes,
    });

    setTitle("");
    setJobId("");
    setSeverity("medium");
    setOwner("");
    setType("Waiting on material");
    setNotes("");
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-950">Issues</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Issues are the broader, MES-like way to log bottlenecks against jobs,
          machines, or the whole shop.
        </p>
      </div>

      {jobs.length === 0 && issues.length === 0 ? (
        <EmptyRecords onSeed={seedDemo} title="No jobs or issues yet" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Open issues</h2>
            <div className="mt-4 space-y-3">
              {issues.map((issue) => (
                <div
                  className="rounded-lg border border-slate-200 p-4"
                  key={issue.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      {issue.status === "resolved" ? (
                        <CheckCircle2 className="text-teal-700" size={18} />
                      ) : (
                        <AlertTriangle className="text-amber-600" size={18} />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">
                          {issue.title}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {issue.target} / {issue.owner || "Unassigned"} /{" "}
                          {issue.severity}
                        </div>
                        {issue.notes ? (
                          <p className="mt-2 text-sm text-slate-600">
                            {issue.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {issue.status === "open" ? (
                      <button
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                        onClick={() => void closeIssue(issue)}
                        type="button"
                      >
                        Resolve
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <form
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            onSubmit={handleSubmit}
          >
            <h2 className="text-lg font-semibold text-slate-950">Create issue</h2>
            <div className="mt-4 space-y-3">
              <Input label="Title" onChange={setTitle} required value={title} />
              <label className="block text-sm font-medium text-slate-700">
                Attach to job
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) => setJobId(event.target.value)}
                  value={jobId}
                >
                  <option value="">Sitewide</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      Job {job.jobNumber} / {job.customer}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Severity
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) => setSeverity(event.target.value as RiskLevel)}
                  value={severity}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <Input label="Owner" onChange={setOwner} value={owner} />
              <Input label="Type" onChange={setType} value={type} />
              <label className="block text-sm font-medium text-slate-700">
                Notes
                <textarea
                  className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) => setNotes(event.target.value)}
                  value={notes}
                />
              </label>
            </div>
            <button
              className="mt-4 w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              type="submit"
            >
              Create issue
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  onChange,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      />
    </label>
  );
}
