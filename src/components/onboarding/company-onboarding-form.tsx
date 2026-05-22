"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useCompanyContext } from "@/context/CompanyContext";
import { createInitialCompany } from "@/lib/firebase/company";
import { splitList } from "@/lib/forms";
import type { CompanyOnboardingInput, UserRole } from "@/types/core";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type StaffDraft = {
  name: string;
  email: string;
  role: UserRole;
};

const roleOptions: UserRole[] = [
  "admin",
  "manager",
  "staff",
  "inspector",
  "shipping",
];

const defaultStaff: StaffDraft[] = [
  { name: "John Doe", email: "john@ravenprecision.example", role: "staff" },
  {
    name: "Maria Chen",
    email: "maria@ravenprecision.example",
    role: "inspector",
  },
];

const demoShopProfile = {
  companyName: "Raven Precision Works",
  shopType: "CNC machine shop",
  mainContactName: "Marcus Reed",
  timezone: "America/Los_Angeles",
  machines:
    "Haas VF-2 3-axis mill\nDoosan Lynx CNC lathe\nBridgeport manual mill\nManual inspection bench",
  materialsSupported: "6061 aluminum\n7075 aluminum\n304 stainless\n1018 steel\nDelrin",
  materialsAvoided: "Titanium\nInconel\nMagnesium",
  inHouseProcesses: "CNC milling\nCNC turning\nDeburr\nBasic assembly",
  outsideProcesses: "Anodizing\nHeat treat\nBlack oxide\nPassivation\nPlating",
  inspectionEquipment: "Calipers\nMicrometers\nHeight gauge\nBore gauges\nSurface plate",
  certifications: "Certificate of Conformance on request\nMaterial cert tracking",
  preferredWork:
    "Short-run aluminum and stainless parts, brackets, housings, fixtures, and repeat customer jobs.",
  workToAvoid:
    "Aerospace jobs requiring AS9100, exotic materials, ultra-tight tolerances below normal shop comfort, and high-volume production runs.",
  toleranceComfort:
    "Routine: +/- .005. Challenging: +/- .001. Flag anything below +/- .001 or with complex GD&T for human review.",
  notes:
    "Use Corvus to keep RFQs, POs, job status, issues, inspection signoff, and shipping readiness visible without operation-level routing.",
};

