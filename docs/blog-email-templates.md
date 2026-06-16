# Transactional email templates (tgoliveira11-tech)

This blog overrides Secure Auth transactional emails with repo-local branded templates.

## Customization point

`@tgoliveira/secure-auth` exposes `email.templates` on `createSecureAuth(config)` and documents:

- `verificationEmail({ appName, verifyUrl })`
- `passwordReset({ appName, resetUrl })`

In package **v0.1.10-internal**, those callbacks are typed but the runtime still builds default HTML in `ctx.verificationEmailContent` / `ctx.passwordResetEmailContent`.

This repo therefore:

1. Passes `templates: createSecureAuthEmailTemplates()` in `src/lib/auth/secure-auth.ts` (forward-compatible).
2. Patches `services.ctx` email content helpers in `src/lib/auth/patch-secure-auth-email-templates.ts` (effective today).

## Flows covered today

| Flow | Template | Wired |
|------|----------|-------|
| Email verification (register) | `renderEmailVerificationTemplate` | Yes |
| Email verification (resend) | `renderEmailVerificationTemplate` | Yes |
| Password reset | `renderPasswordResetTemplate` | Yes |
| Password changed confirmation | — | Not sent by secure-auth v0.1.10 |
| 2FA enabled/disabled | `renderSecurityEventTemplate` | Prepared, not wired |
| Passkey added/removed | `renderSecurityEventTemplate` | Prepared, not wired |
| Account deletion | — | Not sent by secure-auth v0.1.10 |

## Brand

- Site name: **tgoliveira11 tech**
- Tagline: Software architecture · Engineering leadership · AI
- Footer links: blog (`APP_BASE_URL`), GitHub, LinkedIn

Template source lives in `src/lib/email/templates/`.

## Production env vars

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=<from Resend dashboard>
EMAIL_FROM="tgoliveira11 tech <noreply@mail.tgoliveira11.tech>"
EMAIL_REPLY_TO="thiago@tgoliveira11.tech"
APP_BASE_URL=https://tgoliveira11-tech.vercel.app
```

`APP_BASE_URL` is used to build verification/reset links in email bodies.

## Local testing (`EMAIL_PROVIDER=console`)

1. Set in `.env.local`:

   ```env
   EMAIL_PROVIDER=console
   EMAIL_FROM="tgoliveira11 tech <noreply@localhost>"
   ```

2. Run `npm run dev`.
3. Register at `/register` — terminal logs `[tgoliveira11-tech email]` with subject, preview text, and action link.
4. Open `/forgot-password` — confirm branded reset email in logs.
5. No Resend API key required locally.

## Production testing

1. Configure Resend + verified domain (`mail.tgoliveira11.tech`).
2. Set production env vars on Vercel.
3. Register a new account or resend verification.
4. Trigger password reset.
5. Confirm HTML + plain-text rendering in the received email.

## Regenerating / editing copy

Edit files under `src/lib/email/templates/` and run:

```bash
npm test -- src/lib/email/templates
npm test -- src/lib/auth/patch-secure-auth-email-templates.test.ts
```

Related: [EMAIL_PROVIDERS.md](EMAIL_PROVIDERS.md)
