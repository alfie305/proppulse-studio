# claude.md — PropPulse Studio

> Source of truth: PropPulse Studio PRD v1.0 (March 2026). fileciteturn0file0L1-L10  
> This file defines non-negotiable engineering constraints for Claude Code contributions.

---

## 0) Mission

Build **PropPulse Studio**, a paid SaaS for real estate agents that generates **branded, platform-ready images in minutes** from **live real-estate news hooks**, with **credit-based usage** and **strict per-agent data isolation**. fileciteturn0file0L20-L40

---

## 1) Non‑negotiable Guardrails

### 1.1 Contact text must NEVER be AI-generated
All contact-critical info is stamped **programmatically** (Sharp) from the database:
- Full name
- Phone number
- License number (e.g., DRE #)
- Brokerage name
- Website / CTA URL

**Do not** place any of the above into image prompts.  
**Do not** rely on model-rendered text for these fields. fileciteturn0file0L180-L205

### 1.2 Multi-tenancy is strict
- Every Firestore document is scoped by `agentId`
- Every query must filter by authenticated `agentId`
- No cross-account reads/writes under any circumstance fileciteturn0file0L300-L310

### 1.3 Credits are transactional (reserve → confirm/release)
- Reserve credits at generation start
- Confirm deduction only on success
- Release on failure
- Hard cap: block generation at 0 credits fileciteturn0file0L120-L145

### 1.4 v1.0 scope boundaries
Out of scope for v1.0:
- Social scheduling / direct publishing
- Team/brokerage multi-seat accounts
- Twitter/X, Pinterest, print outputs
- Video / animation
- CRM integrations fileciteturn0file0L70-L90

If you see UI prototypes that include these, treat them as **“future”** or **demo-only** and do not build them into v1.0.

---

## 2) Stack (v1.0)

- Frontend: React (framework TBD)
- Backend/API: Node.js on Google Cloud Run
- Auth: Firebase Authentication (email/password + Google SSO)
- DB: Firestore
- Storage: Google Cloud Storage
- Billing: Stripe (subscriptions + one-time credit top-ups)
- Image generation: Gemini Nano Banana 2 (`gemini-3.1-flash-image-preview`)
- Text stamping: Sharp (Node.js) fileciteturn0file0L250-L290

---

## 3) Canonical Generation Pipeline (DO NOT REORDER)

1. Authenticate user (Firebase Auth)
2. Authorize workspace (agentId scope)
3. Validate credits (>= required)
4. Load brand kit assets + style preferences
5. Load news hook (optional)
6. Call image model with:
   - reference images (headshot required)
   - campaign type
   - style + theme
   - news hook summary/context
   - output format targets
7. Receive 6 image variations
8. Post-process each:
   - Sharp overlay contact text at precise pixel coords (from DB)
   - Resize/crop to required output dimensions
9. Store final assets in GCS
10. Write metadata to Firestore (scoped by agentId)
11. Confirm credit deduction
12. Return signed URLs + metadata to client fileciteturn0file0L210-L245

---

## 4) Prompt Rules (Image Model)

Prompts MUST include:
- Campaign type: Market Update / Just Listed / Just Sold / Open House / Buyer Tips / Rate Update fileciteturn0file0L160-L175
- Visual theme (Luxury Dark, Clean Light, etc.)
- Brand colors constraints
- Platform format/dimensions request
- News hook: title + 2–4 sentence summary + source + recency

Prompts MUST NOT include:
- Phone numbers
- License numbers
- Exact brokerage name
- URLs
- Any user PII not needed for creative composition fileciteturn0file0L180-L205

---

## 5) Output Formats (v1.0)

- Instagram Feed: 2048×2048 (1:1)
- Instagram Story: 1080×1920 (9:16)
- LinkedIn: 1200×1500 (4:5)
- Email Flyer: 600×900 (2:3) fileciteturn0file0L206-L229

Do not add additional formats in v1.0.

---

## 6) Storage & Naming

GCS paths must be agent-scoped:
- `/agents/{agentId}/uploads/`
- `/agents/{agentId}/generated/` fileciteturn0file0L300-L310

Filename convention:
`{agentId}_{campaignType}_{platform}_{timestamp}_{variant}.png` fileciteturn0file0L360-L370

Free tier retention:
- Apply TTL/lifecycle deletion for generated assets (7 days) fileciteturn0file0L230-L235

---

## 7) Billing & Webhooks (Stripe)

- Subscriptions: monthly ($45/mo target)
- One-time purchases: credit top-ups
- Webhooks update plan state + credit entitlements
- Verify Stripe signatures
- No credit grants without verified webhook event fileciteturn0file0L110-L145

Monthly credit rules:
- Reset on billing anniversary
- No rollover fileciteturn0file0L135-L145

---

## 8) News Feed Rules (v1.0)

- Show top 5 real estate stories refreshed daily
- Show source + recency (e.g., “Reuters · 2h ago”)
- Inject selected story as **context** for generation fileciteturn0file0L146-L160

---

## 9) Performance & Reliability Targets

- 6-asset generation time target: <45 seconds
- Uptime: 99.5% monthly
- Stripe webhook state reflection: <5 seconds
- Mobile responsiveness: tablet minimum fileciteturn0file0L320-L345

---

## 10) Coding Standards (Claude Code)

When making changes:
- Prefer small, reviewable commits
- Do not introduce new infra unless required for v1.0 scope
- Add basic unit tests for credit logic, agentId scoping, and webhook verification
- Fail closed: if uncertain about auth/agentId/credits, block and log

Never:
- Remove Sharp stamping layer
- Put contact text into prompts
- Make any non-agent-scoped Firestore query
- Bypass credit hard cap
- Add out-of-scope v1.0 features fileciteturn0file0L70-L90
