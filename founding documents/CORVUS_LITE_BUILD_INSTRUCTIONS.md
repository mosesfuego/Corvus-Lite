# Corvus Lite Build Instructions

This document is the phased build guide for Codex agents working on Corvus Lite.

It should be read together with [`CORVUS_LITE_PRODUCT_PLAN.txt`](./CORVUS_LITE_PRODUCT_PLAN.txt) and [`CORVUS_LITE_AGENT_BUILDER_BLUEPRINT.txt`](./CORVUS_LITE_AGENT_BUILDER_BLUEPRINT.txt). The product plan is the source of truth for what Corvus Lite is, who it serves, and what product behavior should feel right. The agent-builder blueprint is the source of truth for agent/orchestrator structure, tool rules, guardrails, schemas, evals, and human-in-the-loop policy. This build guide converts those definitions into an implementation sequence.

Do not try to build all of Corvus Lite in one pass. This product should be built section by section, with each phase producing a working, reviewable slice.

## North Star

Corvus Lite is a lightweight operations control panel for small machine shops.

It is not a cheaper MES, ERP, or QMS. It is a calm job control panel and chat-native operations assistant that helps small shops track RFQs, quotes, POs, jobs, files, issues, quality signoff, shipping readiness, and staff updates without creating paperwork overhead.

Before any major implementation phase, reread these product plan sections:

- `1. THE CORE IDEA`
- `2. WHO THIS IS FOR`
- `4. THE PRODUCT FEELING`
- `7. THE TRUST BOUNDARY`
- `33. THE COMPANY WE DEFINED TODAY`

The most important product rule:

Corvus should make human judgment easier to apply. It should not pretend to be a machinist.

## Build Philosophy

Build the product as a usable operational workflow, not a collection of AI demos.

Default to:

- Simple statuses
- Short checklists
- Clear job stages
- Human approval at important gates
- File upload and review
- Activity history
- Explicit issues
- Practical dashboard summaries

Avoid:

- Operation-level routing in v1
- AI-generated setup/cycle-time guesses
- Exact inventory tracking in v1
- Complex scheduling optimization
- Separate user-facing chats per agent
- Exposing internal agents as the primary UI
- Enterprise-style configuration overhead

The user should see jobs, issues, files, people, status, and next actions.

Internal agents may exist later, but the default user experience is one coherent Corvus system.

Agent architecture must follow the `AB-###` numbered rules in `CORVUS_LITE_AGENT_BUILDER_BLUEPRINT.txt`.

## Recommended Initial Tool Stack

Use the lean stack below unless the user explicitly changes direction.

```text
Frontend: Next.js + React
Auth: Firebase Auth
Database: Firestore
Storage: Firebase Storage
Backend: Firebase Cloud Functions
Hosting: Firebase Hosting
LLM: Kimi K2.6
Repo/CI: GitHub, later GitHub Actions if needed
```

Do not introduce these until the relevant phase:

- Slack app: after the core job flow works
- Email intake/outbound: later, not required for the first build
- Vector database/RAG: after enough historical data exists
- Inventory/material supplier tools: after material pain is proven
- External queue/workflow tools: only if Firebase functions are insufficient

## Product Plan Reference Map

The current product plan is a `.txt` file with numbered sections. It is already usable for reference. It does not need to be renumbered before coding.

When assigning work to a Codex agent, reference both the phase in this file and the relevant product plan sections.

Useful references:

- Product identity: sections `1-7`
- Machine shop journey: section `8`
- RFQ intake: section `9`
- Drawing review: section `10`
- Capability check and setup wizard: sections `11` and `28B`
- Quote prep: section `12`
- Material costing: section `13`
- PO intake: section `14`
- Traveler concept: section `15`
- Planning/job flow: sections `16`, `25`, and `28A`
- Issues/bottlenecks: section `17`
- Build readiness/status: sections `18` and `19`
- Quality: section `20`
- Outside processing placeholder: section `21`
- Shipping: section `22`
- Memory/closeout: section `23`
- Chat interface: section `24`
- Dashboard: section `27`
- UI direction: sections `28`, `28A`, and `28B`
- Background agent architecture: section `29`
- MVP scope: section `30`
- Future expansion: section `31`

## Agent Blueprint Reference Map

The agent-builder blueprint uses stable `AB-###` references. Use those references in future implementation prompts.

Useful references:

