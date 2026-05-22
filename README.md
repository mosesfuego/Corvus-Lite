# Corvus Lite

Corvus Lite is a lightweight operations control panel for small machine shops.

It is intentionally not a cheaper MES, ERP, or QMS. The first product goal is to help a shop know what is happening, what is blocked, what is late, what needs inspection, and what can ship without creating paperwork overhead.

## What Has Been Done So Far

This repo was created as the clean home for Corvus Lite after the product was initially explored inside the broader Corvus project workspace.

Work completed so far:

- Created the GitHub repo at `mosesfuego/Corvus-Lite`.
- Used `milliorn/nextjs-firebase-starter` as a sourdough starter, not as a full product template.
- Kept the useful starter foundation: Next.js, React, TypeScript, Firebase Auth, Firestore, Tailwind, and protected-route patterns.
- Replaced the generic starter UI with a Corvus Lite-specific starter shell.
- Added a landing page that frames Corvus Lite as a machine shop command center.
- Added sign-in and sign-up pages backed by Firebase Auth helpers.
- Added a protected app layout with a left-side Corvus Lite navigation shell.
- Added a Command Center with Firestore-backed shop metrics, job flow, jobs board, open issues, shop pulse, and activity.
- Added a Jobs page backed by Firestore records.
- Added Settings for company and capability setup.
- Added typed demo data for jobs, issues, activity, and stage flow.
- Added Firebase client helpers for Auth, Firestore, and Storage.
- Made Firebase initialization lazy so the app can build before real Firebase credentials are added.
- Added `.env.local.example` with Firebase and future Kimi environment variables.
- Added the three founding documents under `founding documents/`.
- Verified locally that `npm run build`, `npm run typecheck`, and `npm run lint` pass.

Chunk 1 completed:

- Added first-login onboarding at `/onboarding`.
- Added company/shop creation on Firebase Auth + Firestore.
- Set the first signed-in user role to `manager`.
- Added structured capability profile capture for machines, materials, processes, inspection equipment, certifications, preferred work, avoided work, tolerance comfort, and notes.
- Added key staff capture without real invitations yet.
- Added a simulated machine shop profile button for fast local testing.
- Added company context loading for protected app pages.
- Added Settings view for company summary, staff summary, and capability profile editing.
- Kept the implementation Spark-plan friendly: no Cloud Functions and no required Storage usage.

Chunk 2 completed:

- Added Firestore-backed core records for customers, jobs, issues, and activity events.
- Added a small operations data layer for creating jobs, updating job state, creating/resolving issues, recording activity, and seeding demo records.
- Added a jobs board backed by Firestore records instead of static demo-only data.
- Added job detail pages with visual stage flow, state controls, job-specific issues, and activity timeline.
- Added Issues page for job/site issue creation and resolution.
- Added Customers page for early customer memory.
- Added Command Center metrics and job board based on real Firestore records.
- Added a seed-demo-records path so local testing can populate a simulated machine shop after onboarding.

Thursday sprint checkpoint completed:

- Added `admin` as a role and bootstrapped `mosesfuego@gmail.com` to admin on profile load.
- Restricted simulation/demo controls to admin accounts.
- Added RFQ, contact, and machine record types.
- Added Firestore-backed RFQ list and RFQ detail pages.
- Added manual RFQ creation with pasted customer request text.
- Added an admin-only simulated RFQ button.
- Made RFQ creation grow lightweight customer/contact memory when new customer/contact data appears.
- Added machine linkage fields for issues so blockers can become job, machine, or sitewide issues.
- Added RFQs to the app navigation and Command Center metrics.
- Added an agent-ready folder structure with shared agent types, registry, orchestrator entry point, and the first live Intake Extraction Worker.
- Connected Kimi K2.6 through a server-side API route for RFQ extraction.

The codebase is intentionally still a starter. Company onboarding, core job records, and manual RFQ intake now write to Firestore. The RFQ intake agent can extract proposed fields for human review, but file upload/storage, quote/PO flow, quality signoff, shipping readiness, and chat are not implemented yet.

## Current Product State

This repository starts from the useful parts of `milliorn/nextjs-firebase-starter`, then replaces the generic app shell with a Corvus Lite-specific foundation.

The app currently includes:

- Next.js 15 + React 19 + TypeScript
- Firebase client setup for Auth and Firestore
- Email/password sign in and sign up
- Protected app layout
- Corvus Lite command center
- First-login company/shop onboarding
- Structured capability profile capture and editing
- Firestore-backed jobs board
- Firestore-backed RFQ intake list and detail pages
- Job detail pages with stage flow, status controls, issues, and activity
- Issues page
- Customers page
- Seedable demo data for jobs, issues, activity, and job flow
- Founding product/agent documents
- Agent scaffold under `src/agents`

## Founding Documents

The product brain lives in [`founding documents`](./founding%20documents):

- [`CORVUS_LITE_PRODUCT_PLAN.txt`](./founding%20documents/CORVUS_LITE_PRODUCT_PLAN.txt)
- [`CORVUS_LITE_BUILD_INSTRUCTIONS.md`](./founding%20documents/CORVUS_LITE_BUILD_INSTRUCTIONS.md)
- [`CORVUS_LITE_AGENT_BUILDER_BLUEPRINT.txt`](./founding%20documents/CORVUS_LITE_AGENT_BUILDER_BLUEPRINT.txt)

Future Codex build sessions should read the relevant phase in the build instructions and the relevant product/agent blueprint references before coding.

## Tech Stack

```text
Frontend: Next.js + React
Auth: Firebase Auth
Database: Firestore
Storage: Firebase Storage, later
Backend: Firebase Cloud Functions, later
Hosting: Firebase Hosting, later
LLM: Kimi K2.6, later
```

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.local.example .env.local
```

Fill in the Firebase values from your Firebase project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase Setup

Create a Firebase project and enable:

- Authentication: Email/Password provider
- Firestore Database
- Storage, later when file upload work begins

The app can render without real Firebase values, but sign in, sign up, and Firestore writes require a configured project.

This repo is already pointed at the Firebase project alias `corvus-lite` through `.firebaserc`.

Console setup checklist:

1. Open Firebase Console for the `corvus-lite` project.
2. Go to **Authentication > Sign-in method** and enable **Email/Password**.
3. Go to **Firestore Database** and create the database.
4. Go to **Project settings > General > Your apps** and create/register a Web app if one does not already exist.
5. Copy the Web app config values into `.env.local`.

Deploy Firestore rules once Firebase CLI is installed and authenticated:

```bash
npm run firebase:deploy:firestore:rules
```

Storage rules require Firebase Storage to be initialized first in the Firebase Console:

```text
Firebase Console -> Storage -> Get Started
```

After Storage is initialized, deploy Storage rules:

```bash
npm run firebase:deploy:storage:rules
```

Deploy indexes when indexes are added:

```bash
npm run firebase:deploy:indexes
```

The current v1 rules expect company documents to contain:

```ts
{
  ownerUid: string;
  memberUids: string[];
}
```

Most operational records should include a `companyId` field so rules can enforce tenant membership.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Next Build Priorities

Follow [`CORVUS_LITE_BUILD_INSTRUCTIONS.md`](./founding%20documents/CORVUS_LITE_BUILD_INSTRUCTIONS.md):

1. Add an “apply reviewed extraction” flow that writes accepted RFQ fields without silently overwriting human edits.
2. Add capability-check UI and worker using the stored company capability profile.
3. Add quote-prep draft workflow after capability check.
4. Add Phase 6 file upload only when Firebase Storage is initialized.
