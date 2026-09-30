# 📋 FormFlow — Architecture & Planning Document

## 1. Executive Summary
**FormFlow** is an advanced, AI-powered dynamic form builder and survey platform built to revolutionize form creation. Combining drag-and-drop flexibility with natural language AI generation (powered by Google Gemini API with Web Search Grounding), FormFlow allows creators to design, theme, render, distribute, and analyze interactive forms in seconds.

---

## 2. Problem Statement & Mission
Traditional form builders suffer from key limitations:
- **Rigid & Manual Setup:** Setting up complex fields, rating scales, and conditional logic by hand is time-consuming.
- **Boring & Static Aesthetics:** Forms often look generic and fail to engage respondents, leading to low completion rates.
- **Lack of Intelligent Context:** Traditional builders don't suggest relevant questions or research domain-specific standards.
- **Data Silos & Weak Integrations:** Exporting and routing responses to custom endpoints often requires third-party automation tools like Zapier.

**FormFlow's Mission:** Provide a frictionless, visual, AI-assisted form platform that turns natural language intent into beautiful, responsive, logic-enabled web forms with instant real-time analytics and webhooks.

---

## 3. Technology Stack

| Layer | Technology / Library | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router, Turbopack) | High-performance React application architecture |
| **UI & Styling** | React 19, Tailwind CSS v4, Framer Motion | Obsidian glassmorphism aesthetic, smooth micro-animations |
| **Drag & Drop Engine** | `@dnd-kit/core`, `@dnd-kit/sortable` | Accessible, smooth canvas question reordering |
| **Icons & Visuals** | `lucide-react`, `canvas-confetti`, `qrcode` | Crisp UI icons, reward animations, QR code generation |
| **Data Analytics** | `recharts`, `xlsx` | Interactive response visualizer & multi-format data exporter |
| **Backend & API** | Next.js Route Handlers, Node.js Server | RESTful API endpoints, server bridge |
| **Database & Auth** | Supabase (PostgreSQL), Supabase Auth / OTP | Row Level Security (RLS), real-time response persistence |
| **AI Engine** | Google Gemini API (`gemini-2.0-flash`, `gemini-1.5-flash`) | Web Search Grounding, JSON output schema enforcement, User Memory |

---

## 4. System Architecture & Component Design

```
                     ┌──────────────────────────────────────────────┐
                     │            User / Client Browser             │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │               Next.js App Router              │
                    │   (/builder, /dashboard, /f/[slug], /form/[id])│
                    └───────┬───────────────────────┬───────────────┘
                            │                       │
                            ▼                       ▼
            ┌───────────────────────────────┐   ┌───────────────────────────────┐
            │   Drag & Drop Form Canvas     │   │   Floating AI Assistant       │
            │   (dnd-kit + FormSchema)      │   │   (AiFormAssistant.tsx)       │
            └───────────────┬───────────────┘   └───────────────┬───────────────┘
                            │                                   │
                            │                                   ▼
                            │                   ┌───────────────────────────────┐
                            │                   │   /api/ai/generate-form       │
                            │                   │   (Gemini + Web Grounding)    │
                            │                   └───────────────┬───────────────┘
                            │                                   │
                            ▼                                   ▼
            ┌───────────────────────────────────────────────────────────┐
            │                  Supabase PostgreSQL DB                   │
            │      (forms, responses, integrations, webhook_logs)       │
            └───────────────────────────────────────────────────────────┘
```

---

## 5. Core Feature Modules

### 5.1 Interactive Drag & Drop Builder
- Palette featuring 8 field types: **Welcome Screen**, **Short Text**, **Paragraph**, **Multiple Choice**, **Yes/No**, **Rating Stars**, **File Upload**, and **Date Picker**.
- Property Inspector for editing field labels, descriptions, validation rules (character limits, file size limits), and custom text colors (`textColor`).
- Theme Customizer with banner background gradients, card opacity controls, poster height adjustments, and background patterns.

### 5.2 Floating AI Form Assistant Chatbox
- Natural language form builder powered by Gemini API with Google Web Search grounding.
- Multi-turn conversation memory (`chatHistory`) and learned user preferences (`userMemory`).
- Intent Classification Engine separating field additions, field edits, color theme adjustments, and full new form generation.
- Zero data loss guarantee: existing question IDs and structures are preserved during prompt-based theme or field edits.

### 5.3 Multi-Layout Form Renderer
- **Single-Page Mode:** Classic scrollable web form view.
- **Conversational / Quiz Mode:** Typeform-style step-by-step question view with keyboard navigation and progress indicators.
- **Conditional Branching:** Logic rules (`show`, `hide`, `jump`, `end_form`) evaluated dynamically on answer selection.

### 5.4 Analytics, Data Export & Integrations
- Recharts-powered response distributions, completion rates, and average rating cards.
- Multi-format data exporting: **CSV**, **Excel (.xlsx)**, and JSON.
- Built-in SVG/PNG **QR Code Generator** for mobile form distribution.
- Real-time **Webhook Engine** delivering form submission payloads to external endpoints with full delivery logs.

---

## 6. Security & Data Integrity
- **Supabase Row Level Security (RLS):** Form schemas and backend metrics are protected per user account; form submission endpoints allow public access only for active forms.
- **Input Sanitation & Schema Validation:** Strict TypeScript runtime checks on incoming AI and client payloads.
- **Client State Resilience:** Lazy state initialization prevents `localStorage` overwrites during Next.js client rehydration.