- Core definition: `AB-009` through `AB-016`
- When to use agents: `AB-017` through `AB-022`
- Multi-agent stance: `AB-023` through `AB-032`
- Orchestrator structure: `AB-033` through `AB-050`
- Generic domain agent structure: `AB-051` through `AB-062`
- Proposed Corvus workers: `AB-063` through `AB-075`
- Prompt design rules: `AB-076` through `AB-088`
- Tool design rules: `AB-089` through `AB-108`
- Context and memory: `AB-109` through `AB-117`
- Output schemas and validation: `AB-118` through `AB-128`
- Run loop and exit conditions: `AB-129` through `AB-138`
- Guardrails: `AB-139` through `AB-148`
- Human-in-the-loop: `AB-149` through `AB-158`
- Model strategy: `AB-159` through `AB-166`
- Evals: `AB-167` through `AB-178`
- Error handling and observability: `AB-179` through `AB-190`
- Agent trace/beta mode: `AB-191` through `AB-195`
- Database write policy: `AB-196` through `AB-202`
- Communication layer: `AB-203` through `AB-210`
- Implementation sequence: `AB-211` through `AB-220`
- Corvus trust boundaries: `AB-221` through `AB-230`
- Generic agent config template: `AB-231` through `AB-245`
- Orchestrator config template: `AB-246` through `AB-257`
- Example agent runs: `AB-258` through `AB-276`
- V1 decisions: `AB-277` through `AB-288`

## Suggested Build Cascade

```text
Corvus Lite
├─ Phase 0: Project foundation
├─ Phase 1: Auth, tenant, and company onboarding
├─ Phase 2: Core data model
├─ Phase 3: App shell and command center skeleton
├─ Phase 4: Capability setup wizard
├─ Phase 5: RFQ/job intake
├─ Phase 6: File upload and document package
├─ Phase 7: LLM extraction with human review
├─ Phase 8: Capability check
├─ Phase 9: Quote prep
├─ Phase 10: PO intake and job release
├─ Phase 11: Visual job flow
├─ Phase 12: Build readiness and job board
├─ Phase 13: Issues against jobs and machines
├─ Phase 14: Quality signoff
├─ Phase 15: Shipping readiness
├─ Phase 16: Activity timeline
├─ Phase 17: Dashboard summaries and basic metrics
├─ Phase 18: Unified chat-ready architecture
├─ Phase 19: Slack integration
├─ Phase 20: Agent/background worker hardening
└─ Phase 21: Polish, testing, and deploy readiness
```

## Phase 0: Project Foundation

Goal: create the technical foundation without product complexity.

Introduce tools:

- Next.js + React
- Firebase project
- Firebase Auth
- Firestore
- Firebase Storage
- Firebase Hosting
- Firebase Cloud Functions
- Kimi K2.6 backend environment variable

Build:

- App project structure
- Local dev setup
- Firebase config
- Environment variable pattern
- Basic protected app route
- Basic backend function health check
- Basic Firestore connection test
- Basic Storage connection test

Do not build product workflows yet.

Acceptance criteria:

- User can run the app locally.
- User can sign in with Firebase Auth.
- Protected app route blocks anonymous users.
- Backend health check responds.
- Firestore read/write smoke test works in development.
- Storage upload smoke test works in development.

## Phase 1: Auth, Tenant, and Company Onboarding

Product plan references:

- `2. WHO THIS IS FOR`
- `5. THE PRIMARY USER-FACING OBJECTS`
- `28B. SETUP WIZARD UI`

Goal: create the foundation for one company/shop using Corvus Lite.

Build:

- User profile
- Company/shop profile
- Tenant/company ID relationship
- Basic roles: owner, manager, staff, inspector, shipping
- First-login onboarding route
- Company basics form
- Key staff list

Use simple role checks. Avoid elaborate permissions until needed.

Acceptance criteria:

- First user can create a company.
- User belongs to a company.
- User can invite or manually create staff records, even if real invite email is deferred.
- App has a clear current company context.

## Phase 2: Core Data Model

Product plan references:

- `5. THE PRIMARY USER-FACING OBJECTS`
- `8. CUSTOMER JOURNEY FOR A MACHINE SHOP`
- `30. MVP SCOPE`

Goal: create the main Firestore collections and shared TypeScript types.

Core objects:

