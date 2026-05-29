import argparse
import json
import os
import re
import sqlite3

from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(dotenv_path="../.env")

DB_FILE = os.getenv(
    "DB_FILE",
    "database.db",
)

DB_PATH = str(
    Path(DB_FILE).resolve()
)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

cursor = conn.cursor()

aliases = defaultdict(set)

formula_json_owners = defaultdict(set)



def table_exists(table_name):
    row = cursor.execute(
        """
        SELECT 1
        FROM sqlite_master
        WHERE type = 'table'
        AND name = ?
        LIMIT 1
        """,
        (
            table_name,
        ),
    ).fetchone()

    return row is not None


def column_exists(table_name, column_name):
    if not table_exists(table_name):
        return False

    columns = cursor.execute(
        f"PRAGMA table_info({table_name})"
    ).fetchall()

    return any(
        column["name"] == column_name
        for column in columns
    )


def init_graph_tables(clear=True):
    cursor.executescript(
        """
        CREATE TABLE IF NOT EXISTS formula_graph_nodes (
            node_key TEXT PRIMARY KEY,
            node_type TEXT NOT NULL,
            ref_id TEXT NOT NULL,
            label TEXT,
            detail_url TEXT,
            image TEXT,
            meta_json TEXT
        );

        CREATE TABLE IF NOT EXISTS formula_graph_edges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_node_key TEXT NOT NULL,
            to_node_key TEXT NOT NULL,
            edge_type TEXT NOT NULL,
            evidence TEXT,
            source_table TEXT,
            source_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(from_node_key, to_node_key, edge_type, evidence)
        );

        CREATE INDEX IF NOT EXISTS idx_formula_graph_edges_from
        ON formula_graph_edges(from_node_key);

        CREATE INDEX IF NOT EXISTS idx_formula_graph_edges_to
        ON formula_graph_edges(to_node_key);

        CREATE INDEX IF NOT EXISTS idx_formula_graph_nodes_type_ref
        ON formula_graph_nodes(node_type, ref_id);
        """
    )

    if clear:
        cursor.execute("DELETE FROM formula_graph_edges")
        cursor.execute("DELETE FROM formula_graph_nodes")

    conn.commit()


def node_key(node_type, ref_id):
    return f"{node_type}:{ref_id}"


def node_exists(key):
    row = cursor.execute(
        """
        SELECT 1
        FROM formula_graph_nodes
        WHERE node_key = ?
        LIMIT 1
        """,
        (
            key,
        ),
    ).fetchone()

    return row is not None


def encode_meta(meta):
    if meta is None:
        return None

    try:
        return json.dumps(
            meta,
            ensure_ascii=False,
        )
    except Exception:
        return str(meta)


def add_node(
    node_type,
    ref_id,
    label=None,
    detail_url=None,
    image=None,
    meta=None,
):
    if ref_id is None:
        return None

    ref_id = str(ref_id).strip()

    if not ref_id:
        return None

    key = node_key(
        node_type,
        ref_id,
    )

    cursor.execute(
        """
        INSERT OR IGNORE INTO formula_graph_nodes (
            node_key,
            node_type,
            ref_id,
            label,
            detail_url,
            image,
            meta_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            key,
            node_type,
            ref_id,
            label,
            detail_url,
            image,
            encode_meta(meta),
        ),
    )

    aliases[ref_id].add(key)

    return key


def add_edge(
    from_key,
    to_key,
    edge_type,
    evidence=None,
    source_table=None,
    source_id=None,
):
    if not from_key or not to_key:
        return

    if from_key == to_key:
        return

    cursor.execute(
        """
        INSERT OR IGNORE INTO formula_graph_edges (
            from_node_key,
            to_node_key,
            edge_type,
            evidence,
            source_table,
            source_id
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            from_key,
            to_key,
            edge_type,
            evidence,
            source_table,
            source_id,
        ),
    )


def parse_json_loose(value):
    if not value:
        return None

    current = value

    for _ in range(3):
        if not isinstance(current, str):
            return current

        try:
            current = json.loads(current)
        except Exception:
            return current

    return current


def extract_formula_id(formula_json):
    parsed = parse_json_loose(formula_json)

    if not isinstance(parsed, dict):
        return None, parsed

    formula_id = (
        parsed.get("id")
        or parsed.get("ID")
    )

    return formula_id, parsed


