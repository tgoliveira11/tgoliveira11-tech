# Email providers

PostForge sends transactional auth emails (verification, password reset, and other secure-auth account emails) through an app-provided `EmailProvider` wired in `src/lib/auth/secure-auth.ts`.

`@tgoliveira/secure-auth` owns the email templates and send triggers. PostForge only selects and configures the delivery provider.

---

## Providers

| `EMAIL_PROVIDER` | Use case | Sends real email? |
|------------------|----------|-------------------|
| `console` (default) | Local development | No — logs to server console |
| `resend` | Production | Yes — via [Resend](https://resend.com) |

Select the provider with `EMAIL_PROVIDER`. The factory lives in `src/lib/email/email-provider-factory.ts`.

---

## Local development (`console`)

Recommended local `.env.local`:

```env
EMAIL_PROVIDER=console
EMAIL_FROM="PostForge <noreply@localhost>"
```

Behavior:

- Emails are logged with `[postforge email]` in the server console
- No SMTP/API calls
- No `RESEND_API_KEY` required

### Manual local test

1. Set `EMAIL_PROVIDER=console` in `.env.local`.
2. Run `npm run dev`.
3. Register a new user at `/register`.
4. Confirm the verification email payload appears in the terminal logs.
5. Open `/forgot-password` and request a reset.
6. Confirm the reset email payload appears in the terminal logs.
7. Confirm no external email is sent.

---

## Production (`resend`)

Each blog created from the PostForge template must use **its own** Resend account, verified sending domain, DNS records, and Vercel environment variables.

PostForge does **not** ship with a shared Resend account or shared sender address.

### Required env vars

| Variable | Required | Server-only | Notes |
|----------|----------|-------------|-------|
| `EMAIL_PROVIDER` | Yes | Yes | Set to `resend` |
| `RESEND_API_KEY` | Yes | Yes | Never use `NEXT_PUBLIC_` prefix |
| `EMAIL_FROM` | Yes | Yes | Verified sender, e.g. `"Your Blog <noreply@mail.your-domain.com>"` |

### Optional env vars

| Variable | Required | Server-only | Notes |
|----------|----------|-------------|-------|
| `EMAIL_REPLY_TO` | No | Yes | Applied by the Resend provider on each send |

`EMAIL_REPLY_TO` is supported at the provider level (Resend `replyTo` field). secure-auth’s `EmailProvider` interface does not pass per-message reply-to; PostForge applies `EMAIL_REPLY_TO` globally for all transactional emails when configured.

### Template-safe production example

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=replace-with-your-resend-api-key
EMAIL_FROM="Your Blog <noreply@mail.your-domain.com>"
EMAIL_REPLY_TO="you@your-domain.com"
```

### Downstream example: `tgoliveira11-tech`

Production values for the blog deployed on Vercel with DNS on Cloudflare:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=<from Resend dashboard>
EMAIL_FROM="Thiago Oliveira Tech <noreply@mail.tgoliveira11.tech>"
EMAIL_REPLY_TO="thiago@tgoliveira11.tech"
```

Resend sending domain: `mail.tgoliveira11.tech`

---

## Configure Resend + Cloudflare + Vercel

### 1. Merge upstream PostForge changes

In your downstream blog repo:

```bash
git fetch postforge-upstream
git merge postforge-upstream/main
npm install
```

### 2. Add and verify the sending domain in Resend

1. Open [Resend](https://resend.com) → **Domains** → **Add domain**.
2. Enter your subdomain, e.g. `mail.your-domain.com`.
3. Copy the DNS records Resend provides (SPF, DKIM, optional DMARC).

### 3. Add DNS records in Cloudflare

1. Open Cloudflare → your zone → **DNS**.
2. Add each record exactly as Resend specifies.
3. Wait until Resend marks the domain **Verified**.

### 4. Set Vercel production env vars

Project → **Settings** → **Environment Variables** (Production):

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=<resend-api-key>
EMAIL_FROM="Your Blog <noreply@mail.your-domain.com>"
EMAIL_REPLY_TO="you@your-domain.com"
```

Redeploy after saving env vars.

### 5. Manual production test

1. Register a new account or trigger email verification.
2. Confirm the verification email arrives.
3. Trigger password reset at `/forgot-password`.
4. Confirm the reset email arrives.
5. If delivery fails, check Vercel function logs and Resend → **Emails** / **Logs**.

---

## Security notes

- `RESEND_API_KEY` must remain server-side only.
- Do not expose secrets with `NEXT_PUBLIC_`.
- The Resend client is initialized only in `src/lib/email/resend-email-provider.ts` (server-only module).
- Provider errors are surfaced without adding secrets to log messages.

---

## Architecture

```
secure-auth (templates + triggers)
        │
        ▼
EmailProvider.send({ to, subject, html, text? })
        │
        ├── console → devEmailProvider (console.info)
        └── resend  → Resend API (RESEND_API_KEY)
```

Composition root: `src/lib/auth/secure-auth.ts`

---

## Related docs

- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [deployment-vercel-neon.md](deployment-vercel-neon.md)
