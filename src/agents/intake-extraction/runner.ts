import type { AgentConfig, AgentRunResult } from "@/agents/shared/types";
import type {
  IntakeExtractionInput,
  IntakeExtractionOutput,
} from "@/agents/intake-extraction/schemas";

export const intakeExtractionConfig: AgentConfig = {
  name: "Intake Extraction Worker",
  purpose:
    "Extract structured RFQ fields from pasted customer request text for human review.",
  model: "kimi-k2.6",
  temperature: 0.1,
  maxTokens: 1600,
  riskLevel: "medium",
  allowedTools: ["llm.extractStructuredRfq"],
  requiresHumanApprovalFor: ["applyExtractedFields", "createRfqFromExtraction"],
  timeoutMs: 30000,
  maxRetries: 1,
  maxSteps: 1,
};

export async function runIntakeExtraction(
  input: IntakeExtractionInput,
): Promise<AgentRunResult<IntakeExtractionOutput>> {
  const missingInfo = [
    input.sourceText.toLowerCase().includes("qty") ||
    input.sourceText.toLowerCase().includes("pcs")
      ? null
      : "Quantity",
    input.sourceText.toLowerCase().includes("material") ||
    input.sourceText.toLowerCase().includes("aluminum") ||
    input.sourceText.toLowerCase().includes("steel")
      ? null
      : "Material",
    input.sourceText.toLowerCase().includes("due") ||
    input.sourceText.toLowerCase().includes("delivery")
      ? null
      : "Requested due date",
  ].filter(Boolean) as string[];

  return {
    runId: crypto.randomUUID(),
    agentName: intakeExtractionConfig.name,
    status: "needs_human_review",
    output: {
      customerName: input.knownCustomerName,
      missingInfo,
      riskNotes: [],
      confidence: "low",
    },
    userMessage:
      "Intake extraction is scaffolded. Connect the LLM client next to produce real structured fields.",
    auditSummary:
      "Stub runner returned a low-confidence extraction shell without writing to Firestore.",
    requiredConfirmations: ["Review extracted RFQ fields before saving."],
    validationErrors: [],
  };
}
