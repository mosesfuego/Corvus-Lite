"use client";

import { Database } from "lucide-react";

export function EmptyRecords({
  onSeed,
  showSeed = true,
  title = "No shop records yet",
}: {
  onSeed: () => Promise<void>;
  showSeed?: boolean;
  title?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Database size={22} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        Seed a simulated machine shop dataset to populate customers, jobs,
        issues, and activity events. This gives Chunk 2 real Firestore records
        to work with.
      </p>
      {showSeed ? (
        <button
          className="mt-5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => void onSeed()}
          type="button"
        >
          Seed demo shop records
        </button>
      ) : null}
    </div>
  );
}