def collect_ids_from_json(value, path=""):
    found = []

    if isinstance(value, dict):
        for key, child in value.items():
            next_path = (
                f"{path}.{key}"
                if path
                else key
            )

            found.extend(
                collect_ids_from_json(
                    child,
                    next_path,
                )
            )

    elif isinstance(value, list):
        for child in value:
            found.extend(
                collect_ids_from_json(
                    child,
                    path,
                )
            )

    elif isinstance(value, int):
        lower_path = path.lower()

        interesting = (
            lower_path == "id"
            or "buff" in lower_path
            or "buffid" in lower_path
            or "skillid" in lower_path
            or "skill" in lower_path
            or "itemid" in lower_path
            or "monsterid" in lower_path
            or "monster" in lower_path
            or "composeid" in lower_path
            or "compose" in lower_path
            or "body" in lower_path
            or "rewardid" in lower_path
        )

        if interesting:
            found.append(
                (
                    str(value),
                    path,
                )
            )

    elif isinstance(value, str):
        lower_path = path.lower()

        interesting = (
            "buff" in lower_path
            or "skill" in lower_path
            or "item" in lower_path
            or "monster" in lower_path
            or "compose" in lower_path
        )

        if interesting:
            for match in re.findall(r"(?<!\d)(\d{4,})(?!\d)", value):
                found.append(
                    (
                        match,
                        path,
                    )
                )

    return found


def edge_type_for_json_path(path):
    lower_path = path.lower()

    if "buff" in lower_path:
        return "JSON_REFERENCES_BUFF"

    if "skill" in lower_path:
        return "JSON_REFERENCES_SKILL"

    if "monster" in lower_path:
        return "JSON_REFERENCES_MONSTER"

    if "item" in lower_path or "compose" in lower_path:
        return "JSON_REFERENCES_ITEM"

    return "JSON_REFERENCES_ID"


def add_entity_nodes():
    entity_tables = [
        ("card", "cards"),
        ("equipment", "equipments"),
        ("headwear", "headwears"),
        ("skill", "skills"),
        ("buff", "buffs"),
        ("monster", "monsters"),
        ("mount", "mounts"),
        ("pet", "pets"),
        ("pet_egg", "pet_eggs"),
        ("crafting_material", "crafting_materials"),
        ("furniture", "furnitures"),
        ("cooking_ingredient", "cooking_ingredients"),
        ("pet_headwear_unlock_item", "pet_headwear_unlock_items"),
    ]

    for node_type, table_name in entity_tables:
        if not table_exists(table_name):
            continue

        rows = cursor.execute(
            f"""
            SELECT
                id,
                name,
                detail_url,
                image
            FROM {table_name}
            WHERE id IS NOT NULL
            """
        ).fetchall()

        for row in rows:
            add_node(
                node_type,
                row["id"],
                row["name"],
                row["detail_url"],
                row["image"],
            )


def add_formula_code_nodes():
    if not table_exists("formulas_code"):
        return

    rows = cursor.execute(
        """
        SELECT
            id,
            name,
            detail_url
        FROM formulas_code
        WHERE id IS NOT NULL
        """
    ).fetchall()

    for row in rows:
        add_node(
            "formula_code",
            row["id"],
            row["name"],
            row["detail_url"],
            None,
        )


def add_buff_raw_json_aliases():
    if not table_exists("buffs"):
        return

    if not column_exists("buffs", "raw_json"):
        return

    rows = cursor.execute(
        """
        SELECT
            id,
            name,
            detail_url,
            image,
            raw_json
        FROM buffs
        WHERE raw_json IS NOT NULL
        AND TRIM(raw_json) != ''
        """
    ).fetchall()

    for row in rows:
        buff_key = node_key(
            "buff",
            row["id"],
        )

        parsed = parse_json_loose(
            row["raw_json"],
        )

        if not isinstance(parsed, dict):
            continue

        numeric_id = parsed.get("id")

        if numeric_id is None:
            continue

        numeric_id = str(numeric_id)

        aliases[numeric_id].add(buff_key)

        buff_json_key = add_node(
            "buff_json",
            numeric_id,
            row["name"],
            row["detail_url"],
            row["image"],
            parsed,
        )

        add_edge(
            buff_key,
            buff_json_key,
            "HAS_RAW_JSON",
            numeric_id,
            "buffs",
            row["id"],
        )


