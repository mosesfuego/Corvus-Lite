import type { AgentConfig, AgentRunResult } from "@/agents/shared/types";
import { callKimiJson, parseJsonObject } from "@/agents/shared/llm-client";
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
  const content = await callKimiJson({
    temperature: intakeExtractionConfig.temperature,
    maxTokens: intakeExtractionConfig.maxTokens,
    messages: [
      {
        role: "system",
        content: [
          "You are the Corvus Lite Intake Extraction Worker.",
          "Extract manufacturing RFQ fields from messy customer request text.",
          "Do not decide manufacturability, price, tooling, setup time, cycle time, or committed delivery date.",
          `Current date: ${new Date().toISOString().slice(0, 10)}.`,
          "If a date omits the year, infer the next upcoming matching date from the current date.",
          "Do not treat the greeting recipient, such as 'Hi Marcus', as the customer contact. Only extract a contact name from signatures, sender lines, or explicit contact statements.",
          "Return only a JSON object matching this TypeScript shape:",
          "{ customerName?: string; contactName?: string; contactEmail?: string; partName?: string; partNumber?: string; revision?: string; quantity?: number; material?: string; requestedDueDate?: string; finishRequirements?: string[]; certRequirements?: string[]; missingInfo: string[]; riskNotes: string[]; confidence: 'low' | 'medium' | 'high'; }",
          "Use ISO date format YYYY-MM-DD when a requested date is explicit or easily inferable from the text.",
          "Put uncertain, ambiguous, or absent fields in missingInfo instead of guessing.",
        ].join("\n"),
      },
      {
        role: "user",
        content: JSON.stringify({
          knownCustomerName: input.knownCustomerName ?? null,
          sourceText: input.sourceText,
        }),
      },
    ],
  });

  const output = normalizeExtraction(parseJsonObject<IntakeExtractionOutput>(content));

  return {
    runId: crypto.randomUUID(),
    agentName: intakeExtractionConfig.name,
    status: "needs_human_review",
    output,
    userMessage:
      "I extracted an RFQ draft from the pasted request. Review these fields before applying them.",
    auditSummary:
      "Kimi K2.6 produced structured RFQ extraction output. No Firestore writes were performed.",
    requiredConfirmations: ["Review extracted RFQ fields before saving."],
    validationErrors: [],
  };
}

function normalizeExtraction(output: IntakeExtractionOutput): IntakeExtractionOutput {
  return {
    ...output,
    quantity:
      typeof output.quantity === "number" && Number.isFinite(output.quantity)
        ? output.quantity
        : undefined,
    missingInfo: Array.isArray(output.missingInfo) ? output.missingInfo : [],
    riskNotes: Array.isArray(output.riskNotes) ? output.riskNotes : [],
    finishRequirements: Array.isArray(output.finishRequirements)
      ? output.finishRequirements
      : [],
    certRequirements: Array.isArray(output.certRequirements)
      ? output.certRequirements
      : [],
    confidence: ["low", "medium", "high"].includes(output.confidence)
      ? output.confidence
      : "low",
  };
}
