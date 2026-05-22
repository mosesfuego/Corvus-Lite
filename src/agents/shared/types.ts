export type AgentRiskLevel = "low" | "medium" | "high";

export type AgentRunStatus =
  | "completed"
  | "needs_human_review"
  | "validation_failed"
  | "failed";

export type AgentConfig = {
  name: string;
  purpose: string;
  model: string;
  temperature: number;
  maxTokens: number;
  riskLevel: AgentRiskLevel;
  allowedTools: string[];
  requiresHumanApprovalFor: string[];
  timeoutMs: number;
  maxRetries: number;
  maxSteps: number;
};

export type AgentRunResult<TOutput> = {
  runId: string;
  agentName: string;
  status: AgentRunStatus;
  output?: TOutput;
  userMessage: string;
  auditSummary: string;
  requiredConfirmations: string[];
  validationErrors: string[];
};

export type AgentRunner<TInput, TOutput> = (
  input: TInput,
) => Promise<AgentRunResult<TOutput>>;
