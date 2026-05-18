CREATE TABLE IF NOT EXISTS formulas (id TEXT PRIMARY KEY, raw_json TEXT);
CREATE TABLE IF NOT EXISTS equipments (
    id TEXT PRIMARY KEY,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    type TEXT,
    description TEXT,
    effect_text TEXT,
    unlock_text TEXT,
    deposit_stats TEXT,
    unlock_stats TEXT,
    jobs TEXT,
    formula_id TEXT,
    raw_html TEXT
);