CREATE TABLE IF NOT EXISTS formulas (id TEXT PRIMARY KEY, raw_json TEXT);
CREATE TABLE IF NOT EXISTS equipments (
    id,
    detail_url,
    image,
    name,
    type,
    description,
    quality,
    effect_text,
    unlock_text,
    deposit_stats,
    unlock_stats,
    jobs,
    formula_id,
    raw_html
);
CREATE TABLE IF NOT EXISTS equipment_formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id TEXT NOT NULL,
    formula_id TEXT,
    formula_index INTEGER NOT NULL,
    formula_json TEXT,
    UNIQUE(equipment_id, formula_index)
);
CREATE TABLE IF NOT EXISTS equipment_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    related_id TEXT,
    related_name TEXT,
    related_image TEXT,
    related_url TEXT,
    relation_index INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS equipment_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id TEXT NOT NULL,
    tier_index INTEGER NOT NULL,
    tier_text TEXT NOT NULL,
    UNIQUE(equipment_id, tier_index)
);
CREATE TABLE IF NOT EXISTS equipment_equip_effect_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equip_effect_id INTEGER NOT NULL,
    item_id TEXT,
    item_name TEXT,
    item_image TEXT,
    item_url TEXT,
    item_index INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS equipment_equip_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id TEXT NOT NULL,
    effect_index INTEGER NOT NULL,
    effect_text TEXT,
    UNIQUE(equipment_id, effect_index)
);
CREATE INDEX IF NOT EXISTS idx_equipment_relations_equipment_id ON equipment_relations(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_relations_type ON equipment_relations(relation_type);
CREATE INDEX IF NOT EXISTS idx_equipment_tiers_equipment_id ON equipment_tiers(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_formulas_equipment_id ON equipment_formulas(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_equip_effects_equipment_id ON equipment_equip_effects(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_equip_effect_items_effect_id ON equipment_equip_effect_items(equip_effect_id);
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
    availability_date TEXT,
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
    egg_id TEXT,
    egg_url TEXT,
    skills TEXT,
    formula_ids TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS pet_eggs (
    id TEXT PRIMARY KEY,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    description TEXT,
    effect_text TEXT,
    unlock_text TEXT,
    jobs_raw TEXT,
    pet_url TEXT,
    formulas_raw TEXT,
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
UPDATE skills
SET detail_url = REPLACE(detail_url, '/skills/', '')
WHERE detail_url LIKE '/skills/%';
UPDATE pets
SET skills = REPLACE(
        skills,
        'https://romhandbook.com/skills/',
        '/skills/'
    )
WHERE skills LIKE '%https://romhandbook.com/skills/%';
CREATE INDEX IF NOT EXISTS idx_pets_name ON pets(name);
UPDATE pets
SET detail_url = REPLACE(
        detail_url,
        '/pets/',
        ''
    )
WHERE detail_url LIKE '/pets/%';
UPDATE buffs
SET detail_url = REPLACE(
        detail_url,
        'https://romhandbook.com',
        ''
    );
UPDATE buffs
SET image = '/assets/skills/skill_current-ab5b7d2a91b320dffc765f060de413e0474bed69b44393a9a9699fc39a0620fe.png';
UPDATE monsters
SET detail_url = REPLACE(detail_url, 'https://romhandbook.com', '')
WHERE detail_url LIKE 'https://romhandbook.com/%';
UPDATE monsters
SET image = REPLACE(image, 'https://romhandbook.com', '')
WHERE image LIKE 'https://romhandbook.com/%';
CREATE TABLE IF NOT EXISTS headwear_formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    headwear_id TEXT,
    formula_index INTEGER,
    formula_json TEXT
);
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    detail_url TEXT,
    image TEXT,
    name TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS job_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    related_job_id TEXT,
    related_slug TEXT,
    related_name TEXT,
    relation_type TEXT NOT NULL,
    relation_index INTEGER DEFAULT 0,
    UNIQUE(job_id, relation_type, related_slug)
);
CREATE TABLE IF NOT EXISTS job_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    skill_slug TEXT,
    skill_name TEXT,
    skill_image TEXT,
    skill_url TEXT,
    section TEXT,
    max_level TEXT,
    tags_raw TEXT,
    description TEXT,
    aesir_raw TEXT,
    raw_html TEXT,
    skill_index INTEGER DEFAULT 0,
    UNIQUE(job_id, skill_slug, section)
);
CREATE TABLE IF NOT EXISTS job_runes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    rune_slug TEXT,
    rune_name TEXT,
    rune_image TEXT,
    rune_url TEXT,
    tags_raw TEXT,
    effects_raw TEXT,
    raw_html TEXT,
    rune_index INTEGER DEFAULT 0,
    UNIQUE(job_id, rune_slug)
);
CREATE INDEX IF NOT EXISTS idx_jobs_name ON jobs(name);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_job_relations_job_id ON job_relations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_relations_type ON job_relations(relation_type);
CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_runes_job_id ON job_runes(job_id);
-- =========================
-- DETAIL LOOKUP INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_cards_detail_url ON cards(detail_url);
CREATE INDEX IF NOT EXISTS idx_monsters_detail_url ON monsters(detail_url);
CREATE INDEX IF NOT EXISTS idx_skills_detail_url ON skills(detail_url);
CREATE INDEX IF NOT EXISTS idx_pets_detail_url ON pets(detail_url);
CREATE INDEX IF NOT EXISTS idx_buffs_detail_url ON buffs(detail_url);
CREATE INDEX IF NOT EXISTS idx_mounts_detail_url ON mounts(detail_url);
CREATE INDEX IF NOT EXISTS idx_headwears_detail_url ON headwears(detail_url);
CREATE INDEX IF NOT EXISTS idx_equipments_detail_url ON equipments(detail_url);
CREATE INDEX IF NOT EXISTS idx_formulas_code_detail_url ON formulas_code(detail_url);
-- =========================
-- LOWER NAME / SORT INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_cards_lower_name ON cards(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_monsters_lower_name ON monsters(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_skills_lower_name ON skills(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_pets_lower_name ON pets(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_buffs_lower_name ON buffs(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_mounts_lower_name ON mounts(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_headwears_lower_name ON headwears(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_equipments_lower_name ON equipments(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_formulas_code_lower_name ON formulas_code(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_jobs_lower_name ON jobs(LOWER(name));
-- =========================
-- FILTER INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_monsters_size ON monsters(size);
CREATE INDEX IF NOT EXISTS idx_monsters_element ON monsters(element);
CREATE INDEX IF NOT EXISTS idx_monsters_race ON monsters(race);
CREATE INDEX IF NOT EXISTS idx_monsters_filter_sort ON monsters(size, element, race, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_equipments_type_quality_name ON equipments(type, quality, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_headwears_type_name ON headwears(type, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_cards_type_quality_name ON cards(card_type, quality, LOWER(name));
-- =========================
-- RELATION / CHILD TABLE INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_skill_levels_skill_id_level ON skill_levels(skill_id, level DESC);
CREATE INDEX IF NOT EXISTS idx_mount_formulas_mount_id ON mount_formulas(mount_id);
CREATE INDEX IF NOT EXISTS idx_headwear_formulas_headwear_id ON headwear_formulas(headwear_id);
CREATE INDEX IF NOT EXISTS idx_card_formulas_card_id ON card_formulas(card_id);
CREATE INDEX IF NOT EXISTS idx_card_craftable_card_id ON card_craftable(card_id);
CREATE INDEX IF NOT EXISTS idx_card_dropped_by_card_id ON card_dropped_by(card_id);
CREATE INDEX IF NOT EXISTS idx_card_skills_card_id ON card_skills(card_id);
CREATE INDEX IF NOT EXISTS idx_card_craft_materials_card_id ON card_craft_materials(card_id);
CREATE INDEX IF NOT EXISTS idx_card_account_bonuses_card_id_type ON card_account_bonuses(card_id, bonus_type);
CREATE INDEX IF NOT EXISTS idx_pets_egg_id ON pets(egg_id);
CREATE INDEX IF NOT EXISTS idx_pet_eggs_id_detail_url ON pet_eggs(id, detail_url);
CREATE INDEX IF NOT EXISTS idx_crafting_material_formulas_material_id ON crafting_material_formulas(material_id);
CREATE INDEX IF NOT EXISTS idx_crafting_material_craftables_material_id ON crafting_material_craftables(material_id);
CREATE INDEX IF NOT EXISTS idx_crafting_material_dropped_by_material_id ON crafting_material_dropped_by(material_id);
-- =========================
-- JOB INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_job_relations_job_type_order ON job_relations(job_id, relation_type, relation_index);
CREATE INDEX IF NOT EXISTS idx_job_skills_job_order ON job_skills(job_id, skill_index);
CREATE INDEX IF NOT EXISTS idx_job_runes_job_order ON job_runes(job_id, rune_index);
CREATE VIRTUAL TABLE IF NOT EXISTS archive_search_fts USING fts5(
    type UNINDEXED,
    label,
    href UNINDEXED,
    image UNINDEXED,
    description,
    tokenize = 'unicode61 remove_diacritics 2'
);
CREATE TABLE IF NOT EXISTS furnitures (
    id TEXT PRIMARY KEY,
    detail_url TEXT UNIQUE,
    image TEXT,
    name TEXT,
    furniture_type TEXT,
    furniture_subtype TEXT,
    is_blueprint INTEGER DEFAULT 0,
    description TEXT,
    quality TEXT,
    effect_text TEXT,
    unlock_text TEXT,
    deposit_stats TEXT,
    raw_tags TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS furniture_formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    furniture_id TEXT NOT NULL,
    formula_index INTEGER NOT NULL,
    formula_json TEXT,
    UNIQUE(furniture_id, formula_index)
);
CREATE TABLE IF NOT EXISTS furniture_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    furniture_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    related_id TEXT,
    related_name TEXT,
    related_image TEXT,
    related_url TEXT,
    quantity TEXT,
    relation_index INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS crawl_resolved_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT,
    source_table TEXT,
    source_id TEXT,
    resolved_table TEXT,
    resolved_id TEXT,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS crawl_failures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT,
    source_table TEXT,
    source_id TEXT,
    status_code INTEGER,
    error TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_furnitures_detail_url ON furnitures(detail_url);
CREATE INDEX IF NOT EXISTS idx_furnitures_lower_name ON furnitures(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_furnitures_type ON furnitures(furniture_type);
CREATE INDEX IF NOT EXISTS idx_furnitures_subtype ON furnitures(furniture_subtype);
CREATE INDEX IF NOT EXISTS idx_furniture_formulas_furniture_id ON furniture_formulas(furniture_id);
CREATE INDEX IF NOT EXISTS idx_furniture_relations_furniture_id ON furniture_relations(furniture_id);
CREATE INDEX IF NOT EXISTS idx_furniture_relations_type ON furniture_relations(relation_type);
CREATE TABLE IF NOT EXISTS cooking_ingredients (
    id TEXT PRIMARY KEY,
    detail_url TEXT UNIQUE,
    image TEXT,
    name TEXT,
    ingredient_type TEXT,
    description TEXT,
    quality TEXT,
    raw_tags TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS cooking_ingredient_formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id TEXT NOT NULL,
    formula_index INTEGER NOT NULL,
    formula_json TEXT,
    UNIQUE(ingredient_id, formula_index)
);
CREATE TABLE IF NOT EXISTS cooking_ingredient_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    related_id TEXT,
    related_name TEXT,
    related_image TEXT,
    related_url TEXT,
    relation_index INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_cooking_ingredients_detail_url ON cooking_ingredients(detail_url);
CREATE INDEX IF NOT EXISTS idx_cooking_ingredients_lower_name ON cooking_ingredients(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_cooking_ingredients_type ON cooking_ingredients(ingredient_type);
CREATE INDEX IF NOT EXISTS idx_cooking_ingredient_formulas_ingredient_id ON cooking_ingredient_formulas(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_cooking_ingredient_relations_ingredient_id ON cooking_ingredient_relations(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_cooking_ingredient_relations_type ON cooking_ingredient_relations(relation_type);
CREATE TABLE IF NOT EXISTS pet_headwear_unlock_items (
    id TEXT PRIMARY KEY,
    detail_url TEXT UNIQUE,
    image TEXT,
    name TEXT,
    item_type TEXT,
    pet_headwear_name TEXT,
    pet_name TEXT,
    description TEXT,
    quality TEXT,
    formula_id TEXT,
    compose_id TEXT,
    unlock_item_id TEXT,
    unlock_effect_type TEXT,
    unlock_body_ids TEXT,
    raw_tags TEXT,
    raw_formula TEXT,
    raw_html TEXT
);
CREATE TABLE IF NOT EXISTS pet_headwear_unlock_item_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    related_id TEXT,
    related_name TEXT,
    related_image TEXT,
    related_url TEXT,
    quantity TEXT,
    relation_index INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_pet_headwear_unlock_items_detail_url ON pet_headwear_unlock_items(detail_url);
CREATE INDEX IF NOT EXISTS idx_pet_headwear_unlock_items_lower_name ON pet_headwear_unlock_items(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_pet_headwear_unlock_items_pet_name ON pet_headwear_unlock_items(pet_name);
CREATE INDEX IF NOT EXISTS idx_pet_headwear_unlock_items_quality ON pet_headwear_unlock_items(quality);
CREATE INDEX IF NOT EXISTS idx_pet_headwear_unlock_item_relations_item_id ON pet_headwear_unlock_item_relations(item_id);
CREATE INDEX IF NOT EXISTS idx_pet_headwear_unlock_item_relations_type ON pet_headwear_unlock_item_relations(relation_type);
CREATE TABLE IF NOT EXISTS crafting_material_craft_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id TEXT,
    item_name TEXT,
    item_image TEXT,
    item_url TEXT,
    quantity TEXT,
    relation_index INTEGER,
    FOREIGN KEY(material_id) REFERENCES crafting_materials(id)
);
CREATE INDEX IF NOT EXISTS idx_crafting_material_craft_materials_material_id ON crafting_material_craft_materials(material_id);