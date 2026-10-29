# LightsNGo email templates

Paste into **Supabase → Authentication → Emails → Templates** (Message body = the HTML file, Subject = below).

- **Confirm Signup** → `confirm_signup.html` — Subject: `Confirm your LightsNGo account`
- **Reset Password** → `reset_password.html` — Subject: `Reset your LightsNGo password`
- **Magic Link** → `magic_link.html` — Subject: `Your LightsNGo login link`
- **Change Email** → `change_email.html` — Subject: `Confirm your new email for LightsNGo`

Emails land in spam until Supabase sends through your own domain: set up custom SMTP (Resend or Brevo) with `no-reply@lightsngo.com`, sender name `LightsNGo`, and add the SPF / DKIM / DMARC DNS records they give you.
