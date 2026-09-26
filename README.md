# I/O — AI-Powered UI Generation Platform

I/O is an advanced, real-time AI code generation platform built to turn text prompts into clean, deployable UI components. The engine leverages modern LLMs, resilient background event queues, and automated version control integration to deliver a seamless production-ready workspace.

* **Live URL:** https://i0-app.vercel.app/ 
* **Repo:** https://github.com/Genesispro-maker/I0

---

## Architectural Features

* **Resilient Event Architecture:** Migrated from low-level, Server-Sent Events (SSE) to **Inngest** to orchestrate resilient, distributed background jobs for step-by-step code generation.
* **Concurrency & Rate Limit Control:** Configured Inngest queues with exponential **back-offs, automated retries, and strict concurrency limits** to seamlessly manage upstream LLM rate-throttling (Gemini AI).
* **Automated Git Workflows:** Built an automated version control bridge using the **GitHub REST API** allowing users to deploy generated UI code directly to a new repository in a single click.
* **Type-Safe Data Layer:** Designed a robust PostgreSQL database schema using **Prisma ORM** coupled with **Supabase** for secure object storage.
* **Custom Security Infrastructure:** Rolled out a secure authentication extension including a password reset workflow driven by **Nodemailer** and secure, cryptographically random verification tokens generated via Node's `crypto.randomBytes`.

---

## Tech Stack

* **Frontend & Framework:** Next.js (App Router), React.js, TypeScript, Tailwind CSS
* **Database & Storage:** PostgreSQL, Prisma ORM, Supabase Storage
* **Event Queue & Real-time:** Inngest
* **AI Engine:** Google AI Studio (Gemini), but using the openAI Response API
* **Security & Utilities:** Nodemailer, Crypto API

---

## Architecture & Pipeline Breakdown

```text
 [ User Prompt ] 
        │
        ▼
 [ Next.js Edge Route ] ──( Triggers Event )──► [ Inngest Event Queue ]
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                 ▼                                 ▼
         [ Concurrency Throttling ]             [ Back-off & Retries ]          [ Real-time Updates Stream ]
                      │                                 │                                 │
                      └─────────────────────────────────┬─────────────────────────────────┘
                                                        │
                                                        ▼
                                                gemini-3.1-flash-lite
                                                        ▼
                                            [ Generated UI & Assets ]
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                                                   ▼
       [ Supabase Storage & Prisma DB ]                                         [ GitHub REST API Sync ]
```

### Why Inngest over Server-Sent Events (SSE)?
Standard Server-Sent Events break down easily when a network connection drops or an LLM takes too long to respond. By switching to Inngest, the generation logic is isolated into persistent background state machines. If an LLM call fails due to heavy traffic, the system safely backs off and tries again without losing the user's progress or dropping the socket connection.

---

## Local Development Setup

Follow these steps to run the project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com.git
   cd io-clone
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   DATABASE_URL="your-postgresql-url"
   SUPABASE_URL="your-supabase-url"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   OPENAI_API_KEY="your-openai-api-key"
   GEMINI_API_KEY="your-gemini-api-key"
   GITHUB_ACCESS_TOKEN="your-github-token"
   INNGEST_SIGNING_KEY="your-inngest-key"
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development servers:**
   Open two terminal tabs to run the application alongside the Inngest local dev server:
   ```bash
   # Tab 1: Next.js App
   npm run dev

   # Tab 2: Inngest Dev Server
   npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.
