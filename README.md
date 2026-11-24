# Vesttara Demo

A presentation-ready, fictional wealth-management product built with Next.js App Router, React, TypeScript, Tailwind CSS, Recharts, Lucide, and Framer Motion. It opens on the demo **Login** page with one-click autofill credentials for Admin, Advisor, and Client (plus direct one-click entry). When signed in as **Admin**, every module supports full in-session **Add, Edit, and Delete** controls (plus one-click Reset demo data). The public platform tour is at `/platform`.

## Three steps

1. **Install:** `npm install` (Node.js 22 recommended).
2. **Run:** `npm run dev` and open `http://localhost:3000`.
3. **Deploy:** `npx vercel --prod` from the project root. Select the Next.js preset; no database, secrets, or environment variables are needed.

## A two-minute walkthrough

- Open a household from the overview. Change chart ranges and switch between holdings, accounts, and transactions.
- In **AI Assistant**, choose **Create a follow-up task for John**. Open the task in **Clients & CRM**, edit its due date, then complete it.
- Move a pipeline card by drag-and-drop or its accessible stage selector. Add a note and inspect the activity timeline.
- Switch to **Client**. Browse John Everly’s three accounts, message the advisor, book a meeting, add document metadata, and open the quarterly PDF.
- Switch to **Admin** for the permission matrix, 15-user directory, audit events, illustrative integration contracts, and ownership handoff.
- Open **Explore Vesttara** for the video-led platform tour, build/reuse comparison, 90-day roadmap, and session-only proposal brief.

## Demo boundaries

All financial fixtures are deterministic and local in `/data`. The June 30, 2025 snapshot includes 1 admin, 2 advisors, 12 clients, 30 accounts, 200 transactions, 40 notes, 15 documents, and 12 months of performance history. All identities, funds, and account balances are invented. `/data/media.ts` centralizes remotely hosted stock media and credits.

There is **no application backend, database client, authentication, AI provider, telemetry, or integration service**. Pages are statically prerendered; `/api/health` is a static preview health document. No record mutations leave the browser. Session changes and role selection reset on refresh. Simulated role scoping demonstrates UX, not a production authorization boundary. Production confidentiality requires verified identity and server-enforced authorization.

Uploads keep only a filename and size. Sample PDF: `/reports/quarterly-report.pdf`. Assets use local geometric fallbacks and the fonts are bundled, not fetched from a font CDN.

## Validation

The included Playwright suite covers fixture integrity, chart controls, CSV export, themes, assistant-to-CRM actions, advice refusal, note editing, pipeline drag-and-drop, scoped client documents, booking, messaging, PDF access, admin permissions, and proposal submission. With the app running, use `npx playwright install chromium` followed by `npx playwright test`. Set `DEMO_BASE_URL` to test a deployed preview instead of localhost.

Responsive dashboard checks capture **360, 768, 1024, and 1440 px** layouts. The demo was also smoke-tested with mobile Firefox and WebKit engines. Browser test artifacts are written to the git-ignored `test-results/` directory.

**Demo only. Dummy data. Not investment advice.**
