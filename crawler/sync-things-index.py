import argparse
import os
import sqlite3
from urllib.parse import urlparse

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


if load_dotenv:
    load_dotenv(dotenv_path="../.env")


BASE_URL = os.getenv(
    "BASE_URL",
    "https://romhandbook.com",
)

DB_FILE = "../backend-api/storage/rom.db"


TABLE_CONFIGS = [
    {
    "table": "artifacts",
    "type": "artifact",
},
    {
        "table": "cards",
        "type": "card",
    },
    {
        "table": "equipments",
        "type": "equipment",
    },
    {
        "table": "headwears",
        "type": "headwear",
    },
    {
        "table": "mounts",
        "type": "mount",
    },
    {
        "table": "pet_eggs",
        "type": "pet_egg",
    },
    {
        "table": "crafting_materials",
        "type": "crafting_material",
    },
    {
        "table": "furnitures",
        "type": "furniture",
    },
    {
        "table": "cooking_ingredients",
        "type": "cooking_ingredient",
    },
    {
        "table": "pet_headwear_unlock_items",
        "type": "pet_headwear_unlock_item",
    },
    {
    "table": "ancient_equips",
    "type": "ancient_equip",
},

]


def normalize_url(value):
    if not value:
        return value

    value = str(value).strip()

    if value.startswith(BASE_URL):
        return value[len(BASE_URL):]

    if value.startswith("http://") or value.startswith("https://"):
        parsed = urlparse(value)

        return parsed.path

    return value


def table_exists(conn, table_name):
    row = conn.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        AND name = ?
        LIMIT 1
        """,
        (table_name,),
    ).fetchone()

    return row is not None


def get_columns(conn, table_name):
    rows = conn.execute(
        f"""
        PRAGMA table_info({table_name})
        """
    ).fetchall()

    return {
        row[1]
        for row in rows
    }


def ensure_things_table(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS things (
            id TEXT PRIMARY KEY,
            type TEXT,
            name TEXT,
            image TEXT,
            detail_url TEXT
        )
        """
    )

    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_things_type
        ON things(type)
        """
    )

    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_things_name
        ON things(name)
        """
    )


def build_select_sql(table_name, columns):
    required = [
        "id",
        "name",
        "image",
        "detail_url",
    ]

    missing = [
        column
        for column in required
        if column not in columns
    ]

    if missing:
        return None, missing

    return f"""
        SELECT
            id,
            name,
            image,
            detail_url
        FROM {table_name}
        WHERE id IS NOT NULL
        AND id != ''
    """, []


def get_existing_thing(conn, item_id):
    row = conn.execute(
        """
        SELECT
            id,
            type,
            name,
            image,
            detail_url
        FROM things
        WHERE id = ?
        LIMIT 1
        """,
        (item_id,),
    ).fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "type": row[1],
        "name": row[2],
        "image": row[3],
        "detail_url": row[4],
    }


def upsert_thing(conn, item, dry_run, replace_conflicts):
    existing = get_existing_thing(
        conn,
        item["id"],
    )

    if existing and existing["type"] != item["type"]:
        message = (
            f"[CONFLICT] id={item['id']} "
            f"things.type={existing['type']} "
            f"source.type={item['type']} "
            f"name={item['name']}"
        )

        if not replace_conflicts:
            print(message + " -> SKIP")
            return "conflict"

        print(message + " -> REPLACE")

    if dry_run:
        if not existing:
            print(
                f"[DRY INSERT] {item['type']} {item['id']} {item['name']}"
            )
            return "insert"

        changed = (
            existing["type"] != item["type"]
            or existing["name"] != item["name"]
            or existing["image"] != item["image"]
            or existing["detail_url"] != item["detail_url"]
        )

        if changed:
            print(
                f"[DRY UPDATE] {item['type']} {item['id']} {item['name']}"
            )
            return "update"

        return "same"

    conn.execute(
        """
        INSERT INTO things (
            id,
            type,
            name,
            image,
            detail_url
        )
        VALUES (?, ?, ?, ?, ?)

        ON CONFLICT(id) DO UPDATE SET
            type = excluded.type,
            name = excluded.name,
            image = excluded.image,
            detail_url = excluded.detail_url
        """,
        (
            item["id"],
            item["type"],
            item["name"],
            item["image"],
            item["detail_url"],
        ),
    )

    if not existing:
        return "insert"

    return "update"


