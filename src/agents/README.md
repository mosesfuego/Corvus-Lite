# Corvus Lite Agent Scaffold

This folder follows the founding docs and `CORVUS_LITE_AGENT_BUILDER_BLUEPRINT.txt`.

Rules for future agents:

- Keep the normal UI unified. Users should see Corvus, not a list of agents.
- Add agents only for ambiguity, unstructured text, comparison, or conversational interpretation.
- Every agent needs a bounded input, structured output, config, runner, and human-review policy.
- Workers do not directly own workflows or silently write high-risk database changes.
- The orchestrator loads context, chooses workers, validates outputs, and prepares proposed changes.

Current workers:

- `intake-extraction`: RFQ text extraction scaffold. LLM wiring comes next.

Next intended workers:

- `capability-check`
- `quote-prep`
- `po-compare`
- `shop-pulse`
- `issue-interpretation`
