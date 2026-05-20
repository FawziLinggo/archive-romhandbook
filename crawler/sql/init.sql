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
CREATE TABLE IF NOT EXISTS headwears (
    id TEXT PRIMARY KEY,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    type TEXT,
    description TEXT,
    quality TEXT,
    effect_text TEXT,
    unlock_text TEXT,
    deposit_stats TEXT,
    unlock_stats TEXT,
    jobs TEXT,
    formula_id TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS monsters (
    id TEXT PRIMARY KEY,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    race TEXT,
    element TEXT,
    size TEXT,
    location TEXT,
    level INTEGER,
    hp TEXT,
    base_exp TEXT,
    job_exp TEXT,
    str INTEGER,
    agi INTEGER,
    vit INTEGER,
    int_stat INTEGER,
    dex INTEGER,
    luk INTEGER,
    atk TEXT,
    matk TEXT,
    def TEXT,
    mdef TEXT,
    hit TEXT,
    flee TEXT,
    move_speed TEXT,
    aspd TEXT,
    raw_json TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    max_level INTEGER,
    skill_type TEXT,
    damage_type TEXT,
    cooldown TEXT,
    range_value TEXT,
    cast_time TEXT,
    fixed_cast_time TEXT,
    description TEXT,
    formula_type TEXT,
    formula_raw TEXT,
    raw_tags TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS skill_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id TEXT,
    level INTEGER,
    description TEXT,
    raw_tags TEXT,
    FOREIGN KEY(skill_id) REFERENCES skills(id)
);
CREATE TABLE IF NOT EXISTS formulas_code (
    id TEXT PRIMARY KEY,
    name TEXT,
    detail_url TEXT,
    formula_code TEXT,
    raw_html TEXT
);
CREATE INDEX IF NOT EXISTS idx_formulas_code_name ON formulas_code(name);
CREATE TABLE IF NOT EXISTS buffs (
    id TEXT PRIMARY KEY,
    name TEXT,
    detail_url TEXT,
    image TEXT,
    description TEXT,
    raw_json TEXT,
    raw_html TEXT
);
CREATE INDEX IF NOT EXISTS idx_buffs_name ON buffs(name);
drop table if exists card_formulas;
drop table if exists cards;
CREATE TABLE IF NOT EXISTS card_craftable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT,
    item_name TEXT,
    item_image TEXT,
    item_url TEXT,
    FOREIGN KEY(card_id) REFERENCES cards(id)
);
CREATE TABLE IF NOT EXISTS card_dropped_by (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT,
    monster_name TEXT,
    monster_image TEXT,
    monster_url TEXT,
    FOREIGN KEY(card_id) REFERENCES cards(id)
);
CREATE TABLE IF NOT EXISTS card_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT,
    skill_name TEXT,
    skill_image TEXT,
    skill_url TEXT,
    FOREIGN KEY(card_id) REFERENCES cards(id)
);
CREATE TABLE IF NOT EXISTS card_craft_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT,
    material_name TEXT,
    material_image TEXT,
    material_url TEXT,
    material_type TEXT,
    FOREIGN KEY(card_id) REFERENCES cards(id)
);
CREATE TABLE IF NOT EXISTS card_account_bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT,
    bonus_type TEXT,
    bonus_text TEXT,
    FOREIGN KEY(card_id) REFERENCES cards(id)
);
CREATE TABLE IF NOT EXISTS card_formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT,
    formula_index INTEGER,
    formula_json TEXT,
    FOREIGN KEY(card_id) REFERENCES cards(id)
);
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    card_type TEXT,
    quality TEXT,
    effect_text TEXT,
    raw_html TEXT
);
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(card_type);
CREATE INDEX IF NOT EXISTS idx_cards_quality ON cards(quality);
CREATE TABLE IF NOT EXISTS mounts (
    id TEXT PRIMARY KEY,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    mount_type TEXT,
    description TEXT,
    quality TEXT,
    effect_text TEXT,
    unlock_text TEXT,
    jobs TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS mount_formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mount_id TEXT,
    formula_index INTEGER,
    formula_json TEXT
);
CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    race TEXT,
    element TEXT,
    size TEXT,
    description TEXT,
    unlock_text TEXT,
    egg_name TEXT,
    egg_url TEXT,
    egg_image TEXT,
    skills TEXT,
    formula_ids TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS things (
    id TEXT PRIMARY KEY,
    type TEXT,
    name TEXT,
    image TEXT,
    detail_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_things_type ON things(type);
CREATE INDEX IF NOT EXISTS idx_things_name ON things(name);
CREATE TABLE IF NOT EXISTS crafting_material_formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id TEXT,
    formula_index INTEGER,
    formula_json TEXT,
    FOREIGN KEY(material_id) REFERENCES crafting_materials(id)
);
CREATE TABLE IF NOT EXISTS crafting_materials (
    id TEXT PRIMARY KEY,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    material_type TEXT,
    quality TEXT,
    description TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS crafting_material_craftables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id TEXT,
    item_name TEXT,
    item_image TEXT,
    item_url TEXT,
    FOREIGN KEY(material_id) REFERENCES crafting_materials(id)
);
CREATE TABLE IF NOT EXISTS crafting_material_dropped_by (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id TEXT,
    monster_name TEXT,
    monster_image TEXT,
    monster_url TEXT,
    FOREIGN KEY(material_id) REFERENCES crafting_materials(id)
);