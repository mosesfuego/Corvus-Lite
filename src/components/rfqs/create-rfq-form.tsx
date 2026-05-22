"use client";

import type { CreateRfqInput } from "@/lib/firebase/operations";
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
  const [form, setForm] = useState<CreateRfqInput>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h2 className="text-lg font-semibold text-slate-950">Create RFQ</h2>
      <p className="mt-1 text-sm text-slate-500">
        Manual intake today. The RFQ extraction worker will later draft these
        fields from pasted emails and document text.
      </p>

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
        Pasted email / request text
        <textarea
          className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          onChange={(event) => updateField("sourceText", event.target.value)}
          required
          value={form.sourceText}
        />
      </label>

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
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create RFQ"}
        </button>
      </div>
    </form>
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
