"use client";

import type { IntakeExtractionOutput } from "@/agents/intake-extraction/schemas";
import { StatusPill } from "@/components/ui/status-pill";
import { useCoreRecords } from "@/hooks/useCoreRecords";
import { ArrowRight, Bot, CheckCircle2, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ExtractionResponse = {
  status: string;
  output?: IntakeExtractionOutput;
  userMessage: string;
  auditSummary: string;
  requiredConfirmations: string[];
};

export function RfqDetailPageContent({ rfqId }: { rfqId: string }) {
  const { loading, rfqs } = useCoreRecords();
  const rfq = rfqs.find((item) => item.id === rfqId);
  const [extraction, setExtraction] = useState<ExtractionResponse | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

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

  const currentRfq = rfq;
  const hasMissingInfo = Boolean(
    currentRfq.missingInfo && currentRfq.missingInfo.length > 0,
  );

  async function runExtraction() {
    setExtractionError(null);
    setIsExtracting(true);

    try {
      const response = await fetch("/api/agents/intake-extraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: currentRfq.companyId,
          sourceText: currentRfq.sourceText,
          knownCustomerName: currentRfq.customerName,
        }),
      });
      const payload = (await response.json()) as ExtractionResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to run extraction.");
      }

      setExtraction(payload);
    } catch (error) {
      setExtractionError(
        error instanceof Error ? error.message : "Unable to run extraction.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link className="text-sm font-semibold text-teal-700" href="/rfqs">
            Back to RFQs
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            {currentRfq.rfqNumber}: {currentRfq.partName}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {currentRfq.customerName} / Rev {currentRfq.revision} / Qty{" "}
            {currentRfq.quantity}
          </p>
        </div>
        <StatusPill tone={hasMissingInfo ? "medium" : "low"}>
          {currentRfq.status.replaceAll("_", " ")}
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
              <InfoRow label="Customer" value={currentRfq.customerName} />
              <InfoRow
                label="Contact"
                value={currentRfq.contactName || "Not provided"}
              />
              <InfoRow
                label="Email"
                value={currentRfq.contactEmail || "Not provided"}
              />
              <InfoRow
                label="Part number"
                value={currentRfq.partNumber || "Not provided"}
              />
              <InfoRow
                label="Material"
                value={currentRfq.material || "Not provided"}
              />
              <InfoRow
                label="Requested due"
                value={currentRfq.requestedDueDate || "Not provided"}
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
              The intake extraction worker reads the source request, produces
              structured fields, labels missing information, and asks for human
              review before any Firestore write.
            </p>
            <button
              className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isExtracting}
              onClick={() => void runExtraction()}
              type="button"
            >
              {isExtracting ? "Running Kimi..." : "Run RFQ extraction"}
            </button>
            {extractionError ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {extractionError}
              </div>
            ) : null}
            <div className="mt-4 rounded-lg border border-dashed border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
              Proposed next worker: Intake Extraction Worker
              <ArrowRight className="ml-2 inline" size={15} />
              Capability Check Worker
            </div>
            {extraction?.output ? (
              <ExtractionReview extraction={extraction} />
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Source request
            </h2>
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {currentRfq.sourceText}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Missing information
            </h2>
            <div className="mt-4 space-y-2">
              {currentRfq.missingInfo && currentRfq.missingInfo.length > 0 ? (
                currentRfq.missingInfo.map((item) => (
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
              {currentRfq.riskNotes && currentRfq.riskNotes.length > 0 ? (
                currentRfq.riskNotes.map((item) => (
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

function ExtractionReview({ extraction }: { extraction: ExtractionResponse }) {
  const output = extraction.output;

  if (!output) {
    return null;
  }

  const rows: Array<[string, string | undefined]> = [
    ["Customer", output.customerName],
    ["Contact", output.contactName],
    ["Email", output.contactEmail],
    ["Part", output.partName],
    ["Part number", output.partNumber],
    ["Revision", output.revision],
    ["Quantity", output.quantity ? String(output.quantity) : undefined],
    ["Material", output.material],
    ["Requested due", output.requestedDueDate],
  ];

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">
            Human review required
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {extraction.userMessage}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">
          {output.confidence} confidence
        </span>
      </div>

      <dl className="mt-4 grid gap-3 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value || "Not extracted"} />
        ))}
      </dl>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ReviewList title="Missing info" values={output.missingInfo} tone="amber" />
        <ReviewList title="Risk notes" values={output.riskNotes} tone="red" />
      </div>
      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
        {extraction.auditSummary}
      </p>
    </div>
  );
}

function ReviewList({
  title,
  tone,
  values,
}: {
  title: string;
  tone: "amber" | "red";
  values: string[];
}) {
  const color =
    tone === "amber"
      ? "bg-amber-50 text-amber-800"
      : "bg-red-50 text-red-800";

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </div>
      <div className="mt-2 space-y-2">
        {values.length === 0 ? (
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
            None flagged.
          </div>
        ) : (
          values.map((value) => (
            <div className={`rounded-lg px-3 py-2 text-sm ${color}`} key={value}>
              {value}
            </div>
          ))
        )}
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