def sync_table(conn, config, dry_run, replace_conflicts, only_things_path):
    table_name = config["table"]
    item_type = config["type"]

    if not table_exists(conn, table_name):
        print(f"[SKIP TABLE] {table_name} not found")
        return {
            "table": table_name,
            "insert": 0,
            "update": 0,
            "same": 0,
            "skip": 0,
            "conflict": 0,
        }

    columns = get_columns(
        conn,
        table_name,
    )

    sql, missing = build_select_sql(
        table_name,
        columns,
    )

    if missing:
        print(
            f"[SKIP TABLE] {table_name} missing columns: {', '.join(missing)}"
        )

        return {
            "table": table_name,
            "insert": 0,
            "update": 0,
            "same": 0,
            "skip": 0,
            "conflict": 0,
        }

    stats = {
        "table": table_name,
        "insert": 0,
        "update": 0,
        "same": 0,
        "skip": 0,
        "conflict": 0,
    }

    rows = conn.execute(sql).fetchall()

    print(
        f"\n[TABLE] {table_name} -> things.type={item_type} rows={len(rows)}"
    )

    for row in rows:
        item_id = str(row[0]).strip()
        name = row[1]
        image = normalize_url(row[2])
        detail_url = normalize_url(row[3])

        if not detail_url:
            stats["skip"] += 1
            continue

        if only_things_path and not detail_url.startswith("/things/"):
            stats["skip"] += 1
            continue

        item = {
            "id": item_id,
            "type": item_type,
            "name": name,
            "image": image,
            "detail_url": detail_url,
        }

        result = upsert_thing(
            conn,
            item,
            dry_run,
            replace_conflicts,
        )

        stats[result] += 1

    return stats


def print_missing_report(conn):
    print("\n[MISSING REPORT]")

    for config in TABLE_CONFIGS:
        table_name = config["table"]
        item_type = config["type"]

        if not table_exists(conn, table_name):
            continue

        columns = get_columns(
            conn,
            table_name,
        )

        if not all(
            column in columns
            for column in ["id", "detail_url"]
        ):
            continue

        count = conn.execute(
            f"""
            SELECT COUNT(*)
            FROM {table_name} source
            LEFT JOIN things t
                ON t.id = source.id
            WHERE source.id IS NOT NULL
            AND source.id != ''
            AND t.id IS NULL
            """
        ).fetchone()[0]

        print(
            f"{table_name:<32} type={item_type:<28} missing={count}"
        )


def main():
    parser = argparse.ArgumentParser(
        description="Sync main archive tables into things index table."
    )

    parser.add_argument(
        "--db",
        default=DB_FILE,
        help="SQLite database file path.",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing to database.",
    )

    parser.add_argument(
        "--replace-conflicts",
        action="store_true",
        help="Replace things rows when the same id already exists with another type.",
    )

    parser.add_argument(
        "--only-things-path",
        action="store_true",
        help="Only sync rows whose detail_url starts with /things/.",
    )

    args = parser.parse_args()

    db_path = args.db

    if not os.path.exists(db_path):
        raise FileNotFoundError(
            f"Database not found: {db_path}"
        )

    conn = sqlite3.connect(db_path)

    try:
        ensure_things_table(conn)

        print_missing_report(conn)

        all_stats = []

        for config in TABLE_CONFIGS:
            stats = sync_table(
                conn,
                config,
                dry_run=args.dry_run,
                replace_conflicts=args.replace_conflicts,
                only_things_path=args.only_things_path,
            )

            all_stats.append(stats)

        if args.dry_run:
            conn.rollback()
        else:
            conn.commit()

        print("\n[SUMMARY]")

        for stats in all_stats:
            print(
                f"{stats['table']:<32} "
                f"insert={stats['insert']:<5} "
                f"update={stats['update']:<5} "
                f"same={stats['same']:<5} "
                f"skip={stats['skip']:<5} "
                f"conflict={stats['conflict']:<5}"
            )

        print("\n[DONE]")

        if args.dry_run:
            print("Dry-run only. No data was changed.")

    finally:
        conn.close()


if __name__ == "__main__":
    main()