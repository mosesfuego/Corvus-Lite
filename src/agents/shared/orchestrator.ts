import { getAgent, type RegisteredAgentName } from "@/agents/shared/registry";

export type OrchestratorRequest<TInput> = {
  intent: "extract_rfq";
  companyId: string;
  targetType: "rfq" | "draft";
  targetId?: string;
  agentName: RegisteredAgentName;
  input: TInput;
};

export async function runOrchestratedAgent<TInput, TOutput>(
  request: OrchestratorRequest<TInput>,
) {
  const agent = getAgent(request.agentName);
  const result = await agent.run(request.input);

  return {
    ...result,
    companyId: request.companyId,
    targetType: request.targetType,
    targetId: request.targetId ?? null,
    selectedWorkers: [agent.config.name],
    toolPlan: agent.config.allowedTools,
  } as TOutput & typeof result & {
    companyId: string;
    targetType: string;
    targetId: string | null;
    selectedWorkers: string[];
    toolPlan: string[];
  };
}
