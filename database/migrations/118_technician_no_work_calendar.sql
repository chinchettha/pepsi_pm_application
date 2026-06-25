-- 118 — Technician (W) ไม่เข้า /calendar (Work Scheduling) — ใช้ /plan-calendar แทน
-- รัน: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/118_technician_no_work_calendar.sql

BEGIN;

UPDATE app.tbl_role_permission
SET granted = false
WHERE role_code = 'W' AND perm_code = 'calendar.read';

UPDATE app.tbmenu
SET menuright = 'A:U'
WHERE react_route = '/calendar'
   OR menulink ILIKE '%module=calendar%';

COMMIT;
