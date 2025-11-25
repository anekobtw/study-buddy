import os
import sqlite3

import bcrypt
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DB_PATH")

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()


def init_db():
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            usf_email TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            password TEXT NOT NULL,
            description TEXT,
            major TEXT NOT NULL,
            year TEXT NOT NULL,
            preferred_study_time INTEGER NOT NULL,
            classes TEXT NOT NULL
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS swipes (
            user_id TEXT NOT NULL,
            target_uid TEXT NOT NULL,
            direction TEXT NOT NULL,
            PRIMARY KEY (user_id, target_uid),
            FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
            FOREIGN KEY (target_uid) REFERENCES users(uid) ON DELETE CASCADE
        )
    """
    )

    conn.commit()


def create_user(
    *,
    usf_email: str,
    full_name: str,
    password: str,
    major: str,
    year: str,
    preferred_study_time: int,
    classes: str,
    description: str
):
    if get_user_by_email(usf_email):
        raise ValueError("User with this Email already exists")

    cursor.execute(
        """
        INSERT INTO users (full_name, usf_email, major, year, preferred_study_time, classes, description, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            full_name,
            usf_email,
            major,
            year,
            preferred_study_time,
            classes,
            description,
            password,
        ),
    )

    conn.commit()


def get_user_by_email(email):
    cursor.execute("SELECT * FROM users WHERE usf_email = ?", (email,))
    row = cursor.fetchone()
    return dict(row) if row else None


def verify_user_password(stored_password: str, provided_password: str) -> bool:
    return bcrypt.checkpw(
        provided_password.encode("utf-8"), stored_password.encode("utf-8")
    )


def delete_user(email: str) -> None:
    cursor.execute("DELETE FROM users WHERE usf_email = ?", (email,))
    conn.commit()


def get_all_users_except(email: str):
    cursor.execute("SELECT * FROM users WHERE usf_email != ?", (email,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def update_user(email: str, **fields):
    import json
    if not fields:
        return
    
    if "classes" in fields:
        fields["classes"] = json.dumps(fields["classes"])
    
    field_map = {
        "fullName": "full_name",
        "preferredStudyTime": "preferred_study_time"
    }
    
    db_fields = {field_map.get(k, k): v for k, v in fields.items()}
    set_clause = ", ".join(f"{k} = ?" for k in db_fields.keys())
    
    cursor.execute(
        f"UPDATE users SET {set_clause} WHERE usf_email = ?",
        list(db_fields.values()) + [email]
    )
    conn.commit()


def get_swiped_uids(email: str) -> set:
    cursor.execute("SELECT target_uid FROM swipes WHERE user_id = ?", (email,))
    rows = cursor.fetchall()
    return {row["target_uid"] for row in rows}


def create_swipe(user_email: str, target_email: str, direction: str):
    cursor.execute(
        "INSERT OR REPLACE INTO swipes (user_id, target_uid, direction) VALUES (?, ?, ?)",
        (user_email, target_email, direction)
    )
    conn.commit()


def check_mutual_swipe(user_email: str, target_email: str) -> bool:
    cursor.execute(
        "SELECT * FROM swipes WHERE user_id = ? AND target_uid = ? AND direction = 'right'",
        (target_email, user_email)
    )
    return cursor.fetchone() is not None
