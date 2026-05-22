import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { demoActivity, demoIssues, demoJobs } from "@/lib/demo/shop-data";
import { getFirebaseDb } from "@/lib/firebase/client";
import type {
  ActivityEvent,
  Contact,
  Customer,
  Issue,
  Job,
  JobStage,
  JobStatus,
  Machine,
  Rfq,
  RiskLevel,
} from "@/types/core";

export type CoreRecords = {
  customers: Customer[];
  contacts: Contact[];
  machines: Machine[];
  rfqs: Rfq[];
  jobs: Job[];
  issues: Issue[];
  activityEvents: ActivityEvent[];
};

export type CreateJobInput = {
  jobNumber: string;
  customer: string;
  part: string;
  revision: string;
  dueDate: string;
  owner: string;
  machine?: string;
  quantityTotal: number;
  notes?: string;
};

export type CreateRfqInput = {
  rfqNumber?: string;
  customerName: string;
  contactName?: string;
  contactEmail?: string;
  partName: string;
  partNumber?: string;
  revision: string;
  quantity: number;
  material: string;
  requestedDueDate?: string;
  sourceText: string;
  notes?: string;
};

export type CreateIssueInput = {
  jobId?: string;
  machineId?: string;
  scope?: Issue["scope"];
  title: string;
  severity: RiskLevel;
  target: string;
  owner: string;
  type: string;
  notes?: string;
};

function nowFields() {
  return {
    updatedAt: serverTimestamp(),
  };
}

function sortByCreatedDesc<T extends { createdAt?: unknown; updatedAt?: unknown }>(
  records: T[],
) {
  return [...records].sort((a, b) => {
    const aTime = readMillis(a.updatedAt) || readMillis(a.createdAt);
    const bTime = readMillis(b.updatedAt) || readMillis(b.createdAt);
    return bTime - aTime;
  });
}

function readMillis(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }

  return 0;
}

function withoutId<T extends { id: string }>(record: T): Omit<T, "id"> {
  const copy: Partial<T> = { ...record };
  delete copy.id;
  return copy as Omit<T, "id">;
}

async function listCompanyCollection<T>(collectionName: string, companyId: string) {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseDb(), collectionName),
      where("companyId", "==", companyId),
    ),
  );

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
}

async function findCompanyRecordByField<T>(
  collectionName: string,
  companyId: string,
  field: string,
  value: string,
) {
  if (!value.trim()) {
    return null;
  }

  const snapshot = await getDocs(
    query(
      collection(getFirebaseDb(), collectionName),
      where("companyId", "==", companyId),
      where(field, "==", value.trim()),
    ),
  );

  const first = snapshot.docs[0];
  return first ? ({ id: first.id, ...first.data() } as T) : null;
}

export async function listCoreRecords(companyId: string): Promise<CoreRecords> {
  const [customers, contacts, machines, rfqs, jobs, issues, activityEvents] =
    await Promise.all([
    listCompanyCollection<Customer>("customers", companyId),
    listCompanyCollection<Contact>("contacts", companyId),
    listCompanyCollection<Machine>("machines", companyId),
    listCompanyCollection<Rfq>("rfqs", companyId),
    listCompanyCollection<Job>("jobs", companyId),
    listCompanyCollection<Issue>("issues", companyId),
    listCompanyCollection<ActivityEvent>("activityEvents", companyId),
    ]);

  return {
    customers: sortByCreatedDesc(customers),
    contacts: sortByCreatedDesc(contacts),
    machines: sortByCreatedDesc(machines),
    rfqs: sortByCreatedDesc(rfqs),
    jobs: sortByCreatedDesc(jobs),
    issues: sortByCreatedDesc(issues),
    activityEvents: sortByCreatedDesc(activityEvents),
  };
}

