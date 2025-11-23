# Virelo SaaS (Node + Express + SQLite)

This is a starter implementation of the Virelo lead follow-up SaaS, built as a coded web app instead of Bubble.

## Features

- User signup & login
- Each user only sees their own leads
- Dashboard with basic stats
- Leads list page
- Add new lead
- Lead detail page with status updates
- Message log per lead (internal notes, ready for SMS integration)
- Simple dark UI

## 1. Prerequisites

- Node.js (v18+ recommended)
- npm

## 2. Install

```bash
npm install
```

## 3. Configure environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- `SESSION_SECRET` to a long random string

Twilio values can remain blank until you integrate SMS.

## 4. Run locally

```bash
npm start
```

Visit: http://localhost:3000

## 5. Workflow

1. Go to `/signup` and create your first account.
2. You'll land on the dashboard.
3. Go to **Leads** → **Add lead** to create leads.
4. Click a lead to view and add messages/notes.
5. Update lead status from the lead detail page.

## 6. Deploying (example: Render.com)

1. Create a new private GitHub repo and push this project.
2. On Render (or similar), create a new **Web Service** from that repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from your `.env` (SESSION_SECRET, etc.).
6. Render will give you a public URL for your app (you can later connect a custom domain).

## 7. Next steps

- Add Twilio integration in `leads` routes to send real SMS.
- Add Stripe for payments and plan tiers.
- Add scheduled follow-ups using cron or a background worker.

