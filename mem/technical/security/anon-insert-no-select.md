---
name: Anonymous inserts cannot read rows back
description: Public forms must not chain .select() after .insert(); mint the id client-side instead
type: constraint
---
Public/anonymous tables (e.g. `wce_leads`) grant INSERT to `anon` but SELECT only to authorised staff. Chaining `.select()` or `.single()` after an anonymous `.insert()` therefore fails and silently loses the submission.

**How to apply:** when a public form needs the new row's id (to trigger a follow-up edge function), generate it with `crypto.randomUUID()` and pass it in the insert payload. Never widen the SELECT policy to `anon` to work around this.