def add_formula_id_edges():
    sources = [
        ("equipment", "equipments", "formula_id"),
        ("headwear", "headwears", "formula_id"),
        ("pet_headwear_unlock_item", "pet_headwear_unlock_items", "formula_id"),
    ]

    for entity_type, table_name, column_name in sources:
        if not column_exists(table_name, column_name):
            continue

        rows = cursor.execute(
            f"""
            SELECT
                id,
                name,
                {column_name} AS formula_id
            FROM {table_name}
            WHERE {column_name} IS NOT NULL
            AND TRIM({column_name}) != ''
            """
        ).fetchall()

        for row in rows:
            entity_key = node_key(
                entity_type,
                row["id"],
            )

            formula_id_key = add_node(
                "formula_id",
                row["formula_id"],
                f"Formula ID {row['formula_id']}",
            )

            add_edge(
                entity_key,
                formula_id_key,
                "HAS_FORMULA_ID",
                row["formula_id"],
                table_name,
                row["id"],
            )

            formula_code_key = node_key(
                "formula_code",
                row["formula_id"],
            )

            if node_exists(formula_code_key):
                add_edge(
                    formula_id_key,
                    formula_code_key,
                    "RESOLVES_TO_FORMULA_CODE",
                    row["formula_id"],
                    table_name,
                    row["id"],
                )


def add_formula_json_edges():
    sources = [
        ("card", "card_formulas", "card_id"),
        ("equipment", "equipment_formulas", "equipment_id"),
        ("headwear", "headwear_formulas", "headwear_id"),
        ("mount", "mount_formulas", "mount_id"),
        ("crafting_material", "crafting_material_formulas", "material_id"),
        ("furniture", "furniture_formulas", "furniture_id"),
        ("cooking_ingredient", "cooking_ingredient_formulas", "ingredient_id"),
    ]

    for entity_type, formula_table, owner_column in sources:
        if not table_exists(formula_table):
            continue

        if not column_exists(formula_table, "formula_json"):
            continue

        rows = cursor.execute(
            f"""
            SELECT
                {owner_column} AS owner_id,
                formula_index,
                formula_json
            FROM {formula_table}
            WHERE formula_json IS NOT NULL
            AND TRIM(formula_json) != ''
            """
        ).fetchall()

        for row in rows:
            entity_key = node_key(
                entity_type,
                row["owner_id"],
            )

            formula_id, parsed = extract_formula_id(
                row["formula_json"],
            )

            if formula_id is None:
                formula_id = (
                    f"{entity_type}:"
                    f"{row['owner_id']}:"
                    f"{row['formula_index']}"
                )

            formula_id = str(formula_id)

            formula_key = add_node(
                "formula_json",
                formula_id,
                f"Formula JSON {formula_id}",
                None,
                None,
                parsed,
            )

            add_edge(
                entity_key,
                formula_key,
                "HAS_FORMULA_JSON",
                formula_id,
                formula_table,
                row["owner_id"],
            )

            formula_json_owners[formula_id].add(entity_key)

            if not isinstance(parsed, dict):
                continue

            refs = collect_ids_from_json(parsed)

            for ref_id, ref_path in refs:
                if ref_id == formula_id and ref_path.lower() == "id":
                    continue

                targets = aliases.get(ref_id)

                if not targets:
                    target_key = add_node(
                        "external_id",
                        ref_id,
                        f"ID {ref_id}",
                    )

                    targets = {
                        target_key,
                    }

                for target_key in targets:
                    add_edge(
                        formula_key,
                        target_key,
                        edge_type_for_json_path(ref_path),
                        f"{ref_path}={ref_id}",
                        formula_table,
                        row["owner_id"],
                    )


def extract_formula_function_names(value):
    if not value:
        return set()

    return set(
        re.findall(
            r"function\s+([A-Za-z0-9_]+\.[A-Za-z0-9_]+)\s*\(",
            value,
        )
    )


