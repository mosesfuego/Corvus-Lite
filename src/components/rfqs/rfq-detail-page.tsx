"use client";

import { StatusPill } from "@/components/ui/status-pill";
import { useCoreRecords } from "@/hooks/useCoreRecords";
import { ArrowRight, Bot, CheckCircle2, ClipboardList } from "lucide-react";
import Link from "next/link";

export function RfqDetailPageContent({ rfqId }: { rfqId: string }) {
  const { loading, rfqs } = useCoreRecords();
  const rfq = rfqs.find((item) => item.id === rfqId);

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading RFQ...</div>;
  }

  if (!rfq) {
    return (
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold text-slate-950">RFQ not found</h1>
        <Link className="mt-4 inline-block text-sm font-semibold text-teal-700" href="/rfqs">
          Back to RFQs
        </Link>
      </div>
    );
  }

  const hasMissingInfo = Boolean(rfq.missingInfo && rfq.missingInfo.length > 0);

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link className="text-sm font-semibold text-teal-700" href="/rfqs">
            Back to RFQs
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            {rfq.rfqNumber}: {rfq.partName}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {rfq.customerName} / Rev {rfq.revision} / Qty {rfq.quantity}
          </p>
        </div>
        <StatusPill tone={hasMissingInfo ? "medium" : "low"}>
          {rfq.status.replaceAll("_", " ")}
        </StatusPill>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-teal-700" size={18} />
              <h2 className="text-lg font-semibold text-slate-950">
                Structured RFQ package
              </h2>
            </div>
            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              <InfoRow label="Customer" value={rfq.customerName} />
              <InfoRow label="Contact" value={rfq.contactName || "Not provided"} />
              <InfoRow label="Email" value={rfq.contactEmail || "Not provided"} />
              <InfoRow label="Part number" value={rfq.partNumber || "Not provided"} />
              <InfoRow label="Material" value={rfq.material || "Not provided"} />
              <InfoRow
                label="Requested due"
                value={rfq.requestedDueDate || "Not provided"}
              />
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Bot className="text-teal-700" size={18} />
              <h2 className="text-lg font-semibold text-slate-950">
                Agent handoff preview
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The intake extraction worker will read the source request, produce
              structured fields, label missing information, and ask for human
              review before writing to this RFQ.
            </p>
            <div className="mt-4 rounded-lg border border-dashed border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
              Proposed next worker: Intake Extraction Worker
              <ArrowRight className="ml-2 inline" size={15} />
              Capability Check Worker
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Source request
            </h2>
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {rfq.sourceText}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Missing information
            </h2>
            <div className="mt-4 space-y-2">
              {rfq.missingInfo && rfq.missingInfo.length > 0 ? (
                rfq.missingInfo.map((item) => (
                  <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" key={item}>
                    {item}
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
                  <CheckCircle2 size={16} />
                  Basic intake fields are present.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Risk notes</h2>
            <div className="mt-4 space-y-2">
              {rfq.riskNotes && rfq.riskNotes.length > 0 ? (
                rfq.riskNotes.map((item) => (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" key={item}>
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No risk notes yet.</p>
              )}
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
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  );
}
