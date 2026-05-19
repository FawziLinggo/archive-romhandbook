import Database from "better-sqlite3";

export const db = new Database(
    "./database/archive.db",
    {
        readonly: true,
    }
);