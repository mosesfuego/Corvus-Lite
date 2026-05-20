"use client";

import { EmptyRecords } from "@/components/core/empty-records";
import { useCoreRecords } from "@/hooks/useCoreRecords";

export function CustomersPageContent() {
  const { customers, loading, seedDemo } = useCoreRecords();

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading customers...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-950">Customers</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Early customer memory surface. Chunk 3 will connect customers to RFQs,
          quotes, and POs.
        </p>
      </div>

      {customers.length === 0 ? (
        <EmptyRecords onSeed={seedDemo} title="No customers yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer) => (
            <div
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              key={customer.id}
            >
              <h2 className="text-lg font-semibold text-slate-950">
                {customer.name}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {customer.contactName || "No contact"} /{" "}
                {customer.contactEmail || "No email"}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {customer.notes || "No notes yet."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
