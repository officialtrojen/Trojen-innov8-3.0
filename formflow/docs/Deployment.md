# 🚀 FormFlow — Deployment & Operational Guide

This guide provides step-by-step instructions for deploying and running FormFlow in development, production, and cloud environments (Vercel, Supabase, Docker, Node.js).

---

## 1. Prerequisites
- **Node.js**: v20.x or later
- **Package Manager**: `npm` (v10+), `pnpm`, or `yarn`
- **Database**: Supabase PostgreSQL project instance
- **AI Services**: Google Gemini API key

---

## 2. Environment Configuration (`.env.local`)

Create a `.env.local` file in the project root directory:

```env
# Google Gemini AI API Key (Required for AI Form Builder)
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Credentials (Required for persistence, auth, responses)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://app.supabase.com) project.
2. Go to the **SQL Editor**.
3. Copy the contents of [`scripts/auth-schema.sql`](file:///h:/hackathon3.0%20project/formflow/scripts/auth-schema.sql) into the SQL editor and click **Run**.
4. This will set up the core tables:
   - `forms` (Stores title, description, schema JSON, theme, public slug)
   - `responses` (Stores submitted answers, timestamps, and browser metadata)
   - `integrations` (Stores webhook URLs and configurations)
   - `webhook_logs` (Tracks webhook payload delivery status codes)
   - `profiles` (Stores user profiles synced with Supabase Auth)

---

## 4. Local Development

To run the development server with live reload:

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser.

To run the standalone Node server bridge:
```bash
npm run server
```

---

## 5. Production Build & Execution

To test the optimized production build locally:

```bash
# Build Next.js application
npm run build

# Start Next.js production server
npm run start
```

---

## 6. Cloud Deployment

### 6.1 Deploying to Vercel (Recommended)
1. Push your code to GitHub/GitLab.
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. Set Environment Variables in Vercel project settings:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy! Vercel automatically handles Next.js 16 App Router compilation and edge caching.

### 6.2 Self-Hosted Node.js / Docker Deployment
Build the production application and serve using `server.js`:
```bash
npm run build
node server.js
```

---

## 7. Health Checks & Maintenance
- **AI Health Check:** Send a test prompt via the UI or `POST /api/ai/generate-form` with `{ "prompt": "build job application" }`.
- **Webhook Logs:** Inspect delivery logs inside `/dashboard/integrations` or directly in `webhook_logs` table.
- **Exporting Data:** Test CSV and Excel exports inside `/dashboard/forms/[id]/responses`.