- companies
- users/profiles
- customers
- contacts
- machines
- capabilityProfiles
- rfqs
- quotes
- purchaseOrders
- jobs
- files
- issues
- qualityRecords
- shipmentRecords
- activityEvents

Design principles:

- Every operational object belongs to a company.
- Every job should have a stable ID and human-readable job number.
- Every important user/system action should be able to create an activity event.
- Files should be linkable to RFQs, quotes, POs, jobs, quality records, and shipments.

Acceptance criteria:

- Types are documented and used consistently.
- Firestore access is wrapped in a small data layer.
- Test seed data can create a demo company with customers, machines, jobs, and issues.

## Phase 3: App Shell and Command Center Skeleton

Product plan references:

- `4. THE PRODUCT FEELING`
- `27. COMMAND CENTER / DASHBOARD`
- `28. VISUAL UI DIRECTION`

Goal: create the first real Corvus Lite screen.

Build UI:

- Left sidebar navigation
- Top header/search area
- Command Center route
- Jobs route placeholder
- Customers route placeholder
- Files route placeholder
- Issues route placeholder
- Quality route placeholder
- Settings route placeholder

Dashboard skeleton:

- Active Jobs
- At Risk
- Open Issues
- Waiting Material
- Waiting Inspection
- Ready to Ship
- Recent Activity
- Needs Attention
- Shop Pulse placeholder

Style:

- Quiet, utilitarian, dense but organized
- White/cool gray background
- Charcoal text
- Teal/amber/red status accents
- 8px radius components
- No marketing hero
- No decorative blobs

Acceptance criteria:

- Logged-in user lands on Command Center.
- Layout is usable on desktop and reasonable on tablet.
- Demo data renders in the dashboard.

## Phase 4: Capability Setup Wizard

Product plan references:

- `11. CAPABILITY CHECK`
- `28B. SETUP WIZARD UI`

Goal: collect shop capability data and store it as a structured capability profile.

Build wizard sections:

- Company basics
- Shop type
- Machine list
- Work envelope limits
- Materials supported
- Materials avoided
- Processes done in-house
- Common outside processes
- Inspection equipment
- Certifications
- Preferred work
- Work to avoid
- Normal tolerance comfort
- Challenging tolerance thresholds
- Standard quote/lead time preferences
- Preferred communication channel

AI-native behavior:

- Allow plain-language capability notes.
- Later or in this phase, use Kimi to structure messy notes into a capability profile.
- Always let the user review and edit the structured result.

Acceptance criteria:

- A company can complete or skip setup.
- A structured capability profile is stored.
- Capability profile is editable later.
- The UI makes setup feel practical, not like enterprise implementation paperwork.

## Phase 5: RFQ / Job Intake

Product plan references:

- `9. RFQ / JOB INTAKE`
- `10. DRAWING REVIEW`
- `24. CHAT AS A REAL INTERFACE`

Goal: create a manual RFQ intake workflow before email automation exists.

Build:

- Create RFQ screen
- Customer/contact selection or creation
- Manual entry for part number, revision, quantity, material, requested due date
- Special notes field
- Attachment area
- RFQ status: draft, intake review, ready for capability check, quoted, declined

Do not require every field.

Acceptance criteria:

- User can create an RFQ with partial information.
- Missing info is visible but not blocking unless required for the next step.
- RFQ appears in a list and can be opened.

## Phase 6: File Upload and Document Package

Product plan references:

- `9. RFQ / JOB INTAKE`
- `10. DRAWING REVIEW`
- `15. TRAVELER DRAFT`

Goal: let the user attach the files that define the job.

Build:

- Upload drawing PDF
- Upload CAD/STEP/DXF as attachment
- Upload customer email text as pasted note or file
- Upload PO/quote later
- Store file metadata
- Link files to RFQ/job

Do not parse CAD yet.

Acceptance criteria:

- Files upload to Firebase Storage.
- File metadata is saved in Firestore.
- Files are visible on RFQ/job detail pages.
- User can remove or replace a file.

## Phase 7: LLM Extraction With Human Review

Product plan references:

- `9. RFQ / JOB INTAKE`
- `10. DRAWING REVIEW`
- `7. THE TRUST BOUNDARY`

Goal: use Kimi to extract structured information from available RFQ text and drawing text/PDF extraction.

Build:

- Backend function that receives RFQ text and extracted document text
- Kimi prompt for structured extraction
- Confidence labels when possible
- Extraction result object
- Human review UI
- Apply accepted fields to RFQ

