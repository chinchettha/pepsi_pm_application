-- 114 — เอา "(includes Admin)" ออกจากชื่อ role Planner ใน DB
-- รัน: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/114_planner_role_label.sql

BEGIN;

UPDATE app.tbl_role
SET
  role_name = 'Planner / Engineering',
  role_name_en = 'Planner',
  description = 'Planning, engineering, and full system administration.',
  updated_at = now()
WHERE role_code = 'U';

COMMIT;
