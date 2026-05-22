export type JobStage =
  | "RFQ Intake"
  | "Drawing Review"
  | "Capability Check"
  | "Quote Draft"
  | "Quote Approved"
  | "PO Intake"
  | "Job Released"
  | "Build Readiness"
  | "In Progress"
  | "Quality Review"
  | "Ready to Ship"
  | "Shipped";

export type JobStatus =
  | "ready"
  | "queued"
  | "in_progress"
  | "blocked"
  | "inspection"
  | "ready_to_ship"
  | "shipped";

export type RiskLevel = "low" | "medium" | "high";

export type RfqStatus =
  | "draft"
  | "intake_review"
  | "ready_for_capability_check"
  | "capability_review"
  | "ready_to_quote"
  | "quoted"
  | "declined";

export type Job = {
  id: string;
  companyId?: string;
  jobNumber: string;
  customer: string;
  customerId?: string;
  part: string;
  revision: string;
  dueDate: string;
  owner: string;
  machine?: string;
  quantityComplete: number;
  quantityTotal: number;
  risk: RiskLevel;
  stage: JobStage;
  status: JobStatus;
  issueCount: number;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Issue = {
  id: string;
  companyId?: string;
  jobId?: string;
  machineId?: string;
  scope?: "job" | "machine" | "sitewide";
  title: string;
  severity: RiskLevel;
  target: string;
  owner: string;
  status: "open" | "resolved";
  type?: string;
  notes?: string;
  source?: "manual" | "chat" | "corvus";
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ActivityEvent = {
  id: string;
  companyId?: string;
  jobId?: string;
  message: string;
  timestamp: string;
  actor: "user" | "corvus" | "system";
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Customer = {
  id: string;
  companyId: string;
  name: string;
  contactName: string;
  contactEmail: string;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Contact = {
  id: string;
  companyId: string;
  customerId?: string;
  customerName: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Machine = {
  id: string;
  companyId: string;
  name: string;
  type: string;
  status: "available" | "busy" | "down" | "unknown";
  workEnvelope?: string;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type FileRecord = {
  id: string;
  companyId: string;
  jobId?: string;
  rfqId?: string;
  name: string;
  type: string;
  source: "manual" | "upload" | "future_storage";
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Rfq = {
  id: string;
  companyId: string;
  rfqNumber: string;
  customerName: string;
  contactName?: string;
  contactEmail?: string;
  partName: string;
  partNumber?: string;
  revision: string;
  quantity: number;
  material: string;
  requestedDueDate?: string;
  status: RfqStatus;
  sourceText: string;
  notes?: string;
  extractedSummary?: string;
  missingInfo?: string[];
  riskNotes?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type UserRole =
  | "admin"
  | "owner"
  | "manager"
  | "staff"
  | "inspector"
  | "shipping";

export type UserProfile = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Company = {
  id: string;
  name: string;
  shopType: string;
  mainContactName: string;
  mainContactEmail: string;
  timezone: string;
  ownerUid: string;
  memberUids: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type StaffMember = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CapabilityProfile = {
  id: string;
  companyId: string;
  machines: string[];
  materialsSupported: string[];
  materialsAvoided: string[];
  inHouseProcesses: string[];
  outsideProcesses: string[];
  inspectionEquipment: string[];
  certifications: string[];
  preferredWork: string;
  workToAvoid: string;
  toleranceComfort: string;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CompanyOnboardingInput = {
  companyName: string;
  shopType: string;
  mainContactName: string;
  mainContactEmail: string;
  timezone: string;
  machines: string[];
  materialsSupported: string[];
  materialsAvoided: string[];
  inHouseProcesses: string[];
  outsideProcesses: string[];
  inspectionEquipment: string[];
  certifications: string[];
  preferredWork: string;
  workToAvoid: string;
  toleranceComfort: string;
  notes: string;
  staff: Array<{
    name: string;
    email: string;
    role: UserRole;
  }>;
};
