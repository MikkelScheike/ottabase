# @ottabase/email

Edge-friendly email templating + mailer helpers for Ottabase.

## Features

- Handlebars templates (header/body/footer layout)
- Template registry + rendering helpers
- Mailer abstraction for providers
- Resend provider (fetch-based, edge-safe)
- Cloudflare provider stub (pluggable transport)

## Install

```bash
pnpm add @ottabase/email
```

## Quick Start

```ts
import { createResendMailer } from "@ottabase/email/providers/resend";
import { sendTemplatedEmail } from "@ottabase/email/mailer";

const mailer = createResendMailer({ apiKey: env.EMAIL_RESEND_API_KEY });
```

### App-level Templates

Apps can define templates under app/email/templates and register them at runtime.

Example (Vite/TanStack app):

```ts
// src/email/templates/spacious.ts
import type { EmailTemplate } from "@ottabase/email";

export const spaciousTemplate: EmailTemplate = {
  name: "spacious",
  subject: "{{subject}}",
  layout: "...",
  header: "{{header}}",
  body: "{{{body}}}",
  footer: "{{footer}}",
};

// src/email/templates/index.ts
import { registerEmailTemplate } from "@ottabase/email";
import { spaciousTemplate } from "./spacious";

export function registerAppEmailTemplates() {
  registerEmailTemplate(spaciousTemplate);
}
```

Then call `registerAppEmailTemplates()` before rendering or sending emails (for example in your Cloudflare worker or demo page).

```ts
import { createResendMailer } from "@ottabase/email/providers/resend";
import { sendTemplatedEmail } from "@ottabase/email/mailer";

const mailer = createResendMailer({ apiKey: env.EMAIL_RESEND_API_KEY });

await sendTemplatedEmail(mailer, {
  from: "Acme <hello@acme.com>",
  to: "user@example.com",
  template: "default",
  subject: "Welcome, {{name}}",
  variables: { name: "Ada" },
  content: {
    header: "Welcome to Acme",
    body: "<p>Hi {{name}}, thanks for joining!</p>",
    footer: "<p>— The Acme Team</p>",
  },
});
```

## Templates

The default template uses a simple header/body/footer layout. You can register custom templates:

```ts
import { registerEmailTemplate } from "@ottabase/email/templates";

registerEmailTemplate({
  name: "login",
  subject: "Your login link",
  body: "<p>Click <a href=\"{{url}}\">here</a> to sign in.</p>",
  footer: "<p>This link expires in {{minutes}} minutes.</p>",
});
```

## Cloudflare Provider (Stub)

Cloudflare email sending support is intentionally pluggable until a default edge-safe option is chosen. Use the stub with a custom transport:

```ts
import { createCloudflareMailer } from "@ottabase/email/providers/cloudflare";

const mailer = createCloudflareMailer({
  send: async (message) => {
    // TODO: implement Cloudflare-native send
    return { id: "queued" };
  },
});
```

## Nodemailer (SMTP)

Use SMTP in Node environments:

```ts
import { createNodemailerMailer } from "@ottabase/email/providers/nodemailer";
import { sendTemplatedEmail } from "@ottabase/email/mailer";

const mailer = createNodemailerMailer({
  server: "smtp://localhost:2525",
});

await sendTemplatedEmail(mailer, {
  from: "Local <hello@local.test>",
  to: "test@example.com",
  template: "default",
  subject: "SMTP test",
  variables: { name: "Local" },
  content: {
    header: "SMTP delivery",
    body: "<p>Sent via local SMTP.</p>",
  },
});
```
