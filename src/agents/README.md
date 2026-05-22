# Corvus Lite Agent Scaffold

This folder follows the founding docs and `CORVUS_LITE_AGENT_BUILDER_BLUEPRINT.txt`.

Rules for future agents:

- Keep the normal UI unified. Users should see Corvus, not a list of agents.
- Add agents only for ambiguity, unstructured text, comparison, or conversational interpretation.
- Every agent needs a bounded input, structured output, config, runner, and human-review policy.
- Workers do not directly own workflows or silently write high-risk database changes.
- The orchestrator loads context, chooses workers, validates outputs, and prepares proposed changes.

Current workers:

- `intake-extraction`: live RFQ text extraction worker. It drafts structured fields from pasted customer request text and requires human review before saving.

Next intended workers:

- `email-intake`: monitors inbound email later, classifies likely RFQs, and routes draft intake packages to the RFQ queue for review.
- `capability-check`
- `quote-prep`
- `po-compare`
- `shop-pulse`
- `issue-interpretation`
