-- 115 — IW37N list/search indexes (wkorder, mntplan, tasklist mntplan)

CREATE INDEX IF NOT EXISTS idx_tbiw37n_wkorder ON app.tbiw37n (wkorder);

CREATE INDEX IF NOT EXISTS idx_tbiw37n_mntplan_trim
  ON app.tbiw37n (TRIM(mntplan))
  WHERE mntplan IS NOT NULL AND TRIM(mntplan) <> '' AND TRIM(mntplan) <> '-';

CREATE INDEX IF NOT EXISTS idx_tbtasklist_mntplan_trim
  ON app.tbtasklist (TRIM(mntplan))
  WHERE mntplan IS NOT NULL AND TRIM(mntplan) <> '';