Start with text extraction from PDFs if possible. If PDF extraction is unreliable, store the limitation and allow manual entry.

Extract:

- Customer
- Contact
- Part number
- Revision
- Quantity
- Material
- Requested delivery date
- Finish requirements
- Cert requirements
- Special notes
- Missing information
- Risk notes

Acceptance criteria:

- User can run extraction on an RFQ.
- Extracted fields are shown before being applied.
- User can accept, edit, or reject extracted fields.
- AI output never silently overwrites human-entered data.

## Phase 8: Capability Check

Product plan references:

- `11. CAPABILITY CHECK`
- `28B. SETUP WIZARD UI`
- `7. THE TRUST BOUNDARY`

Goal: compare RFQ/drawing requirements against the structured capability profile.

Build:

- Capability check action on RFQ
- Backend function that reads RFQ + capability profile
- Structured rule checks for obvious mismatches
- Kimi-assisted explanation for ambiguous cases
- Capability result UI

Result should include:

- Likely compatible / needs review / likely not compatible
- Matched capabilities
- Risks
- Missing information
- Human confirmation needed
- Explanation of which capability fields were used

Acceptance criteria:

- RFQ can produce a capability check result.
- Result references the stored capability profile.
- Human can mark capability as approved, rejected, or needs more info.
- The system does not make final quoting decisions by itself.

## Phase 9: Quote Prep

Product plan references:

- `12. QUOTE PREP`
- `13. MATERIAL COSTING`

Goal: create a human-reviewed quote draft workflow.

Build:

- Quote draft screen
- Human-entered setup time
- Human-entered cycle time
- Human-entered material estimate
- Human-entered outside processing estimate
- Preferred margin/markup field if desired
- Lead time / committed delivery date
- Kimi-generated customer-facing quote notes
- Quote approval status

Material costing:

- Show `Material Costing (coming soon)` as a UI feature placeholder.
- For now, material estimate is user-driven.

Acceptance criteria:

- User can create a quote draft from RFQ.
- User can enter pricing inputs manually.
- Kimi can draft assumptions/exclusions/customer language.
- User must approve quote before RFQ can move forward.

## Phase 10: PO Intake and Job Release

Product plan references:

- `14. PO INTAKE`
- `15. TRAVELER DRAFT`
- `16. PLANNING AND SCHEDULING`

Goal: turn accepted quote/PO into an active job.

Build:

- Upload or manually enter PO details
- Link PO to quote/RFQ
- Human confirms due date
- Human confirms quantity
- Generate or enter job number
- Create job record
- Create basic traveler shell
- Initial job stage: Job Released or Build Readiness

PO comparison can start simple:

- Quantity mismatch
- Due date mismatch
- Price mismatch if available
- Revision mismatch if available

Acceptance criteria:

- Approved quote can become a job.
- PO is linked to job.
- Job has files, customer, due date, quantity, status, and stage.
- Any mismatches are visible before release.

## Phase 11: Visual Job Flow

Product plan references:

- `16. PLANNING AND SCHEDULING`
- `25. JOB DETAIL PAGE`
- `28A. JOB FLOW UI`

Goal: create the stage-by-stage job flow UI.

Build stages:

```text
RFQ Intake
-> Drawing Review
-> Capability Check
-> Quote Draft
-> Quote Approved
-> PO Intake
-> Job Released
-> Build Readiness
-> In Progress
-> Quality Review
-> Ready to Ship
-> Shipped
```

Build UI behavior:

- Completed stages checked off
- Current stage highlighted
- Future stages visible but quiet
- Blocked stages show issue indicator
- User can move forward
- User can move backward if needed
- User can open issue from a stage
- User can view missing information for the current stage

Do not turn this into operation-level routing.

Acceptance criteria:

- Every job has a visible flow.
- Stage transitions create activity events.
- Issues can visually block or mark a stage.

## Phase 12: Build Readiness and Job Board

Product plan references:

- `18. MATERIAL PREP AND BUILD READINESS`
- `19. BUILD STATUS`
- `27. COMMAND CENTER / DASHBOARD`

Goal: let the shop manage active job state without MES complexity.

Build:

- Job board columns
- Ready
- Queued
- In Progress
- Blocked
- Inspection
- Ready to Ship
- Drag/drop or status update controls
- Build readiness checklist

Readiness fields:

