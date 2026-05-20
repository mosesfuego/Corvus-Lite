"use client";

import { useCompanyContext } from "@/context/CompanyContext";
import { updateCapabilityProfile } from "@/lib/firebase/company";
import { joinList, splitList } from "@/lib/forms";
import type { CapabilityProfile } from "@/types/core";
import { useEffect, useState } from "react";

type CapabilityDraft = Omit<
  CapabilityProfile,
  "id" | "companyId" | "createdAt" | "updatedAt"
>;

function emptyDraft(): CapabilityDraft {
  return {
    machines: [],
    materialsSupported: [],
    materialsAvoided: [],
    inHouseProcesses: [],
    outsideProcesses: [],
    inspectionEquipment: [],
    certifications: [],
    preferredWork: "",
    workToAvoid: "",
    toleranceComfort: "",
    notes: "",
  };
}

export function ShopSettings() {
  const { company, capabilityProfile, staff, refreshCompanyContext } =
    useCompanyContext();
  const [draft, setDraft] = useState<CapabilityDraft>(emptyDraft());
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (capabilityProfile) {
      setDraft({
        machines: capabilityProfile.machines ?? [],
        materialsSupported: capabilityProfile.materialsSupported ?? [],
        materialsAvoided: capabilityProfile.materialsAvoided ?? [],
        inHouseProcesses: capabilityProfile.inHouseProcesses ?? [],
        outsideProcesses: capabilityProfile.outsideProcesses ?? [],
        inspectionEquipment: capabilityProfile.inspectionEquipment ?? [],
        certifications: capabilityProfile.certifications ?? [],
        preferredWork: capabilityProfile.preferredWork ?? "",
        workToAvoid: capabilityProfile.workToAvoid ?? "",
        toleranceComfort: capabilityProfile.toleranceComfort ?? "",
        notes: capabilityProfile.notes ?? "",
      });
    }
  }, [capabilityProfile]);

  function updateListField(field: keyof CapabilityDraft, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: splitList(value),
    }));
  }

  function updateTextField(field: keyof CapabilityDraft, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSavedMessage(null);

    if (!company) {
      setError("No company profile found.");
      return;
    }

    setIsSaving(true);

    try {
      await updateCapabilityProfile(company.id, draft);
      await refreshCompanyContext();
      setSavedMessage("Capability profile saved.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save capability profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Shop setup
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          The company profile and capability document are the grounding layer for
          future RFQ intake and capability checks.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Company</h2>
            {company ? (
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label="Name" value={company.name} />
                <InfoRow label="Shop type" value={company.shopType} />
                <InfoRow label="Contact" value={company.mainContactName} />
                <InfoRow label="Email" value={company.mainContactEmail} />
                <InfoRow label="Timezone" value={company.timezone} />
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No company found.</p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Staff</h2>
            <div className="mt-4 space-y-3">
              {staff.map((staffMember) => (
                <div className="rounded-lg bg-slate-50 p-3" key={staffMember.id}>
                  <div className="text-sm font-semibold text-slate-800">
                    {staffMember.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {staffMember.email || "No email"} / {staffMember.role}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSave}
        >
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Capability profile
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Use commas or new lines. This stays human-editable.
              </p>
            </div>
            <button
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save capability profile"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextArea
              label="Machines"
              onChange={(value) => updateListField("machines", value)}
              value={joinList(draft.machines)}
            />
            <TextArea
              label="Materials supported"
              onChange={(value) => updateListField("materialsSupported", value)}
              value={joinList(draft.materialsSupported)}
            />
            <TextArea
              label="Materials avoided"
              onChange={(value) => updateListField("materialsAvoided", value)}
              value={joinList(draft.materialsAvoided)}
            />
            <TextArea
              label="In-house processes"
              onChange={(value) => updateListField("inHouseProcesses", value)}
              value={joinList(draft.inHouseProcesses)}
            />
            <TextArea
              label="Outside processes"
              onChange={(value) => updateListField("outsideProcesses", value)}
              value={joinList(draft.outsideProcesses)}
            />
            <TextArea
              label="Inspection equipment"
              onChange={(value) => updateListField("inspectionEquipment", value)}
              value={joinList(draft.inspectionEquipment)}
            />
            <TextArea
              label="Certifications"
              onChange={(value) => updateListField("certifications", value)}
              value={joinList(draft.certifications)}
            />
            <TextArea
              label="Tolerance comfort"
              onChange={(value) => updateTextField("toleranceComfort", value)}
              value={draft.toleranceComfort}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextArea
              label="Preferred work"
              onChange={(value) => updateTextField("preferredWork", value)}
              value={draft.preferredWork}
            />
            <TextArea
              label="Work to avoid"
              onChange={(value) => updateTextField("workToAvoid", value)}
              value={draft.workToAvoid}
            />
          </div>

          <div className="mt-4">
            <TextArea
              label="General notes"
              onChange={(value) => updateTextField("notes", value)}
              value={draft.notes}
            />
          </div>

          {savedMessage ? (
            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              {savedMessage}
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </form>
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
      <dd className="mt-1 text-slate-700">{value || "Not set"}</dd>
    </div>
  );
}

function TextArea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <textarea
        className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}
