-- 120 — PM Chart Design (PMChartDesign.xlsx) — manual sheets + menu
-- รัน: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/120_pm_chart_design.sql

CREATE TABLE IF NOT EXISTS app.tbpm_chart_design (
  id           bigserial PRIMARY KEY,
  sheet_key    varchar(32) NOT NULL CHECK (sheet_key IN ('vibration', 'current', 'combustion')),
  scope_key    varchar(128) NOT NULL DEFAULT 'default',
  idiw37       integer REFERENCES app.tbiw37n (idiw37) ON DELETE SET NULL,
  wkorder      varchar(64) NOT NULL DEFAULT '',
  payload      jsonb NOT NULL DEFAULT '{}',
  wkctr        varchar(64) NOT NULL DEFAULT '',
  updated_by   varchar(64) NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_tbpm_chart_design_scope UNIQUE (sheet_key, scope_key)
);

CREATE INDEX IF NOT EXISTS idx_tbpm_chart_design_wkorder ON app.tbpm_chart_design (wkorder);
CREATE INDEX IF NOT EXISTS idx_tbpm_chart_design_idiw37 ON app.tbpm_chart_design (idiw37);

COMMENT ON TABLE app.tbpm_chart_design IS 'PMChartDesign.xlsx manual entry — vibration / current / combustion JSON payload';

INSERT INTO app.tbmenu (
  idmenusub,
  menuon,
  menu_kind,
  menuright,
  menuicon,
  menutitle,
  menulink,
  react_route,
  menuname,
  menulavel,
  end_exact
)
SELECT
  '0',
  27,
  'item',
  'A:U:W',
  'fa-chart-line',
  'PM Chart Entry',
  '',
  '/pm-charts',
  'pm-charts',
  1,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM app.tbmenu WHERE react_route = '/pm-charts'
);

UPDATE app.tbmenu
SET
  menutitle = 'PM Chart Entry',
  menuright = 'A:U:W',
  menuon = 27
WHERE react_route = '/pm-charts';
