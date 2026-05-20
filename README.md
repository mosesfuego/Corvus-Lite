# Corvus Lite

Corvus Lite is a lightweight operations control panel for small machine shops.

It is intentionally not a cheaper MES, ERP, or QMS. The first product goal is to help a shop know what is happening, what is blocked, what is late, what needs inspection, and what can ship without creating paperwork overhead.

## What Has Been Done So Far

This repo was created as the clean home for Corvus Lite after the product was initially explored inside the broader Corvus project workspace.

Work completed so far:

- Created the GitHub repo at `mosesfuego/Corvus-Lite`.
- Used `milliorn/nextjs-firebase-starter` as a sourdough starter, not as a full product template.
- Kept the useful starter foundation: Next.js, React, TypeScript, Firebase Auth, Firestore, Firebase Storage, Tailwind, and protected-route patterns.
- Replaced the generic starter UI with a Corvus Lite-specific starter shell.
- Added a landing page that frames Corvus Lite as a machine shop command center.
- Added sign-in and sign-up pages backed by Firebase Auth helpers.
- Added a protected app layout with a left-side Corvus Lite navigation shell.
- Added a Command Center scaffold with demo shop metrics, job flow, jobs board, open issues, shop pulse, and activity.
- Added a Jobs page scaffold using demo job data.
- Added a Settings placeholder for company onboarding and capability setup.
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

The codebase is intentionally still a starter. Company onboarding now writes to Firestore, but RFQ intake, job records, file upload, and the agent framework are not implemented yet.

## Current Product State

This repository starts from the useful parts of `milliorn/nextjs-firebase-starter`, then replaces the generic app shell with a Corvus Lite-specific foundation.

The app currently includes:

- Next.js 15 + React 19 + TypeScript
- Firebase client setup for Auth, Firestore, and Storage
- Email/password sign in and sign up
- Protected app layout
- Corvus Lite command center scaffold
- Jobs list scaffold
- Settings placeholder for company/capability setup
- Demo data for jobs, issues, activity, and job flow
- Founding product/agent documents

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
Storage: Firebase Storage
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
- Storage

The app can render without real Firebase values, but sign in, sign up, Firestore, and Storage require a configured project.

This repo is already pointed at the Firebase project alias `corvus-lite` through `.firebaserc`.

Console setup checklist:

1. Open Firebase Console for the `corvus-lite` project.
2. Go to **Authentication > Sign-in method** and enable **Email/Password**.
3. Go to **Firestore Database** and create the database.
4. Go to **Storage** and create the default bucket.
5. Go to **Project settings > General > Your apps** and create/register a Web app if one does not already exist.
6. Copy the Web app config values into `.env.local`.

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

1. Finish Phase 0 foundation checks.
2. Build Phase 1 auth, tenant, and company onboarding.
3. Build Phase 2 core data model.
4. Build Phase 3 command center from real records instead of demo data.
