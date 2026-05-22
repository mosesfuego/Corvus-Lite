"use client";

import { EmptyRecords } from "@/components/core/empty-records";
import { CreateRfqForm } from "@/components/rfqs/create-rfq-form";
import { StatusPill } from "@/components/ui/status-pill";
import { useCompanyContext } from "@/context/CompanyContext";
import { useCoreRecords } from "@/hooks/useCoreRecords";
import type { CreateRfqInput } from "@/lib/firebase/operations";
import { Bot, FileText, PlusCircle } from "lucide-react";
import Link from "next/link";

const simulatedRfq: CreateRfqInput = {
  rfqNumber: "RFQ-2026-DEMO",
  customerName: "Acme Robotics",
  contactName: "Dana Wilson",
  contactEmail: "dana@acmerobotics.example",
  partName: "Sensor bracket",
  partNumber: "ARB-17",
  revision: "C",
  quantity: 100,
  material: "6061-T6 aluminum",
  requestedDueDate: "2026-06-14",
  sourceText:
    "Hi Marcus, can you quote 100 pcs of ARB-17 sensor bracket Rev C in 6061-T6 aluminum? Drawing PDF attached. We'd like delivery around June 14 if possible. Black anodize may be required, please call that out separately. - Dana",
  notes:
    "Admin-created simulated RFQ. This is the fixture for the future intake extraction worker demo.",
};

export function RfqsPageContent() {
  const { profile } = useCompanyContext();
  const { addRfq, error, loading, rfqs, seedDemo } = useCoreRecords();
  const isAdmin = profile?.role === "admin";

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading RFQs...</div>;
  }

  async function createSimulatedRfq() {
    await addRfq(simulatedRfq);
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Intake desk
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">RFQs</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Paste messy customer requests and let Corvus draft the RFQ package.
            Human-reviewed fields are saved only after you inspect the draft.
          </p>
        </div>

        {isAdmin ? (
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
            onClick={() => void createSimulatedRfq()}
            type="button"
          >
            <Bot size={16} />
            Simulate RFQ
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {rfqs.length === 0 ? (
        <EmptyRecords
          onSeed={seedDemo}
          showSeed={isAdmin}
          title="No RFQs in Firestore yet"
        />
      ) : (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_460px]">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">
                Intake queue
              </h2>
              <span className="text-xs font-medium text-slate-400">
                {rfqs.length} RFQ{rfqs.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-3">
              {rfqs.map((rfq) => (
                <Link
                  className="block rounded-lg border border-slate-200 p-4 transition hover:border-teal-200 hover:bg-teal-50/40"
                  href={`/rfqs/${rfq.id}`}
                  key={rfq.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="text-teal-700" size={17} />
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {rfq.rfqNumber} / {rfq.customerName}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {rfq.partName} Rev {rfq.revision} / Qty {rfq.quantity} /{" "}
                        {rfq.material || "material not set"}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {rfq.sourceText}
                      </p>
                    </div>
                    <StatusPill
                      tone={
                        rfq.missingInfo && rfq.missingInfo.length > 0
                          ? "medium"
                          : "low"
                      }
                    >
                      {rfq.status.replaceAll("_", " ")}
                    </StatusPill>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <CreateRfqForm onCreate={addRfq} />
        </div>
      )}

      {rfqs.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <PlusCircle size={16} />
            Thursday scope
          </div>
          <p className="mt-2 leading-6">
            Today this is paste-first intake plus admin simulation. The future
            email intake worker can watch an inbox, classify likely RFQs, and
            route draft intake packages here without copy/paste.
          </p>
        </div>
      ) : null}
    </div>
  );
}
