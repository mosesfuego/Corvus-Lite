import { demoJobs } from "@/lib/demo/shop-data";
import Link from "next/link";

export default function JobsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Jobs</h1>
          <p className="mt-2 text-sm text-slate-600">
            Early scaffold for the Corvus Lite job list.
          </p>
        </div>
        <Link
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          href="/command-center"
        >
          Command Center
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {demoJobs.map((job) => (
          <div
            className="grid gap-3 border-b border-slate-100 p-4 text-sm last:border-b-0 md:grid-cols-[110px_1fr_150px_120px]"
            key={job.id}
          >
            <div className="font-semibold text-slate-950">Job {job.jobNumber}</div>
            <div>
              <div className="font-medium text-slate-800">{job.customer}</div>
              <div className="text-slate-500">
                {job.part} / Rev {job.revision}
              </div>
            </div>
            <div className="text-slate-600">{job.stage}</div>
            <div className="text-slate-600">Due {job.dueDate}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
