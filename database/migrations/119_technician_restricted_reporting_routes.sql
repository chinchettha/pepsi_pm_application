-- 119 — ช่าง (W) ไม่เห็นรายงาน / planning board / user-log จน admin grant
-- แยก plan-calendar.read จาก planning.read (ช่างใช้ /plan-calendar ไม่ใช่ /planning)
-- รัน: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/119_technician_restricted_reporting_routes.sql

BEGIN;

INSERT INTO app.tbl_permission (perm_code, perm_group, perm_name, description) VALUES
  ('plan-calendar.read', 'planning', 'ดู Plan Calendar', 'ปฏิทินจ่ายงาน / รับงานช่าง')
ON CONFLICT (perm_code) DO UPDATE SET
  perm_group = EXCLUDED.perm_group,
  perm_name = EXCLUDED.perm_name,
  description = EXCLUDED.description;

INSERT INTO app.tbl_role_permission (role_code, perm_code, granted)
SELECT r.role_code, 'plan-calendar.read', true
FROM (VALUES ('A'), ('U'), ('W')) AS r(role_code)
ON CONFLICT (role_code, perm_code) DO UPDATE SET granted = EXCLUDED.granted;

UPDATE app.tbl_role_permission
SET granted = false
WHERE role_code = 'W'
  AND perm_code IN ('planning.read', 'reports.read', 'user-log.read');

UPDATE app.tbmenu
SET menuright = 'A:U'
WHERE react_route IN (
  '/reports/audit',
  '/activity-log',
  '/summary-weekly',
  '/planning',
  '/user-log'
);

COMMIT;