export function CompanyOnboardingForm() {
  const { user } = useAuthContext();
  const { refreshCompanyContext } = useCompanyContext();
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [shopType, setShopType] = useState("Machine shop");
  const [mainContactName, setMainContactName] = useState("");
  const [mainContactEmail, setMainContactEmail] = useState(user?.email ?? "");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles",
  );
  const [machines, setMachines] = useState("");
  const [materialsSupported, setMaterialsSupported] = useState("");
  const [materialsAvoided, setMaterialsAvoided] = useState("");
  const [inHouseProcesses, setInHouseProcesses] = useState("");
  const [outsideProcesses, setOutsideProcesses] = useState("");
  const [inspectionEquipment, setInspectionEquipment] = useState("");
  const [certifications, setCertifications] = useState("");
  const [preferredWork, setPreferredWork] = useState("");
  const [workToAvoid, setWorkToAvoid] = useState("");
  const [toleranceComfort, setToleranceComfort] = useState("");
  const [notes, setNotes] = useState("");
  const [staff, setStaff] = useState<StaffDraft[]>(defaultStaff);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdminSetup = user?.email?.toLowerCase() === "mosesfuego@gmail.com";

  function updateStaff(index: number, patch: Partial<StaffDraft>) {
    setStaff((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function addStaffMember() {
    setStaff((current) => [...current, { name: "", email: "", role: "staff" }]);
  }

  function removeStaffMember(index: number) {
    setStaff((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function useDemoProfile() {
    setCompanyName(demoShopProfile.companyName);
    setShopType(demoShopProfile.shopType);
    setMainContactName(demoShopProfile.mainContactName);
    setMainContactEmail(user?.email ?? "marcus@ravenprecision.example");
    setTimezone(demoShopProfile.timezone);
    setMachines(demoShopProfile.machines);
    setMaterialsSupported(demoShopProfile.materialsSupported);
    setMaterialsAvoided(demoShopProfile.materialsAvoided);
    setInHouseProcesses(demoShopProfile.inHouseProcesses);
    setOutsideProcesses(demoShopProfile.outsideProcesses);
    setInspectionEquipment(demoShopProfile.inspectionEquipment);
    setCertifications(demoShopProfile.certifications);
    setPreferredWork(demoShopProfile.preferredWork);
    setWorkToAvoid(demoShopProfile.workToAvoid);
    setToleranceComfort(demoShopProfile.toleranceComfort);
    setNotes(demoShopProfile.notes);
    setStaff(defaultStaff);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be signed in to create a company.");
      return;
    }

    setIsSubmitting(true);

    const input: CompanyOnboardingInput = {
      companyName,
      shopType,
      mainContactName,
      mainContactEmail,
      timezone,
      machines: splitList(machines),
      materialsSupported: splitList(materialsSupported),
      materialsAvoided: splitList(materialsAvoided),
      inHouseProcesses: splitList(inHouseProcesses),
      outsideProcesses: splitList(outsideProcesses),
      inspectionEquipment: splitList(inspectionEquipment),
      certifications: splitList(certifications),
      preferredWork,
      workToAvoid,
      toleranceComfort,
      notes,
      staff: staff.filter((item) => item.name.trim() || item.email.trim()),
    };

    try {
      await createInitialCompany(user, input);
      await refreshCompanyContext();
      router.replace("/command-center");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to create company setup. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mx-auto max-w-5xl space-y-6 p-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Chunk 1 setup
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Set up your shop profile
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            This creates the company, manager profile, staff list, and structured
            capability profile Corvus will use later for RFQ and capability checks.
          </p>
        </div>
        {isAdminSetup ? (
          <button
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={useDemoProfile}
            type="button"
          >
            Use simulated machine shop profile
          </button>
        ) : null}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Company basics</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextInput
            label="Company name"
            onChange={setCompanyName}
            required
            value={companyName}
          />
          <TextInput label="Shop type" onChange={setShopType} value={shopType} />
          <TextInput
            label="Main contact name"
            onChange={setMainContactName}
            required
            value={mainContactName}
          />
          <TextInput
            label="Main contact email"
            onChange={setMainContactEmail}
            required
            type="email"
            value={mainContactEmail}
          />
          <TextInput label="Timezone" onChange={setTimezone} value={timezone} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Capability profile
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Use commas or new lines. Keep it practical; this is not an enterprise
          implementation worksheet.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextArea label="Machines" onChange={setMachines} value={machines} />
          <TextArea
            label="Materials supported"
            onChange={setMaterialsSupported}
            value={materialsSupported}
          />
          <TextArea
            label="Materials avoided"
            onChange={setMaterialsAvoided}
            value={materialsAvoided}
          />
          <TextArea
            label="In-house processes"
            onChange={setInHouseProcesses}
            value={inHouseProcesses}
          />
          <TextArea
            label="Outside processes"
            onChange={setOutsideProcesses}
            value={outsideProcesses}
          />
          <TextArea
            label="Inspection equipment"
            onChange={setInspectionEquipment}
            value={inspectionEquipment}
          />
          <TextArea
            label="Certifications"
            onChange={setCertifications}
            value={certifications}
          />
          <TextArea
            label="Tolerance comfort notes"
            onChange={setToleranceComfort}
            value={toleranceComfort}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextArea
            label="Preferred work"
            onChange={setPreferredWork}
            value={preferredWork}
          />
          <TextArea
            label="Work to avoid"
            onChange={setWorkToAvoid}
            value={workToAvoid}
          />
        </div>
        <div className="mt-4">
          <TextArea label="General notes" onChange={setNotes} value={notes} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Key staff</h2>
            <p className="mt-1 text-sm text-slate-500">
              Real invitations can come later. For now, this records who exists
              in the shop.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            onClick={addStaffMember}
            type="button"
          >
            <Plus size={16} />
            Add staff
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {staff.map((staffMember, index) => (
            <div
              className="grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_1fr_150px_40px]"
              key={index}
            >
              <TextInput
                label="Name"
                onChange={(value) => updateStaff(index, { name: value })}
                value={staffMember.name}
              />
              <TextInput
                label="Email"
                onChange={(value) => updateStaff(index, { email: value })}
                type="email"
                value={staffMember.email}
              />
              <label className="block text-sm font-medium text-slate-700">
                Role
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) =>
                    updateStaff(index, { role: event.target.value as UserRole })
                  }
                  value={staffMember.role}
                >
                  {roleOptions.map((role) => (
                    <option className="capitalize" key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <button
                aria-label="Remove staff member"
                className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-red-600"
                onClick={() => removeStaffMember(index)}
                type="button"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating setup..." : "Create shop profile"}
        </button>
      </div>
    </form>
  );
}

function TextInput({
  label,
  onChange,
  required,
  type = "text",
  value,
}: {
  label: string;
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
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
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
