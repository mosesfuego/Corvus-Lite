"use client";

import { EmptyRecords } from "@/components/core/empty-records";
import { useCompanyContext } from "@/context/CompanyContext";
import { useCoreRecords } from "@/hooks/useCoreRecords";

export function CustomersPageContent() {
  const { profile } = useCompanyContext();
  const { contacts, customers, loading, seedDemo } = useCoreRecords();
  const isAdmin = profile?.role === "admin";

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading customers...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-950">Customers</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Early customer memory surface. Customers and contacts can be seeded by
          admin, but they also grow naturally as RFQs come in.
        </p>
      </div>

      {customers.length === 0 ? (
        <EmptyRecords
          onSeed={seedDemo}
          showSeed={isAdmin}
          title="No customers yet"
        />
      ) : (
        <div className="space-y-6">
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

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Contacts</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {contacts.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Contacts will appear as RFQs are created.
                </p>
              ) : (
                contacts.map((contact) => (
                  <div
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    key={contact.id}
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {contact.name || "Unnamed contact"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {contact.customerName} / {contact.email}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
