CREATE TABLE IF NOT EXISTS app.tbwkctrgroup (
  idwkctrgroup      serial PRIMARY KEY,
  wkctrgroup        varchar(64) NOT NULL,
  wkctrdescription  text
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tbwkctrgroup_code
ON app.tbwkctrgroup (wkctrgroup);

INSERT INTO app.tbwkctrgroup (wkctrgroup, wkctrdescription)
VALUES ('GRP01', 'Group 01')
ON CONFLICT (wkctrgroup) DO NOTHING;
