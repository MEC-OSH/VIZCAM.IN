# VIZCAM website security

## Implemented (October 2026)
- Strict Content Security Policy on the homepage, permitting only first-party JavaScript and explicitly approved image/font hosts.
- Admin: external JavaScript only, no inline JavaScript or script execution from third-party hosts.
- Quotations: self-hosted html2pdf.js **v0.14.0** (patched XSS issue affecting versions below 0.14.0), with original third-party library license preserved.
- Safe DOM output: customer-provided quotation fields displayed with `textContent` or `value`, not unsanitized `innerHTML`.
- Link security: external links using `rel="noopener noreferrer"`.
- Quotes remain in browser localStorage by user preference; no Supabase data connection.

## IMPORTANT security limitation
**The PIN screen on a public GitHub Pages website is only a visual/convenience lock.**
The code and PIN verifier can be inspected and bypassed. No confidential quotation or customer data can be made access-controlled on a static, public website using client JavaScript alone.
LocalStorage is readable by any script that executes in the same origin and by anyone with device/browser access. Never consider it secure or a synced backup. Do not use admin.html for private customer records without real server-side access control.

## Account and domain checklist (manual settings)
1. Enable and enforce HTTPS in GitHub Pages repository settings.
2. Enable 2FA or a passkey on all GitHub accounts with write access. Restrict repository collaborators.
3. Protect the `main` branch (require review and checks for changes); audit GitHub access tokens and Actions.
4. Verify ownership of the custom domain within GitHub and keep registrar 2FA and DNS protection active.
5. Add a WAF/rate-limiting layer and actual HTTP security headers (`Content-Security-Policy` with `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and HSTS) through an edge proxy if stronger protections are needed. GitHub Pages does not accept a repository `_headers` file as configuration for HTTP response headers; the current meta CSP cannot control `frame-ancestors`.
6. Keep offline exports of browser quotation data. Clear old information from shared devices.

## Future
For genuinely private administrator access across devices, use a server-side authentication system and protected data storage. Avoid embedding privileged keys or credentials in client code.
