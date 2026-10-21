# VIZCAM cloud quotation upgrade (staged, not live)

This branch prepares migrating the VIZCAM quotation register to Supabase. The current website and browser-only quotations remain untouched until verification.

## Next actions

1. Authorize Supabase and select/create a project.
2. Configure a verified administrator with Supabase Auth email magic-link/OTP. The previous client-side PIN must not be used alone for protecting cloud data.
3. Apply the SQL file in supabase/001_vizcam.sql, then add the verified Auth user's UUID to the administrator allowlist.
4. Wire cloud reads/writes into the existing admin.html: load quotations on sign-in; allocate quotation IDs using the database RPC on first save; update Pending / Completed / Rejected status in the database. Never silently fall back to divergent browser-only data.
5. Run end-to-end tests using two devices, including permissions for non-admin visitors and number allocation under concurrent saves.
6. Export JSON backups from every browser storing old quotations. Import with a preview and explicit handling of duplicate IDs, then switch to cloud after validation.

## Data mapping

Local quotation fields map to Supabase columns:
id → id; customer → customer; date → quote_date; total → total; status → status;
paidAt → paid_at; rejectedAt → rejected_at; data → details;
createdAt → created_at; updatedAt → updated_at.

Keep completed-value totals restricted to status='completed'.

## Security

Only use project URL and the **publishable** API key in public website JavaScript. Never publish the Supabase secret API key or database credentials. Enable and verify Row Level Security before importing real customer records.

https://supabase.com/docs/guides/database/row-level-security
https://supabase.com/docs/guides/getting-started/api-keys