- Material ready: yes/no/unknown
- Machine assigned, optional
- Owner assigned
- Files attached
- Inspection required: yes/no/unknown
- Outside processing required, optional

Acceptance criteria:

- Jobs can move across statuses.
- Job board reflects active work.
- Readiness checklist affects whether job is ready to start.
- No operation-level setup paperwork is required.

## Phase 13: Issues Against Jobs and Machines

Product plan references:

- `17. ISSUES AND BOTTLENECKS`
- `24. CHAT AS A REAL INTERFACE`

Goal: treat bottlenecks as issues attached to jobs, machines, or the site.

Build:

- Issue list
- Create issue manually
- Attach issue to job
- Attach issue to machine
- Sitewide issue option
- Type, severity, owner, status
- Notes/photos
- Open/resolved lifecycle
- Issue indicators on job cards and job flow

Issue types:

- Machine down
- Waiting on material
- Waiting on customer clarification
- Waiting on tooling
- Waiting on programming
- Waiting on inspection
- Waiting on outside vendor
- Rework needed
- Staff unavailable
- Other

Acceptance criteria:

- User can create and resolve issues.
- Issues can mark jobs as blocked or at risk.
- Issue events appear in activity timeline.

## Phase 14: Quality Signoff

Product plan references:

- `20. QUALITY`

Goal: create lightweight inspection/signoff without becoming a full QMS.

Build:

- Quality requirement on job
- Inspection required: none, final inspection, FAI, CoC, custom
- Pass/fail/rework result
- Inspector signoff
- Attach photos/docs
- Notes
- Move to Ready to Ship when quality clears

Acceptance criteria:

- Job can require or waive inspection.
- Inspector can sign off.
- Failed/rework result blocks shipment.
- Quality record is linked to job and activity timeline.

## Phase 15: Shipping Readiness

Product plan references:

- `22. SHIPPING`

Goal: make it clear whether the job is ready to leave the building.

Build:

- Shipping readiness checklist
- Confirm quantity complete
- Confirm inspection passed or waived
- Delivery address manual field
- Required docs attached
- Packing photo upload
- Tracking number optional
- Mark shipped

Acceptance criteria:

- Job cannot be marked shipped without required readiness confirmations, unless user explicitly overrides with reason.
- Shipment record links to job.
- Marking shipped creates activity event and updates dashboard.

## Phase 16: Activity Timeline

Product plan references:

- `26. ACTIVITY TIMELINE`

Goal: make Corvus behavior and shop progress legible.

Build activity events for:

- RFQ created
- File uploaded
- Extraction run
- Capability check run
- Quote draft created
- Quote approved
- PO uploaded
- Job released
- Stage moved
- Issue opened/resolved
- Job status changed
- Quality signoff
- Shipping photo uploaded
- Job shipped

Acceptance criteria:

- Job detail page shows activity timeline.
- Activity events include actor: user, system, or future integration.
- Events are concise and human-readable.

## Phase 17: Dashboard Summaries and Basic Metrics

Product plan references:

- `27. COMMAND CENTER / DASHBOARD`

Goal: make the Command Center useful for daily shop awareness.

Build:

- Active jobs count
- At-risk jobs count
- Open issues count
- Waiting material count
- Waiting inspection count
- Ready to ship count
- Ships this week
- Needs Attention list
- Recent Activity
- Basic weekly chart
- Shop Pulse summary via Kimi

Shop Pulse should summarize actual data. If there is not enough data, say so plainly.

Acceptance criteria:

- Dashboard gives a useful daily overview.
- Needs Attention items link to relevant jobs/issues.
- Kimi summary never invents records not present in the database.

## Phase 18: Unified Chat-Ready Architecture

Product plan references:

- `24. CHAT AS A REAL INTERFACE`
- `29. BACKGROUND AGENT ARCHITECTURE`

Agent blueprint references:

- `AB-019`
- `AB-203` through `AB-210`
- `AB-217` through `AB-218`

Goal: prepare internal architecture for chat without integrating Slack yet.

Build:

- Message/event schema
- Internal `corvusMessages` or `communicationEvents` collection
- Parser interface for future natural-language updates
- Mock chat panel on job detail page
- Ability to create a job update from a mock message
- Ability to create an issue from a mock message

Important:

- There is one Corvus chat surface.
- Do not create separate chats per agent.
- Internal agents can request information through the shared communication layer.