function buildRfqNumber() {
  return `RFQ-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

function buildRfqMissingInfo(input: CreateRfqInput) {
  const missing = [
    input.contactEmail ? null : "Customer contact email",
    input.partNumber ? null : "Part number",
    input.material ? null : "Material requirement",
    input.requestedDueDate ? null : "Requested due date",
  ].filter(Boolean);

  return missing as string[];
}

export async function createRfq(companyId: string, input: CreateRfqInput) {
  const id = crypto.randomUUID();
  const db = getFirebaseDb();
  const rfqNumber = input.rfqNumber || buildRfqNumber();
  const missingInfo = buildRfqMissingInfo(input);
  const riskNotes =
    input.sourceText.toLowerCase().includes("asap") ||
    input.sourceText.toLowerCase().includes("urgent")
      ? ["Customer language suggests schedule pressure."]
      : [];

  const existingCustomer = await findCompanyRecordByField<Customer>(
    "customers",
    companyId,
    "name",
    input.customerName,
  );
  const customerId = existingCustomer?.id ?? crypto.randomUUID();

  if (!existingCustomer) {
    await setDoc(doc(db, "customers", customerId), {
      companyId,
      name: input.customerName,
      contactName: input.contactName ?? "",
      contactEmail: input.contactEmail ?? "",
      notes: "Created from RFQ intake.",
      createdAt: serverTimestamp(),
      ...nowFields(),
    });
  }

  if (input.contactEmail) {
    const existingContact = await findCompanyRecordByField<Contact>(
      "contacts",
      companyId,
      "email",
      input.contactEmail,
    );

    if (!existingContact) {
      await setDoc(doc(db, "contacts", crypto.randomUUID()), {
        companyId,
        customerId,
        customerName: input.customerName,
        name: input.contactName ?? "",
        email: input.contactEmail,
        notes: "Created from RFQ intake.",
        createdAt: serverTimestamp(),
        ...nowFields(),
      });
    }
  }

  await setDoc(doc(db, "rfqs", id), {
    companyId,
    rfqNumber,
    customerName: input.customerName,
    contactName: input.contactName ?? "",
    contactEmail: input.contactEmail ?? "",
    partName: input.partName,
    partNumber: input.partNumber ?? "",
    revision: input.revision || "A",
    quantity: input.quantity,
    material: input.material,
    requestedDueDate: input.requestedDueDate ?? "",
    status:
      missingInfo.length > 0 ? "intake_review" : "ready_for_capability_check",
    sourceText: input.sourceText,
    notes: input.notes ?? "",
    extractedSummary:
      "Manual RFQ package. AI extraction worker will later draft and review this from messy inbound text.",
    missingInfo,
    riskNotes,
    createdAt: serverTimestamp(),
    ...nowFields(),
  });

  await createActivityEvent({
    companyId,
    message: `${rfqNumber} created for ${input.customerName}.`,
    actor: "user",
  });

  return id;
}

export async function createActivityEvent(params: {
  companyId: string;
  jobId?: string;
  message: string;
  actor?: ActivityEvent["actor"];
}) {
  const id = crypto.randomUUID();

  await setDoc(doc(getFirebaseDb(), "activityEvents", id), {
    companyId: params.companyId,
    jobId: params.jobId ?? null,
    message: params.message,
    actor: params.actor ?? "user",
    timestamp: new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
    createdAt: serverTimestamp(),
    ...nowFields(),
  });
}

export async function createJob(companyId: string, input: CreateJobInput) {
  const id = crypto.randomUUID();
  const job: Omit<Job, "id"> = {
    companyId,
    jobNumber: input.jobNumber,
    customer: input.customer,
    part: input.part,
    revision: input.revision || "A",
    dueDate: input.dueDate,
    owner: input.owner,
    machine: input.machine,
    quantityComplete: 0,
    quantityTotal: input.quantityTotal,
    risk: "low",
    stage: "Job Released",
    status: "ready",
    issueCount: 0,
    notes: input.notes ?? "",
    createdAt: serverTimestamp(),
    ...nowFields(),
  };

  await setDoc(doc(getFirebaseDb(), "jobs", id), job);
  await createActivityEvent({
    companyId,
    jobId: id,
    message: `Job ${input.jobNumber} created for ${input.customer}.`,
    actor: "user",
  });

  return id;
}

export async function updateJobState(
  companyId: string,
  job: Job,
  state: {
    stage?: JobStage;
    status?: JobStatus;
    quantityComplete?: number;
    risk?: RiskLevel;
  },
) {
  await updateDoc(doc(getFirebaseDb(), "jobs", job.id), {
    ...state,
    ...nowFields(),
  });

  const changed = [
    state.stage ? `stage ${state.stage}` : null,
    state.status ? `status ${state.status.replaceAll("_", " ")}` : null,
    typeof state.quantityComplete === "number"
      ? `quantity ${state.quantityComplete}/${job.quantityTotal}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  await createActivityEvent({
    companyId,
    jobId: job.id,
    message: `Job ${job.jobNumber} updated: ${changed}.`,
    actor: "user",
  });
}

