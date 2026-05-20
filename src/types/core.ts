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

export type Job = {
  id: string;
  jobNumber: string;
  customer: string;
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
};

export type Issue = {
  id: string;
  title: string;
  severity: RiskLevel;
  target: string;
  owner: string;
  status: "open" | "resolved";
};

export type ActivityEvent = {
  id: string;
  message: string;
  timestamp: string;
  actor: "user" | "corvus" | "system";
};

export type UserRole = "owner" | "manager" | "staff" | "inspector" | "shipping";

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
