# ⚡ FlowForm — Drag-and-Drop No-Code Form & Survey Workflow Builder
> **SBIT Hackathon 2026 — Coders' Club Official Handbook**  
> **Problem Track:** WEB-08 Drag-and-Drop No-Code Form & Survey Workflow Builder  
> **Level:** Level 3 — Advanced (3rd Year Recommended)  

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![dnd-kit](https://img.shields.io/badge/dnd--kit-Zero--Latency-6366f1?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)

---

## 🌟 Executive Summary

**FlowForm** is an open-source, zero-latency drag-and-drop form and workflow builder engineered for campus hackathons, student organizations, and research surveys. It combines the visual elegance of **Typeform** ($25/mo) with the flexibility of custom workflow automation, enabling users to:
- Drag, drop, duplicate, and reorder 6 interactive field types with zero latency.
- Construct complex conditional logic jumps (`IF`, `THEN`, `ELSE`).
- Customize themes with Google typography, dark palettes, and layout modes (Conversational Card vs Single Page).
- Share forms via public URLs and instant mobile QR codes.
- Analyze responses with real-time distribution charts and 1-click CSV/Excel export.
- Trigger external webhooks (Discord / Slack / REST APIs) upon submission.

---

## 🎯 Core Functional Requirements (FR-1 to FR-6)

| Requirement | Module | Description & Implementation |
|---|---|---|
| **FR-1** | **Visual Form Builder Canvas** | Drag-and-drop 6 field types: *Short Text, Paragraph, Multiple Choice, Rating Stars, File Upload, Date Picker*. Powered by `@dnd-kit/sortable` with real-time property inspection and field duplication/deletion. |
| **FR-2** | **Conditional Logic Jump Engine** | Visual rule builder supporting `equals`, `not_equals`, `contains`, `is_empty`, and `is_not_empty` operators with `jump_to`, `show`, and `hide` actions + `ELSE` branching. Includes interactive Visual Flow Map. |
| **FR-3** | **Form Customizer & Theming** | Curated dark palettes (Indigo Aura, Emerald Matrix, Cyberpunk Rose, etc.), Google fonts (`Outfit`, `Inter`, `Plus Jakarta Sans`, `JetBrains Mono`), banner presets, and **Conversational Card Mode vs Single-Page Mode** toggle. |
| **FR-4** | **Public Shareable Link & QR Code** | Unique public URL `/form/[id]` with client-side validation, mobile optimization, dynamic QR code generation (`qrcode`), and celebratory confetti fireworks (`canvas-confetti`). |
| **FR-5** | **Response Analytics & CSV Export** | Live metrics (Total Submissions, Avg Time, Completion Rate, Device Breakdown), Multiple Choice percentage bars, 5-Star rating distribution, and 1-click CSV export engine. |
| **FR-6** | **Custom Webhook Integration** | Forward submissions to Discord channels (with rich embeds), Slack incoming webhooks, or custom endpoints. Includes live in-studio "Test Webhook" action reporting real HTTP latency. |

---

## 📐 Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       FlowForm Studio                       │
├─────────────────┬─────────────────────────┬─────────────────┤
│  Field Palette  │   Drag & Drop Canvas    │ Property Panel  │
│  (6 Field Types │   (@dnd-kit/sortable)   │ (Validation,    │
│  + Templates)   │   Reorder / Duplicate   │ Options, Scale) │
└────────┬────────┴────────────┬────────────┴────────┬────────┘
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Form JSON Schema Engine                  │
│       (Title, Fields, LogicRules, Theme, Webhooks)          │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌─────────────────────────────┐     ┌─────────────────────────────┐
│    Respondent Form View     │     │      Studio Analytics       │
│  - Conversational Card Mode │     │  - Real-Time KPI Cards      │
│  - Single-Page Mode         │     │  - Choice Distribution Bars │
│  - Dynamic Logic Evaluator  │     │  - 5-Star Rating Breakdown  │
│  - Confetti Completion      │     │  - 1-Click CSV Export       │
└──────────────┬──────────────┘     └─────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Non-Blocking Webhook Stream │──► Discord / Slack / REST APIs
└─────────────────────────────┘
```

---

## ⚡ Quickstart Guide

### 1. Installation
```bash
git clone https://github.com/your-team/flowform.git
cd flowform
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Key Routes
- **Studio Builder:** `http://localhost:3000`
- **Sample Hackathon Survey:** `http://localhost:3000/form/hackathon-registration-2026`
- **Forms API:** `http://localhost:3000/api/forms`
- **Webhook Test Endpoint:** `http://localhost:3000/api/webhooks/test`

---

## 📁 Repository Structure

```
project-innov8/
├── .data/
│   ├── forms.json                 # Pre-loaded forms & templates
│   └── responses.json             # Submissions dataset
├── docs/
│   ├── PLANNING.md                # Architectural planning & personas
│   ├── PROGRESS.md                # 12-hour progress log & milestones
│   ├── DEPLOYMENT.md              # Deployment guide (Vercel + Docker)
│   └── DEFENSE_QA.md              # Judge presentation defense guide
├── src/
│   ├── app/
│   │   ├── api/forms/             # RESTful API for forms & responses
│   │   ├── api/webhooks/test/     # Webhook verification endpoint
│   │   ├── form/[id]/page.tsx     # Public respondent view
│   │   ├── globals.css            # Dark theme tokens & scrollbars
│   │   ├── layout.tsx             # Google typography configurations
│   │   └── page.tsx               # Main FlowForm Studio dashboard
│   ├── components/
│   │   ├── analytics/             # Charts, metrics, CSV export
│   │   ├── builder/               # Palette, canvas, inspector, logic
│   │   └── respondent/            # Conversational & single-page engine
│   ├── lib/
│   │   ├── logicEngine.ts         # Deterministic branch jump engine
│   │   ├── storage.ts             # File-based document persistence
│   │   └── templates.ts           # Pre-built hackathon templates
│   └── types/
│       └── form.ts                # TypeScript domain models
└── README.md
```

---

## 🏆 Rubric Alignment & Highlights
- **Zero-Latency Drag & Drop:** Custom collision detection sensors eliminate drag delays.
- **Dual Presentation Engine:** Toggle between Typeform-style conversational cards and traditional single-page forms on demand.
- **Live Branch Flow Map:** Visualizes `IF-THEN-ELSE` question branching logic.
- **Dynamic QR Code:** Evaluators can immediately test the respondent experience on their smartphones.
- **Resilient Webhook Dispatcher:** Non-blocking async queue prevents slow third-party servers from stalling client submissions.
