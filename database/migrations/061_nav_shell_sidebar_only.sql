-- 061 — ล็อกรูปแบบเมนูเป็น sidebar เท่านั้น (ไม่ใช้ navbar / hamburger)
-- รัน: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/061_nav_shell_sidebar_only.sql

INSERT INTO app.tbl_setting (setting_key, setting_value, setting_group, updated_at)
VALUES ('nav.shell_mode', 'sidebar', 'system', NOW())
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = 'sidebar',
    setting_group = 'system',
    updated_at = NOW();