export async function createIssue(companyId: string, input: CreateIssueInput) {
  const id = crypto.randomUUID();

  await setDoc(doc(getFirebaseDb(), "issues", id), {
    companyId,
    jobId: input.jobId ?? null,
    machineId: input.machineId ?? null,
    scope: input.scope ?? (input.jobId ? "job" : input.machineId ? "machine" : "sitewide"),
    title: input.title,
    severity: input.severity,
    target: input.target,
    owner: input.owner,
    type: input.type,
    notes: input.notes ?? "",
    source: "manual",
    status: "open",
    createdAt: serverTimestamp(),
    ...nowFields(),
  });

  if (input.jobId) {
    await updateDoc(doc(getFirebaseDb(), "jobs", input.jobId), {
      issueCount: increment(1),
      status: "blocked",
      risk: input.severity === "high" ? "high" : "medium",
      ...nowFields(),
    });
  }

  await createActivityEvent({
    companyId,
    jobId: input.jobId,
    message: `Issue opened: ${input.title}.`,
    actor: "user",
  });
}

export async function resolveIssue(companyId: string, issue: Issue) {
  await updateDoc(doc(getFirebaseDb(), "issues", issue.id), {
    status: "resolved",
    ...nowFields(),
  });

  if (issue.jobId) {
    await updateDoc(doc(getFirebaseDb(), "jobs", issue.jobId), {
      issueCount: increment(-1),
      ...nowFields(),
    });
  }

  await createActivityEvent({
    companyId,
    jobId: issue.jobId,
    message: `Issue resolved: ${issue.title}.`,
    actor: "user",
  });
}

