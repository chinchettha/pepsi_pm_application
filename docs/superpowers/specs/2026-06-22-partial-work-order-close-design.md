# Partial work-order close (draft) — design spec

**Date:** 2026-06-22  
**Status:** Draft — awaiting customer / team approval  
**Scope (this doc):** Items 1–2 only — partial close without finishing WO; reason text. More requirements expected later.

---

## Problem

Technicians sometimes cannot finish PM work in one visit (e.g. waiting for spare parts). They still need to record time and close-out evidence, but the **work order must stay open** — not a real SAP-style close / TECO.

Customer asks:

1. Allow “close” action that is **not** a final close — a **draft / partial** state meaning “work started but not finished”.
2. Technician must enter a **reason** why work is not complete.

---

## Decisions from stakeholder Q&A (2026-06-22)

| Topic | Decision |
|--------|----------|
| Same technician returns later | **Multiple entries** — each visit is a separate row (round 1, round 2, …). |
| Preconditions before save | **Same as full close today** — work comment + at least one after-PM photo still required (`assertWorkOrderCloseReady`). |
| Progress % | **Reason text only** — no mandatory % field. |

---

## Current system (baseline)

| Piece | Today |
|--------|--------|
| Technician time | `app.tbwrkclose` — one row per `(idiw37, wkctr)` **unique** |
| Save API | `POST /api/v1/confirmation/:idiw37/personnel-close` |
| Guard | Comment + after image before save |
| After save | `touchConfirmQcPending` → `tbiw37n.confirm_qc_status = pending` |
| WO SAP status | Unchanged until QC **approved** → `syst = TECO` |
| UI | `PersonnelClosePanel` on plan-calendar WO modal (Close WO tab) |

Partial close must **not** behave like today’s full path for QC / TECO.

---

## Recommended approach (A): extend `tbwrkclose`

**Why:** One place for technician time; matches legacy `AddClosePersonel.php` model; supports multiple rounds by dropping the unique constraint.

### Database (new migration)

```sql
-- Example: 109_tbwrkclose_partial.sql

ALTER TABLE app.tbwrkclose
  ADD COLUMN IF NOT EXISTS close_kind varchar(16) NOT NULL DEFAULT 'complete'
    CHECK (close_kind IN ('complete', 'partial')),
  ADD COLUMN IF NOT EXISTS incomplete_reason text NULL;

DROP INDEX IF EXISTS app.idx_tbwrkclose_idiw37_wkctr;

CREATE INDEX IF NOT EXISTS idx_tbwrkclose_idiw37_wkctr_kind
  ON app.tbwrkclose (idiw37, wkctr, close_kind);

CREATE INDEX IF NOT EXISTS idx_tbwrkclose_idiw37_created
  ON app.tbwrkclose (idiw37, wktimeclose DESC);

-- View app.view_personelclose: recreate to expose close_kind, incomplete_reason
```

**Rules:**

- `close_kind = 'partial'` → `incomplete_reason` required (trimmed, min length e.g. 3).
- `close_kind = 'complete'` → `incomplete_reason` must be NULL.
- Existing rows backfill as `complete`.

**Not in scope:** mandatory `percent_done` column (may add later if customer asks).

### Backend behaviour

| Action | `complete` (today) | `partial` (new) |
|--------|-------------------|-----------------|
| `assertWorkOrderCloseReady` | Yes | Yes |
| Insert `tbwrkclose` | Yes | Yes |
| `touchConfirmQcPending` | Yes | **No** |
| Block if WO already TECO | Yes | Yes |
| Unique per wkctr | Was yes | **No** — many partial rows allowed |
| Supervisor `tbcofirm` / export | Unchanged — only after full confirm flow | **Not triggered** by partial |

**API** — extend body:

```ts
{
  wkctr, startD, startT, endD, endT,
  closeKind: 'complete' | 'partial',  // default 'complete'
  incompleteReason?: string           // required when partial
}
```

**List response** — include `closeKind`, `incompleteReason` per row.

**Delete** — keep existing delete by `idwrkclose` (technician can remove wrong partial row).

### WO / calendar status (item 1)

- `tbiw37n.syst` **unchanged** on partial save (stays CRTD/REL).
- UI badge on plan-calendar / WO modal when WO has ≥1 partial row and no approved QC:
  - EN: `Partial work recorded`
  - TH: `บันทึกทำบางส่วนแล้ว`
- Optional query helper: `hasPartialClose(idiw37)` for filters later.

Do **not** set `confirm_qc_status = pending` for partial — avoids Admin QC queue treating unfinished work as ready for SAP export.

### Frontend (Close WO tab — `PersonnelClosePanel`)

1. **Close type** (required before save):
   - `Complete` — work finished (current behaviour).
   - `Partial` — work not finished yet.
2. When **Partial** selected → show **Reason** textarea (required, EN/TH i18n).
3. **Save** button label depends on type (`Save time` vs `Save partial close`).
4. **Table** — new column **Status**:
   - `Complete` / `Partial` badge
   - Show reason (truncated) for partial rows.
5. After partial save — toast success; WO tab stays open; user can add another round later.

RBAC: same as today (`assignedCloseCanWrite` on plan-calendar).

### i18n keys (sketch)

`confirmation.personnel.closeKind.complete`, `.partial`, `.incompleteReason`, `.incompleteReasonPlaceholder`, `.statusPartial`, `.statusComplete`, `.savePartial`.

### Tests

- Backend: insert partial without reason → 400; partial does not set `confirm_qc_status`; two partial rows same wkctr OK; complete still sets pending.
- Frontend: vitest for form validation (reason required when partial).

### Out of scope (waiting for “ต่ออีก”)

- Planner approval of partial entries
- Auto-notify planner on partial
- Calendar colour for partial WO
- Personnel Confirm % bar counting partial
- Telegram partial close
- Percent complete field

---

## Alternatives considered

| Approach | Pros | Cons |
|----------|------|------|
| **A — extend `tbwrkclose`** ✅ | Simple; one API; multiple rounds | Must update views + drop unique index |
| B — new `tbwrkclose_partial` table | No change to complete semantics | Duplicate services/UI |
| C — WO-level flag only | Easy badge | Poor fit for multiple rounds per technician |

---

## Open questions for next session

1. Can technician delete their own partial rows only, or also complete rows?
2. Should planner see a list of partial reasons on Planning tab?
3. When a later **complete** close is saved, auto-close / link previous partial rows?

---

## Approval

- [ ] Customer / PM approves this design
- [ ] Then: `writing-plans` → `docs/superpowers/plans/2026-06-22-partial-work-order-close.md`
