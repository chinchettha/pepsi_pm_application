# Spec — IW37N Single-Row Edit (M_iw37n_form.php parity)

Date: 2026-05-18  
Scope: IW37N module — edit a single row in `app.tbiw37n` with UI parity to legacy `sap/pages/M_iw37n_form.php`

## Goal

- Provide a way to edit a single IW37N record (1 row) like legacy `M_iw37n_form.php`.
- UI should support editing all fields (21 fields), including `wkorder` + `opac`.
- Prevent data corruption by validating input and preventing duplicate key collisions.
- Keep downstream modules consistent (`view_order` used by calendar/backlog/work-orders).

## Non-Goals

- Rebuild legacy PHP layout pixel-perfect.
- Implement advanced IW37N CRUD features outside the single-record edit flow (batch edit, bulk delete).
- Add new DB tables for IW37N item CRUD (reuse `app.tbiw37n`).

## Current State (Relevant)

- Existing endpoints: `POST /api/v1/iw37n/import`, `GET /api/v1/iw37n/batches`, `GET /api/v1/iw37n/batches/:id/rows`, export CSV.
- `app.tbiw37n` exists (migration `004_tbiw37n_calendar.sql`) and is referenced by `app.view_order`.
- `/iw37n` page currently focuses on import history + import row results.

## Proposed UX

Add a new section inside the existing `/iw37n` page:

1) **IW37N Items List**
- Show table (default latest N rows) similar to legacy list: `wkorder`, `mntplan`, `wktype`, `bscstart` + actions.
- Support simple search `q` (match `wkorder`, `mntplan`, `opac`).
- Row action: **Edit** opens a dialog.

2) **Edit Dialog (Single record)**
- Two-column form with all fields (parity to PHP form):
  - `mntplan`, `wkorder`, `wktype`, `mat`
  - `bscstart` (date), `actfinish` (date)
  - `systemstatus`, `opac`
  - `operationshorttext`, `ostdescription`
  - `cknow`, `wkctr`, `work`, `actwork`, `untime`
  - `equipment`, `equdescrip`, `functionalloc`, `funcdescrip`
- Save updates the record; Cancel closes dialog.

## API Design

### 1) List items
`GET /api/v1/iw37n/items?limit=&offset=&q=`

- Auth required (same pattern as other endpoints).
- Response:
  - `items: [{ idiw37, wkorder, opac, mntplan, wktype, mat, bscstart, actfinish, systemstatus, syst, operationshorttext, ostdescription, cknow, wkctr, work, actwork, untime, equipment, equdescrip, functionalloc, funcdescrip, team }]`
  - Use `limit` default (e.g., 100); allow pagination via `offset`.

### 2) Get single item
`GET /api/v1/iw37n/items/:id`

- Returns `item` for dialog prefill.

### 3) Update single item
`PUT /api/v1/iw37n/items/:id`

- Request body contains all editable fields. Dates are accepted as `DD.MM.YYYY` or epoch seconds (consistent with existing utilities) but the API canonicalizes to epoch seconds for DB.
- **Duplicate key constraint check**: If `wkorder + opac` combination already exists on a different record, return `409` with message.
- **syst derivation**: Derive `syst` from `systemstatus` on save using the legacy rule:
  - split by whitespace; if first token is `REL` or `CRTD` → `syst = token0`
  - else `syst = token0 + ' ' + token1` (when token1 exists)

## Data Validation Rules

- Required: `wkorder`, `opac` (same key as import).
- `bscstart`, `actfinish`:
  - Stored as epoch seconds (integer) or null/0 if blank.
  - UI uses `DD.MM.YYYY` display.
- Numeric: `work`, `actwork`, `untime` accept numbers; blank allowed.

## Query Invalidation / Consistency

After successful update:
- Invalidate FE queries: `work-orders`, `calendar`, `backlog` (and any IW37N list query).
- This keeps `view_order`-based screens consistent.

## Error Handling

- `400` validation: show message in dialog.
- `409` duplicate key: show message “wkorder+opac ซ้ำกับ record อื่น”.
- `404` not found: show message and close dialog.

## Testing / Verification

- Build passes for both backend and frontend.
- Manual checks:
  - Edit a record → value changes reflect in list.
  - Attempt to change wkorder+opac to existing pair → 409.
  - Change systemstatus → syst recalculates and is visible in downstream list (if shown).

