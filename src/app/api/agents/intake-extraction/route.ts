import { runOrchestratedAgent } from "@/agents/shared/orchestrator";
import type { IntakeExtractionInput } from "@/agents/intake-extraction/schemas";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<IntakeExtractionInput>;

    if (!body.companyId || !body.sourceText?.trim()) {
      return NextResponse.json(
        { error: "companyId and sourceText are required." },
        { status: 400 },
      );
    }

    const result = await runOrchestratedAgent({
      intent: "extract_rfq",
      companyId: body.companyId,
      targetType: "draft",
      agentName: "intakeExtraction",
      input: {
        companyId: body.companyId,
        sourceText: body.sourceText,
        knownCustomerName: body.knownCustomerName,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to run intake extraction.",
      },
      { status: 500 },
    );
  }
}
