"use client";

import type { CreateJobInput } from "@/lib/firebase/operations";
import { useState } from "react";

const initialForm: CreateJobInput = {
  jobNumber: "",
  customer: "",
  part: "",
  revision: "A",
  dueDate: "",
  owner: "",
  machine: "",
  quantityTotal: 1,
  notes: "",
};

export function CreateJobForm({
  onCreate,
}: {
  onCreate: (input: CreateJobInput) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateJobInput>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof CreateJobInput>(
    field: K,
    value: CreateJobInput[K],
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
        quantityTotal: Number(form.quantityTotal) || 1,
      });
      setForm(initialForm);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to create job.",
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
      <h2 className="text-lg font-semibold text-slate-950">Create job</h2>
      <p className="mt-1 text-sm text-slate-500">
        This is a lightweight manual job entry until RFQ/PO flow lands in Chunk 3.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Input
          label="Job number"
          onChange={(value) => updateField("jobNumber", value)}
          required
          value={form.jobNumber}
        />
        <Input
          label="Customer"
          onChange={(value) => updateField("customer", value)}
          required
          value={form.customer}
        />
        <Input
          label="Part"
          onChange={(value) => updateField("part", value)}
          required
          value={form.part}
        />
        <Input
          label="Revision"
          onChange={(value) => updateField("revision", value)}
          value={form.revision}
        />
        <Input
          label="Due date"
          onChange={(value) => updateField("dueDate", value)}
          type="date"
          value={form.dueDate}
        />
        <Input
          label="Owner"
          onChange={(value) => updateField("owner", value)}
          value={form.owner}
        />
        <Input
          label="Machine"
          onChange={(value) => updateField("machine", value)}
          value={form.machine ?? ""}
        />
        <Input
          label="Quantity"
          min={1}
          onChange={(value) => updateField("quantityTotal", Number(value))}
          type="number"
          value={String(form.quantityTotal)}
        />
      </div>

      <label className="mt-3 block text-sm font-medium text-slate-700">
        Notes
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
          {isSubmitting ? "Creating..." : "Create job"}
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
