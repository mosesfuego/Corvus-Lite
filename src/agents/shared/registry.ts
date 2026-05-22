import type { AgentConfig, AgentRunner } from "@/agents/shared/types";
import {
  intakeExtractionConfig,
  runIntakeExtraction,
} from "@/agents/intake-extraction/runner";

export type RegisteredAgentName = "intakeExtraction";

type RegisteredAgent<TInput = unknown, TOutput = unknown> = {
  config: AgentConfig;
  run: AgentRunner<TInput, TOutput>;
};

export const agentRegistry: Record<RegisteredAgentName, RegisteredAgent> = {
  intakeExtraction: {
    config: intakeExtractionConfig,
    run: runIntakeExtraction as AgentRunner<unknown, unknown>,
  },
};

export function getAgent(name: RegisteredAgentName) {
  return agentRegistry[name];
}
