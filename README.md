# Cefalix Launch Simulator

Functional MVP scaffold for the Cefalix educational simulator.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase
- Framer Motion

## Main routes

- `/` landing page
- `/student/demo-session` student MVP flow
- `/facilitator/demo-session` facilitator MVP flow

## Core code

- `lib/engine.ts` MVP teaching engine
- `lib/constants.ts` MVP annual budgets and actions
- `lib/types.ts` MVP student/facilitator domain types
- `lib/supabase/client.ts` browser Supabase client
- `lib/supabase/server.ts` server Supabase client
- `supabase/schema.sql` backend schema starter for sessions, teams and yearly results

## Run

1. `npm install`
2. `npm run dev`

## Supabase env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