export async function seedDemoCoreData(companyId: string) {
  const existingJobs = await listCompanyCollection<Job>("jobs", companyId);

  if (existingJobs.length > 0) {
    return;
  }

  const db = getFirebaseDb();
  const batch = writeBatch(db);

  const customers = [
    {
      id: crypto.randomUUID(),
      name: "Acme Robotics",
      contactName: "Dana Wilson",
      contactEmail: "dana@acmerobotics.example",
      notes: "Repeat customer for brackets and small fixture work.",
    },
    {
      id: crypto.randomUUID(),
      name: "Northline Medical",
      contactName: "Priya Shah",
      contactEmail: "priya@northline.example",
      notes: "Usually asks for inspection docs and clean packaging.",
    },
    {
      id: crypto.randomUUID(),
      name: "Kestrel Labs",
      contactName: "Owen Brooks",
      contactEmail: "owen@kestrellabs.example",
      notes: "Prototype housings and sensor parts.",
    },
  ];

  customers.forEach((customer) => {
    batch.set(doc(db, "customers", customer.id), {
      ...customer,
      companyId,
      createdAt: serverTimestamp(),
      ...nowFields(),
    });
  });

  const contacts = [
    {
      id: crypto.randomUUID(),
      customerName: "Acme Robotics",
      name: "Dana Wilson",
      email: "dana@acmerobotics.example",
      phone: "555-0101",
      notes: "Sends bracket and fixture RFQs.",
    },
    {
      id: crypto.randomUUID(),
      customerName: "Northline Medical",
      name: "Priya Shah",
      email: "priya@northline.example",
      phone: "555-0102",
      notes: "Cares about certs and packaging notes.",
    },
  ];

  contacts.forEach((contact) => {
    const customer = customers.find((item) => item.name === contact.customerName);

    batch.set(doc(db, "contacts", contact.id), {
      ...contact,
      companyId,
      customerId: customer?.id ?? null,
      createdAt: serverTimestamp(),
      ...nowFields(),
    });
  });

  const machines = [
    {
      id: crypto.randomUUID(),
      name: "Haas VF-2",
      type: "3-axis CNC mill",
      status: "available",
      workEnvelope: "30 x 16 x 20 in",
      notes: "Primary aluminum and fixture machine.",
    },
    {
      id: crypto.randomUUID(),
      name: "Doosan Lynx",
      type: "CNC lathe",
      status: "busy",
      workEnvelope: "6 in chuck",
      notes: "Turned parts and small production work.",
    },
    {
      id: crypto.randomUUID(),
      name: "Bridgeport Manual Mill",
      type: "Manual mill",
      status: "available",
      workEnvelope: "Manual work",
      notes: "Repairs, quick mods, and fixture touch-ups.",
    },
  ];

  machines.forEach((machine) => {
    batch.set(doc(db, "machines", machine.id), {
      ...machine,
      companyId,
      createdAt: serverTimestamp(),
      ...nowFields(),
    });
  });

  const simulatedRfq: Omit<Rfq, "id"> = {
    companyId,
    rfqNumber: "RFQ-2026-1048",
    customerName: "Acme Robotics",
    contactName: "Dana Wilson",
    contactEmail: "dana@acmerobotics.example",
    partName: "Sensor bracket",
    partNumber: "ARB-17",
    revision: "C",
    quantity: 100,
    material: "6061-T6 aluminum",
    requestedDueDate: "2026-06-14",
    status: "ready_for_capability_check",
    sourceText:
      "Hi Marcus, can you quote 100 pcs of ARB-17 sensor bracket Rev C in 6061-T6 aluminum? Drawing PDF attached. We'd like delivery around June 14 if possible. Black anodize may be required, please call that out separately. - Dana",
    notes: "Seeded simulated RFQ for Thursday intake testing.",
    extractedSummary:
      "Customer is requesting 100 aluminum brackets, possible black anodize, June 14 target delivery.",
    missingInfo: ["CAD file", "Confirm whether anodize is required"],
    riskNotes: ["Outside anodize may be required."],
    createdAt: serverTimestamp(),
    ...nowFields(),
  };

  batch.set(doc(db, "rfqs", crypto.randomUUID()), simulatedRfq);

  const jobIds = new Map<string, string>();

  demoJobs.forEach((job) => {
    const id = crypto.randomUUID();
    jobIds.set(job.id, id);
    batch.set(doc(db, "jobs", id), {
      ...withoutId(job),
      companyId,
      customerId:
        customers.find((customer) => customer.name === job.customer)?.id ?? null,
      notes: "Seeded demo job for local product testing.",
      createdAt: serverTimestamp(),
      ...nowFields(),
    });
  });

  demoIssues.forEach((issue) => {
    const id = crypto.randomUUID();
    const relatedJobId =
      issue.target.includes("1048") || issue.target.includes("1051")
        ? (jobIds.get("job-1051") ?? null)
        : null;

    batch.set(doc(db, "issues", id), {
      ...withoutId(issue),
      companyId,
      jobId: relatedJobId,
      type: issue.title.toLowerCase().includes("material")
        ? "Waiting on material"
        : "Machine down",
      notes: "Seeded demo issue.",
      createdAt: serverTimestamp(),
      ...nowFields(),
    });
  });

  demoActivity.forEach((activity) => {
    batch.set(doc(db, "activityEvents", crypto.randomUUID()), {
      ...withoutId(activity),
      companyId,
      jobId: null,
      createdAt: serverTimestamp(),
      ...nowFields(),
    });
  });

  await batch.commit();
}
