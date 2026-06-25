-- 113 — 2 role หลัก: Planner (รวม Admin) + Technician
-- - ย้าย Admin (A) และ Manager (H) → Planner (U)
-- - ให้ Planner (U) สิทธิ์เท่า Admin เดิม
-- รัน: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/113_two_primary_roles.sql

BEGIN;

-- Planner ได้ทุก permission ที่ Admin เคยมี (+ permission ใหม่ที่ยังไม่มีใน matrix)
INSERT INTO app.tbl_role_permission (role_code, perm_code, granted)
SELECT 'U', p.perm_code, true
FROM app.tbl_permission p
ON CONFLICT (role_code, perm_code) DO UPDATE SET granted = EXCLUDED.granted;

UPDATE app.tbworkcenter
SET userst = 'U', userrole = 'planner'
WHERE upper(trim(coalesce(userst, ''))) IN ('A', 'H')
   OR lower(trim(coalesce(userrole, ''))) IN ('admin', 'manager');

ALTER TABLE app.tbworkcenter
  DROP CONSTRAINT IF EXISTS tbworkcenter_userst_check;

ALTER TABLE app.tbworkcenter
  ADD CONSTRAINT tbworkcenter_userst_check
  CHECK (userst IS NULL OR userst IN ('U', 'W'));

ALTER TABLE app.tbworkcenter
  DROP CONSTRAINT IF EXISTS tbworkcenter_userrole_check;

ALTER TABLE app.tbworkcenter
  ADD CONSTRAINT tbworkcenter_userrole_check
  CHECK (
    userrole IS NULL
    OR userrole IN ('planner', 'technician')
  );

UPDATE app.tbl_role
SET
  description = 'Deprecated — merged into Planner (U). Not shown in Admin UI.',
  updated_at = now()
WHERE role_code IN ('A', 'H');

UPDATE app.tbl_role
SET
  role_name = 'Planner / Engineering (รวม Admin)',
  role_name_en = 'Planner (includes Admin)',
  description = 'Planning, engineering, and full system administration.',
  updated_at = now()
WHERE role_code = 'U';

COMMIT;

COMMENT ON TABLE app.tbl_role IS
  'RBAC roles; go-live uses U/W (Planner+Admin / Technician). A/H deprecated.';
