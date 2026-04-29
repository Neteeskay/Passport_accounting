USER_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""

USER_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);",
    "CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);",
]

AUTH_TOKEN_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_id TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    revoked_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

AUTH_TOKEN_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);",
]

CITIZEN_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS citizens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    birth_date TEXT NOT NULL,
    passport_series TEXT NOT NULL,
    passport_number TEXT NOT NULL,
    issue_date TEXT,
    issued_by TEXT,
    registration_address TEXT NOT NULL,
    notes TEXT,
    photo_path TEXT,
    created_by_user_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(passport_series, passport_number)
);
"""

CITIZEN_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_citizens_full_name ON citizens(last_name, first_name, middle_name);",
    "CREATE INDEX IF NOT EXISTS idx_citizens_birth_date ON citizens(birth_date);",
    "CREATE INDEX IF NOT EXISTS idx_citizens_passport ON citizens(passport_series, passport_number);",
]

STAMP_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS stamps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citizen_id INTEGER NOT NULL,
    stamp_type TEXT NOT NULL,
    stamp_placed_at TEXT NOT NULL,
    stamp_authority TEXT NOT NULL,
    stamp_note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE
);
"""

STAMP_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_stamps_citizen_id ON stamps(citizen_id);",
    "CREATE INDEX IF NOT EXISTS idx_stamps_placed_at ON stamps(stamp_placed_at);",
]

ALL_SCHEMA_STATEMENTS = [
    USER_TABLE_SQL,
    *USER_INDEXES_SQL,
    AUTH_TOKEN_TABLE_SQL,
    *AUTH_TOKEN_INDEXES_SQL,
    CITIZEN_TABLE_SQL,
    *CITIZEN_INDEXES_SQL,
    STAMP_TABLE_SQL,
    *STAMP_INDEXES_SQL,
]
