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
  Customer,
  Issue,
  Job,
  JobStage,
  JobStatus,
  RiskLevel,
} from "@/types/core";

export type CoreRecords = {
  customers: Customer[];
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

export type CreateIssueInput = {
  jobId?: string;
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

export async function listCoreRecords(companyId: string): Promise<CoreRecords> {
  const [customers, jobs, issues, activityEvents] = await Promise.all([
    listCompanyCollection<Customer>("customers", companyId),
    listCompanyCollection<Job>("jobs", companyId),
    listCompanyCollection<Issue>("issues", companyId),
    listCompanyCollection<ActivityEvent>("activityEvents", companyId),
  ]);

  return {
    customers: sortByCreatedDesc(customers),
    jobs: sortByCreatedDesc(jobs),
    issues: sortByCreatedDesc(issues),
    activityEvents: sortByCreatedDesc(activityEvents),
  };
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
    title: input.title,
    severity: input.severity,
    target: input.target,
    owner: input.owner,
    type: input.type,
    notes: input.notes ?? "",
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
