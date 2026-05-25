import sqlite3

from dotenv import load_dotenv

import os


# =========================
# ENV
# =========================

load_dotenv(
    dotenv_path="../.env"
)

DB_FILE = os.getenv(
    "DB_FILE",
    "database.db"
)


# =========================
# CONNECTION
# =========================

conn = sqlite3.connect(
    DB_FILE
)

cursor = conn.cursor()


# =========================
# WAL MODE
# =========================

conn.execute(
    "PRAGMA journal_mode=WAL;"
)


# =========================
# INIT SQL
# =========================

def init_db():

    with open(

        "sql/init.sql",

        "r",

        encoding="utf-8"

    ) as f:

        sql_script = f.read()

    cursor.executescript(
        sql_script
    )

    conn.commit()