-- 天命阁数据库schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  openid TEXT UNIQUE,
  nickname TEXT,
  avatar TEXT,
  level INTEGER DEFAULT 1,
  free_count INTEGER DEFAULT 3,
  invite_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fortune_records (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL,
  input_json TEXT,
  result_json TEXT,
  status TEXT DEFAULT 'done',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS yinyuan_records (
  id TEXT PRIMARY KEY,
  user_a_id TEXT,
  user_b_id TEXT,
  user_a_data TEXT,
  user_b_data TEXT,
  result_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_a_id) REFERENCES users(id),
  FOREIGN KEY (user_b_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invite_records (
  id TEXT PRIMARY KEY,
  inviter_id TEXT,
  invitee_openid TEXT,
  reward_sent INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inviter_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT PRIMARY KEY,
  new_users INTEGER DEFAULT 0,
  total_queries INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_fortune_user ON fortune_records(user_id);
CREATE INDEX IF NOT EXISTS idx_fortune_type ON fortune_records(type);
CREATE INDEX IF NOT EXISTS idx_yinyuan_a ON yinyuan_records(user_a_id);
CREATE INDEX IF NOT EXISTS idx_invitee ON invite_records(invitee_openid);