def add_skill_formula_edges():
    if not table_exists("skills"):
        return

    if not table_exists("formulas_code"):
        return

    formula_rows = cursor.execute(
        """
        SELECT
            id,
            name
        FROM formulas_code
        WHERE name IS NOT NULL
        AND TRIM(name) != ''
        """
    ).fetchall()

    formula_by_name = {}

    for row in formula_rows:
        formula_by_name[row["name"]] = row["id"]

    rows = cursor.execute(
        """
        SELECT
            id,
            name,
            formula_raw
        FROM skills
        WHERE formula_raw IS NOT NULL
        AND TRIM(formula_raw) != ''
        """
    ).fetchall()

    inserted = 0
    unmatched = 0

    for row in rows:
        skill_key = node_key(
            "skill",
            row["id"],
        )

        function_names = extract_formula_function_names(
                row["formula_raw"],
            )

        if not function_names:
            unmatched += 1
            continue

        matched = False

        for function_name in sorted(function_names):
            formula_id = formula_by_name.get(function_name)

            if not formula_id:
                continue

            formula_key = node_key(
                "formula_code",
                formula_id,
            )

            if not node_exists(formula_key):
                continue

            add_edge(
                skill_key,
                formula_key,
                "USES_FORMULA_CODE",
                function_name,
                "skills",
                row["id"],
            )

            inserted += 1
            matched = True

        if not matched:
            unmatched += 1

    print(
        "[SKILL FORMULA EDGES]",
        "inserted=",
        inserted,
        "unmatched=",
        unmatched,
    )

def add_formula_code_edges():
    if not table_exists("formulas_code"):
        return

    rows = cursor.execute(
        """
        SELECT
            id,
            name,
            detail_url,
            formula_code
        FROM formulas_code
        WHERE formula_code IS NOT NULL
        AND TRIM(formula_code) != ''
        """
    ).fetchall()

    for row in rows:
        formula_key = node_key(
            "formula_code",
            row["id"],
        )

        code = row["formula_code"] or ""

        buff_ids = set(
            re.findall(
                r"HasBuffID\((\d+)",
                code,
            )
        )

        for buff_id in sorted(buff_ids):
            targets = aliases.get(buff_id)

            if not targets:
                target_key = add_node(
                    "external_id",
                    buff_id,
                    f"ID {buff_id}",
                )

                targets = {
                    target_key,
                }

            for target_key in targets:
                add_edge(
                    formula_key,
                    target_key,
                    "CODE_CHECKS_BUFF",
                    f"HasBuffID({buff_id})",
                    "formulas_code",
                    row["id"],
                )

        mentioned_ids = set(
            re.findall(
                r"(?<!\d)(\d{4,})(?!\d)",
                code,
            )
        )

        for ref_id in sorted(mentioned_ids):
            targets = aliases.get(ref_id)

            if not targets:
                continue

            for target_key in targets:
                add_edge(
                    formula_key,
                    target_key,
                    "CODE_MENTIONS_ID",
                    ref_id,
                    "formulas_code",
                    row["id"],
                )
            
            owner_keys = formula_json_owners.get(ref_id)

            if owner_keys:
                for owner_key in owner_keys:
                    owner_type = owner_key.split(":", 1)[0]

                    add_edge(
                        formula_key,
                        owner_key,
                        f"CODE_REFERENCES_{owner_type.upper()}_FORMULA",
                        ref_id,
                        "formulas_code",
                        row["id"],
                    )


def print_summary():
    node_total = cursor.execute(
        "SELECT COUNT(*) FROM formula_graph_nodes"
    ).fetchone()[0]

    edge_total = cursor.execute(
        "SELECT COUNT(*) FROM formula_graph_edges"
    ).fetchone()[0]

    print("[DONE] nodes:", node_total)
    print("[DONE] edges:", edge_total)

    rows = cursor.execute(
        """
        SELECT
            edge_type,
            COUNT(*) AS total
        FROM formula_graph_edges
        GROUP BY edge_type
        ORDER BY total DESC
        """
    ).fetchall()

    print("\n[EDGE TYPES]")

    for row in rows:
        print(
            row["edge_type"],
            row["total"],
        )


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--keep",
        action="store_true",
        help="Do not clear existing graph tables before rebuilding.",
    )

    args = parser.parse_args()

    print("[INFO] DB:", DB_PATH)

    init_graph_tables(
        clear=not args.keep,
    )

    add_entity_nodes()
    add_formula_code_nodes()
    add_buff_raw_json_aliases()
    add_formula_id_edges()
    add_formula_json_edges()

    add_skill_formula_edges()

    add_formula_code_edges()

    conn.commit()

    print_summary()


if __name__ == "__main__":
    main()
    conn.close()