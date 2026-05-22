"use client";

import type { IntakeExtractionOutput } from "@/agents/intake-extraction/schemas";
import { useCompanyContext } from "@/context/CompanyContext";
import type { CreateRfqInput } from "@/lib/firebase/operations";
import { Bot, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const initialForm: CreateRfqInput = {
  customerName: "",
  contactName: "",
  contactEmail: "",
  partName: "",
  partNumber: "",
  revision: "A",
  quantity: 1,
  material: "",
  requestedDueDate: "",
  sourceText: "",
  notes: "",
};

export function CreateRfqForm({
  onCreate,
}: {
  onCreate: (input: CreateRfqInput) => Promise<void>;
}) {
  const { company } = useCompanyContext();
  const [form, setForm] = useState<CreateRfqInput>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionMessage, setExtractionMessage] = useState<string | null>(null);
  const [extractionOutput, setExtractionOutput] =
    useState<IntakeExtractionOutput | null>(null);
  const missingRequiredFields = getMissingRequiredFields(form);
  const canCreateRfq = missingRequiredFields.length === 0 && !isSubmitting;

  function updateField<K extends keyof CreateRfqInput>(
    field: K,
    value: CreateRfqInput[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onCreate({
        ...form,
        quantity: Number(form.quantity) || 1,
      });
      setForm(initialForm);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to create RFQ.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function runExtraction() {
    setError(null);
    setExtractionMessage(null);
    setIsExtracting(true);

    try {
      if (!company?.id) {
        throw new Error("Company context is still loading.");
      }

      if (!form.sourceText.trim()) {
        throw new Error("Paste the customer email or RFQ request first.");
      }

      const response = await fetch("/api/agents/intake-extraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company.id,
          sourceText: form.sourceText,
          knownCustomerName: form.customerName || undefined,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        output?: IntakeExtractionOutput;
        userMessage?: string;
      };

      if (!response.ok || !payload.output) {
        throw new Error(payload.error || "Unable to extract RFQ fields.");
      }

      const output = payload.output;
      setExtractionOutput(output);
      setExtractionMessage(payload.userMessage || "Review the extracted RFQ draft.");
      setForm((current) => ({
        ...current,
        customerName: output.customerName || current.customerName,
        contactName: output.contactName || current.contactName,
        contactEmail: output.contactEmail || current.contactEmail,
        partName: output.partName || current.partName,
        partNumber: output.partNumber || current.partNumber,
        revision: output.revision || current.revision || "A",
        quantity: output.quantity || current.quantity || 1,
        material: output.material || current.material,
        requestedDueDate: output.requestedDueDate || current.requestedDueDate,
        notes: buildExtractionNotes(output, current.notes),
      }));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to extract RFQ fields.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h2 className="text-lg font-semibold text-slate-950">Create RFQ</h2>
      <p className="mt-1 text-sm text-slate-500">
        Paste the customer email first. Corvus drafts the RFQ fields; you review
        and edit before anything is saved.
      </p>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Customer email / RFQ request
        <textarea
          className="mt-1 min-h-36 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          onChange={(event) => updateField("sourceText", event.target.value)}
          placeholder="Paste the email, forwarded request, or notes from the customer here..."
          required
          value={form.sourceText}
        />
      </label>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isExtracting || !form.sourceText.trim()}
          onClick={() => void runExtraction()}
          type="button"
        >
          <Bot size={16} />
          {isExtracting ? "Reading request..." : "Extract RFQ draft"}
        </button>
        {extractionOutput ? (
          <div className="inline-flex items-center gap-2 text-sm font-medium text-teal-700">
            <CheckCircle2 size={16} />
            {extractionOutput.confidence} confidence draft ready
          </div>
        ) : null}
      </div>

      {extractionMessage ? (
        <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          {extractionMessage}
        </div>
      ) : null}

      {extractionOutput ? <ExtractionSignals output={extractionOutput} /> : null}

      {missingRequiredFields.length > 0 ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <div className="font-semibold">Required before RFQ can be created</div>
          <div className="mt-1">
            Fill manually: {missingRequiredFields.join(", ")}.
          </div>
        </div>
      ) : form.sourceText.trim() ? (
        <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          Required intake fields are present. Review the draft, then create the RFQ.
        </div>
      ) : null}

      <div className="mt-5 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-950">
          Review and edit RFQ draft
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          These fields can be filled by the agent, but the human-reviewed values
          below are what get saved.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Input
          label="Customer"
          onChange={(value) => updateField("customerName", value)}
          required
          value={form.customerName}
        />
        <Input
          label="Contact email"
          onChange={(value) => updateField("contactEmail", value)}
          type="email"
          value={form.contactEmail ?? ""}
        />
        <Input
          label="Contact name"
          onChange={(value) => updateField("contactName", value)}
          value={form.contactName ?? ""}
        />
        <Input
          label="Part name"
          onChange={(value) => updateField("partName", value)}
          required
          value={form.partName}
        />
        <Input
          label="Part number"
          onChange={(value) => updateField("partNumber", value)}
          value={form.partNumber ?? ""}
        />
        <Input
          label="Revision"
          onChange={(value) => updateField("revision", value)}
          value={form.revision}
        />
        <Input
          label="Quantity"
          min={1}
          onChange={(value) => updateField("quantity", Number(value))}
          required
          type="number"
          value={String(form.quantity)}
        />
        <Input
          label="Material"
          onChange={(value) => updateField("material", value)}
          required
          value={form.material}
        />
        <Input
          label="Requested due date"
          onChange={(value) => updateField("requestedDueDate", value)}
          type="date"
          value={form.requestedDueDate ?? ""}
        />
      </div>

      <label className="mt-3 block text-sm font-medium text-slate-700">
        Internal notes
        <textarea
          className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          onChange={(event) => updateField("notes", event.target.value)}
          value={form.notes}
        />
      </label>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!canCreateRfq}
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create RFQ"}
        </button>
      </div>
    </form>
  );
}

