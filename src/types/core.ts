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
