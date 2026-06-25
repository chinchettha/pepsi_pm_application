-- 117 — Technician request to reschedule plan (planner executes move)
-- รัน: npx tsx scripts/apply-sql-migration.ts database/migrations/117_tbplan_move_request.sql

CREATE TABLE IF NOT EXISTS app.tbplan_move_request (
  id_request       serial PRIMARY KEY,
  idiw37           integer NOT NULL REFERENCES app.tbiw37n (idiw37) ON DELETE CASCADE,
  requester_wkctr  varchar(64) NOT NULL,
  comment          text NOT NULL,
  preferred_date   date,
  status           varchar(16) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  fulfilled_at     timestamptz,
  fulfilled_by_wkctr varchar(64)
);

CREATE INDEX IF NOT EXISTS idx_plan_move_request_idiw37_status
  ON app.tbplan_move_request (idiw37, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_move_request_pending_per_tech
  ON app.tbplan_move_request (idiw37, requester_wkctr)
  WHERE status = 'pending';

COMMENT ON TABLE app.tbplan_move_request IS
  'ช่างขอเลื่อนแผน — Planner ย้ายวันจริงผ่าน move-plan';
