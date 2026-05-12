# Deploy Signal on Netlify

Signal is a Next.js App Router app. Netlify supports App Router, route handlers,
server components, middleware, and image optimization through its OpenNext
adapter, so this project can be deployed directly from GitHub.

## 1. Prepare services

Create production projects for:

- Supabase: database and storage.
- Clerk: team sign-in.
- Anthropic: AI chat, enrichment, and email drafting.

Optional integrations can be added later:

- AgentMail: outbound email and reply/delivery webhooks.
- Browserbase: browser automation signals.
- Exa: web search and enrichment.
- QStash: scheduled jobs.
- Apify, Google Places, GitHub: extra enrichment and signal types.

## 2. Configure Supabase

Create a hosted Supabase project, then apply the migrations:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Copy these values into Netlify environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Use one Supabase project per team unless you intentionally redesign the shared
organization/contact tables for multi-tenant use.

## 3. Configure Clerk

Create a Clerk application and add these Netlify environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_FRONTEND_API_DOMAIN`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/`

In Clerk, enable the Supabase integration. In Supabase, configure Clerk as the
third-party auth provider using the same Clerk frontend API domain.

## 4. Configure Netlify

In Netlify, import the GitHub repository and use:

- Build command: `pnpm build`
- Publish directory: `.next`
- Node version: `20`

This repo includes `netlify.toml`, so Netlify should pick those values up
automatically.

Add required environment variables:

- `ANTHROPIC_API_KEY`
- all Supabase variables from step 2
- all Clerk variables from step 3
- `NEXT_PUBLIC_APP_URL=https://<your-netlify-site-domain>`

Add optional environment variables as integrations are enabled:

- `AGENTMAIL_API_KEY`
- `AGENTMAIL_WEBHOOK_SECRET`
- `BROWSERBASE_API_KEY`
- `BROWSERBASE_PROJECT_ID`
- `EXA_API_KEY`
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `APIFY_API_TOKEN`
- `GOOGLE_API_KEY`
- `GITHUB_TOKEN`

## 5. Webhooks and callbacks

If AgentMail is enabled, configure its webhook URL:

```text
https://<your-netlify-site-domain>/api/agentmail/webhook
```

If QStash is enabled, use `NEXT_PUBLIC_APP_URL` as the public callback base URL.

## 6. Smoke test after deploy

After the first production deploy:

1. Open the Netlify site.
2. Sign up through Clerk.
3. Confirm the dashboard loads without missing-key banners.
4. Create a test campaign.
5. Import or add one company/contact.
6. Generate a draft email.
7. Review the draft in `/outreach/review`.
8. Only test sending after the production email provider is configured.

## Jacopo email tool integration

Signal currently sends through AgentMail. To use Jacopo's campaign-at-scale
tool, add a new provider adapter beside `src/lib/services/agentmail-service.ts`,
then update `src/lib/services/outreach-sender.ts` so approved drafts are handed
to Jacopo's API instead. Add a webhook route for Jacopo delivery, bounce, and
reply events, mirroring `src/app/api/agentmail/webhook/route.ts`.