Acceptance criteria:

- Mock messages can update job status with human confirmation.
- Mock messages can create issues with human confirmation.
- Activity timeline records chat-derived changes.

## Phase 19: Slack Integration

Product plan references:

- `24. CHAT AS A REAL INTERFACE`

Agent blueprint references:

- `AB-203` through `AB-210`
- `AB-218`

Goal: let staff update Corvus from Slack.

Introduce tool:

- Slack app

Build:

- Slack bot token config
- Slack signing secret verification
- Event receiver function
- Staff identity mapping
- Simple slash command or app mention
- Ask assigned person for status
- Parse simple status replies
- Create issue from Slack message

Start with constrained commands before broad natural language:

```text
/job 1048 running
/job 1048 complete 100
/job 1048 blocked waiting on material
/job 1048 scrap 2 bad threads
```

Then add natural-language handling with confirmation.

Acceptance criteria:

- Slack can update a job status.
- Slack can create an issue.
- Corvus asks short, answerable questions.
- Ambiguous replies require confirmation before changing records.

## Phase 20: Agent / Background Worker Hardening

Product plan references:

- `29. BACKGROUND AGENT ARCHITECTURE`

Agent blueprint references:

- `AB-009` through `AB-016`
- `AB-023` through `AB-032`
- `AB-033` through `AB-062`
- `AB-089` through `AB-128`
- `AB-139` through `AB-202`
- `AB-211` through `AB-288`

Goal: make background intelligence reliable.

Build:

- Clear backend service boundaries
- Prompt templates stored in code
- Structured LLM response validation
- Retry/error handling
- Audit logs for AI actions
- Human confirmation for risky changes
- Advanced/beta trace view if useful

Possible internal workers:

- Intake extraction worker
- Capability check worker
- Quote draft worker
- Shop Pulse summary worker
- Chat interpretation worker

Acceptance criteria:

- AI outputs are validated before use.
- Failed AI calls do not corrupt records.
- User can see when AI produced a suggestion versus when a human approved it.

## Phase 21: Polish, Testing, and Deploy Readiness

Goal: make the app demoable and usable with a real design partner.

Build/test:

- Seed demo machine shop
- Seed realistic jobs and issues
- Mobile/tablet review for shop floor use
- Desktop dashboard review
- Auth/security rules review
- Firestore index review
- Storage rules review
- Error states
- Empty states
- Loading states
- Basic accessibility
- Deployment to Firebase Hosting

Acceptance criteria:

- A design partner can log in, create RFQs, upload files, check capability, draft quote, release job, track job flow, create issues, sign off quality, and mark shipped.
- No section of the app depends on fake agent names to make sense.
- The product feels like a shop control panel, not an AI toy.

## Deferred Features

These are intentionally later:

- Email RFQ intake
- Email quote sending
- Resend integration
- Inbound PO email parsing
- Qdrant/vector database
- Similar past job retrieval
- Deep CAD parsing
- Material supplier lookup
- Exact inventory/remnant tracking
- Outside processing vendor automation
- Full production scheduling
- Full QMS workflows
- Full MES operation routing

Do not introduce these until the core workflow proves useful.

## How To Assign Future Codex Work

Use prompts like:

```text
Read docs/CORVUS_LITE_PRODUCT_PLAN.txt sections 11 and 28B, then implement Phase 4 from docs/CORVUS_LITE_BUILD_INSTRUCTIONS.md. Keep scope limited to the capability setup wizard. Do not implement capability checks yet.
```

Or:

```text
Read product plan sections 17 and 24, then implement Phase 13. Build issues against jobs and machines. Do not add Slack yet.
```

Each coding session should:

1. Read the relevant product plan sections.
2. Read the relevant phase in this file.
3. Inspect the existing codebase.
4. Implement only that phase or subphase.
5. Add focused tests where practical.
6. Run available checks.
7. Report what was completed and what remains.

## Should The Product Plan Be Renumbered?

Not immediately.

The product plan already has numbered major sections, which is enough for now.

Before the codebase gets much larger, it may be useful to convert `CORVUS_LITE_PRODUCT_PLAN.txt` into Markdown with stable anchors. That would make references easier, for example:

- `# 11. Capability Check`
- `# 28A. Job Flow UI`
- `# 28B. Setup Wizard UI`

But this is not required before coding begins.

For now, reference the section numbers and titles exactly as written in the product plan.