function getMissingRequiredFields(form: CreateRfqInput) {
  return [
    form.sourceText.trim() ? null : "customer request text",
    form.customerName.trim() ? null : "customer",
    form.partName.trim() ? null : "part name",
    Number(form.quantity) > 0 ? null : "quantity",
    form.material.trim() ? null : "material",
  ].filter(Boolean) as string[];
}

function buildExtractionNotes(
  output: IntakeExtractionOutput,
  existingNotes?: string,
) {
  const agentNotes = [
    output.missingInfo.length > 0
      ? `Missing info: ${output.missingInfo.join("; ")}`
      : null,
    output.riskNotes.length > 0
      ? `Risk notes: ${output.riskNotes.join("; ")}`
      : null,
    output.finishRequirements && output.finishRequirements.length > 0
      ? `Finish: ${output.finishRequirements.join("; ")}`
      : null,
    output.certRequirements && output.certRequirements.length > 0
      ? `Certs/docs: ${output.certRequirements.join("; ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  if (!agentNotes) {
    return existingNotes ?? "";
  }

  return existingNotes?.trim()
    ? `${existingNotes.trim()}\n\n${agentNotes}`
    : agentNotes;
}

function ExtractionSignals({ output }: { output: IntakeExtractionOutput }) {
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <SignalList title="Missing info" values={output.missingInfo} tone="amber" />
      <SignalList title="Risk notes" values={output.riskNotes} tone="red" />
    </div>
  );
}

function SignalList({
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
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-red-200 bg-red-50 text-red-800";

  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <div className="text-xs font-semibold uppercase tracking-wide">{title}</div>
      <div className="mt-2 space-y-1 text-sm">
        {values.length === 0 ? (
          <div>None flagged.</div>
        ) : (
          values.map((value) => <div key={value}>{value}</div>)
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  min,
  onChange,
  required,
  type = "text",
  value,
}: {
  label: string;
  min?: number;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        min={min}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}
