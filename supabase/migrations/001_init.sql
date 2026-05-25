-- ============================================================
-- Tricycle Parts Sales System — Complete Database Setup
-- ============================================================

-- 1. TABLES
CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY,
  name       JSONB NOT NULL DEFAULT '{"zh":"","en":"","ru":""}',
  icon       TEXT NOT NULL DEFAULT '📦',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        JSONB NOT NULL DEFAULT '{"zh":"","en":"","ru":""}',
  description JSONB NOT NULL DEFAULT '{"zh":"","en":"","ru":""}',
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  images      TEXT[] NOT NULL DEFAULT '{}',
  variants    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id            TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL DEFAULT '',
  items         JSONB NOT NULL DEFAULT '[]',
  total_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  exported_as   TEXT,
  status        VARCHAR DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company (
  id      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name    JSONB NOT NULL DEFAULT '{"zh":"","en":"","ru":""}',
  phone   TEXT NOT NULL DEFAULT '',
  wechat_qr TEXT NOT NULL DEFAULT '',
  address JSONB NOT NULL DEFAULT '{"zh":"","en":"","ru":""}'
);

INSERT INTO company (id, name, phone, wechat_qr, address)
VALUES (1, '{"zh":"三轮车配件公司","en":"Tricycle Parts Co.","ru":"ООО Трицикл"}', '+86 138-0000-0000', '', '{"zh":"","en":"","ru":""}')
ON CONFLICT (id) DO NOTHING;

-- 2. ROW LEVEL SECURITY
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices   ENABLE ROW LEVEL SECURITY;
ALTER TABLE company    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_auth_insert" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "categories_auth_update" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "categories_auth_delete" ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_auth_insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "products_auth_update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "products_auth_delete" ON products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "invoices_auth_read" ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "invoices_auth_insert" ON invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "invoices_auth_update" ON invoices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "invoices_auth_delete" ON invoices FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "company_public_read" ON company FOR SELECT USING (true);
CREATE POLICY "company_auth_insert" ON company FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "company_auth_update" ON company FOR UPDATE USING (auth.role() = 'authenticated');
