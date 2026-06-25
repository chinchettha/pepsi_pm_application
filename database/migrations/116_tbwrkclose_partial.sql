-- 116 — Partial technician close (draft) — multiple rounds per wkctr
-- รัน: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/116_tbwrkclose_partial.sql

ALTER TABLE app.tbwrkclose
  ADD COLUMN IF NOT EXISTS close_kind varchar(16) NOT NULL DEFAULT 'complete'
    CHECK (close_kind IN ('complete', 'partial')),
  ADD COLUMN IF NOT EXISTS incomplete_reason text NULL;

DROP INDEX IF EXISTS app.idx_tbwrkclose_idiw37_wkctr;

CREATE INDEX IF NOT EXISTS idx_tbwrkclose_idiw37_wkctr_kind
  ON app.tbwrkclose (idiw37, wkctr, close_kind);

CREATE INDEX IF NOT EXISTS idx_tbwrkclose_idiw37_created
  ON app.tbwrkclose (idiw37, wktimeclose DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tbwrkclose_idiw37_wkctr_complete
  ON app.tbwrkclose (idiw37, wkctr)
  WHERE close_kind = 'complete';

DROP VIEW IF EXISTS app.view_personelclose;

CREATE VIEW app.view_personelclose AS
SELECT
  w.idwrkclose,
  w.idiw37,
  w.cstdate,
  w.cendate,
  w.wkctr,
  w.wktimeclose,
  w.wktimewk,
  w.wkunit,
  w.close_kind,
  w.incomplete_reason,
  wc.titlewkctr,
  wc.namewkctr,
  wc.surnamewkctr,
  wc.titlewkctreng,
  wc.namewkctreng,
  wc.surnamewkctreng
FROM app.tbwrkclose w
LEFT JOIN app.tbworkcenter wc ON wc.wkctr = w.wkctr;

COMMENT ON COLUMN app.tbwrkclose.close_kind IS 'complete = finished work; partial = in progress (WO stays open)';
COMMENT ON COLUMN app.tbwrkclose.incomplete_reason IS 'Required when close_kind = partial';
