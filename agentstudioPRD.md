# PropPulse Studio  
## Product Requirements Document (PRD)  
**Version 1.0 · March 2026**  
**CONFIDENTIAL**

---

# 1. Executive Summary

PropPulse Studio is a paid SaaS platform built specifically for real estate agents. It enables agents to generate branded, platform-ready marketing content in minutes — tied to live, timely real estate news hooks — without requiring design skills or third-party tools.

The core value proposition is **time-to-post**.

An agent:
1. Opens the app  
2. Selects a live news story  
3. Chooses a campaign type  
4. Receives six AI-generated branded image variations  
5. Downloads assets sized for Instagram, LinkedIn, and Email  

All contact details are programmatically stamped for accuracy.

---

## Problem Statement

- Agents need consistent social presence to compete.
- Most lack time, design skills, or budget for content creation.
- Generic templates feel impersonal.
- Timely, news-driven content performs better but requires research and manual effort.

---

# 2. Product Vision & Goals

## Vision

To become the default weekly content tool for independent real estate agents.

## v1.0 Goals

1. Launch paid SaaS with freemium onboarding  
2. Deliver full generation loop:  
   Brand Setup → News Selection → Generation → Download  
3. Support four output types:
   - Instagram Feed (1:1)
   - Instagram Story (9:16)
   - LinkedIn (4:5)
   - Email Flyer (2:3)
4. Implement credit-based usage with hard cap  
5. Per-agent isolated workspaces  
6. Admin dashboard for monitoring usage and revenue  

## Out of Scope (v1.0)

- Social scheduling / direct publishing  
- Team multi-seat accounts  
- Twitter/X or print outputs  
- Video content  
- CRM integrations  

---

# 3. Target Users

## Primary Persona — Independent Agent

| Attribute | Detail |
|------------|---------|
| Role | Licensed real estate agent |
| Experience | 2–15 years |
| Market | Residential |
| Tech Comfort | Moderate |
| Pain Point | No time for content creation |
| Current Solution | Canva, VA, or nothing |
| Willingness to Pay | $30–$75/mo |

## Secondary Persona — Team Lead

Managing 2–5 agents. Not in v1.0 scope but must be considered in data model design.

---

# 4. Feature Requirements

---

## 4.1 Authentication

- Email/password signup  
- Google SSO (OAuth)  
- Email verification  
- Password reset  
- Strict per-agent workspace isolation  

---

## 4.2 Billing & Credits

### Pricing Model

**Free Tier**
- Limited monthly credits
- Watermarked outputs
- Limited campaign types
- 7-day asset history

**Paid Tier — $45/mo**
- Full credit allocation
- No watermark
- All campaign types
- Unlimited asset history
- Full brand kit storage

### Credit Rules

- Credits visible in top navigation  
- Low-credit warning at 20% remaining  
- Hard cap at zero credits  
- Monthly reset on billing anniversary  
- No rollover  

Billing powered by Stripe (subscriptions + credit bundles).

---

## 4.3 Brand Kit

Persistent per account.

### Asset Uploads

- Agent headshot (required)
- Brokerage logo
- Team logo
- Property photo
- Custom background
- Award / badge

Max 6 uploads.  
Max file size: 10MB.

### Agent Info (Stamped via Sharp)

- Full name  
- Phone number  
- License number  
- Brokerage  
- Website  
- Market areas  

This information is never AI-generated.

### Style Preferences

- Brand colors
- Visual themes:
  - Luxury Dark
  - Clean Light
  - Modern Green
  - Bold Violet
  - Warm Rust
  - Sky Minimal
- Caption tone:
  - Professional
  - Approachable
  - Authoritative
  - Inspirational

---

## 4.4 News Feed

Core differentiator.

- Top 5 real estate stories refreshed daily  
- Categories: rates, local data, trends  
- Source + recency displayed  
- “Hot” badge for engagement  
- Injected into image generation prompt  

---

## 4.5 Content Generation

### Campaign Types

- Market Update  
- Just Listed  
- Just Sold  
- Open House  
- Buyer Tips  
- Rate Update  

### Generation Pipeline

1. Configure campaign  
2. Send brand assets + context to Gemini  
3. Generate 6 variations  
4. Sharp overlays contact info  
5. Resize per platform  
6. Store in Google Cloud Storage  

### Output Formats

| Format | Dimensions | Platform |
|--------|------------|----------|
| Square Feed | 2048×2048 | Instagram |
| Story | 1080×1920 | Instagram |
| Portrait | 1200×1500 | LinkedIn |
| Email Flyer | 600×900 | Email |

### Caption & Hashtags

- One caption per campaign  
- 7–10 hashtags  
- Tone aligned to agent preference  
- One-click copy  

### Refinement

- Conversational refinement supported  
- Regenerates selected asset only  
- Costs 2 credits  

---

## 4.6 Asset Library

- All assets saved automatically  
- Filter by platform, campaign type, date  
- Free tier: 7-day retention  
- Paid: unlimited  

---

## 4.7 Admin Dashboard

Internal use only.

- User count (free vs paid)
- MRR tracking
- Per-user usage stats
- Generation volume
- Manual credit adjustments
- Churn tracking

---

# 5. Technical Architecture

## Stack Overview

| Layer | Technology |
|--------|-------------|
| Frontend | React |
| Backend | Node.js (Cloud Run) |
| Image Model | Gemini Nano Banana 2 |
| Text Stamping | Sharp |
| Auth | Firebase Auth |
| Database | Firestore |
| Storage | Google Cloud Storage |
| Billing | Stripe |

### Critical Architecture Decision

Sharp overlays all contact-critical information after generation.  
AI never renders contact data.

---

# 6. Core User Flows

## Onboarding

1. Signup  
2. Verify email  
3. Setup brand kit  
4. Land in Studio  
5. Generate first campaign  

## Returning Agent Flow

1. Login  
2. Select campaign  
3. Choose news hook  
4. Generate  
5. Select preferred asset  
6. Download / refine  

---

# 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Generation Time | < 45 seconds |
| Uptime | 99.5% |
| Data Isolation | Strict per-agent |
| Stripe Webhook Latency | < 5 seconds |
| Mobile | Tablet responsive |

---

# 8. Open Decisions

- Free tier credit allocation  
- Paid tier credit allocation  
- Credit bundle pricing  
- Refinement cost (1 or 2 credits)  
- Frontend framework choice  
- Final watermark placement  

---

# 9. Success Metrics (90 Days)

- Free → Paid Conversion > 15%
- Weekly active paid users > 60%
- Generations per paid user > 8/month
- Credit top-up rate > 20%
- Monthly churn < 8%
- NPS > 40

---

# 10. Credit Cost Reference

| Action | Cost |
|--------|------|
| Generate 6 variations | 12 credits |
| Refinement | 2 credits |
| Caption regeneration | 1 credit |
| Re-download | 0 credits |

---

# Output Naming Convention

`{agentId}_{campaignType}_{platform}_{timestamp}_{variant}.png`

---

**End of PRD v1.0**
