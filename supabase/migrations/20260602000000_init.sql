-- Create tables
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  icon TEXT DEFAULT '',
  sort_order INT DEFAULT 0
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  images TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT ''
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT DEFAULT '',
  default_name TEXT DEFAULT '',
  default_phone TEXT DEFAULT '',
  default_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  customer_address TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'priced')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  spec TEXT NOT NULL DEFAULT '',
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2)
);

-- RLS: enable on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read for catalog
CREATE POLICY "public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read" ON products FOR SELECT USING (true);
CREATE POLICY "public_read" ON variants FOR SELECT USING (true);

-- Customers: own orders
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Customers: items via owned orders
CREATE POLICY "items_select_own" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()));
CREATE POLICY "items_insert_own" ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()));

-- Customers: own profile
CREATE POLICY "profiles_own" ON profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed data with generated UUIDs
DO $$
DECLARE
  cat1 UUID := gen_random_uuid();
  cat2 UUID := gen_random_uuid();
  cat3 UUID := gen_random_uuid();
  cat4 UUID := gen_random_uuid();
  cat5 UUID := gen_random_uuid();
  p1 UUID := gen_random_uuid();
  p2 UUID := gen_random_uuid();
  p3 UUID := gen_random_uuid();
  p4 UUID := gen_random_uuid();
  p5 UUID := gen_random_uuid();
  p6 UUID := gen_random_uuid();
  p7 UUID := gen_random_uuid();
  p8 UUID := gen_random_uuid();
BEGIN
  INSERT INTO categories (id, name_zh, name_en, name_ru, icon, sort_order) VALUES
    (cat1, '车架/车斗', 'Frame/Body', 'Рама/Кузов', '', 1),
    (cat2, '车轮/轮胎', 'Wheels/Tires', 'Колеса/Шины', '', 2),
    (cat3, '刹车系统', 'Brake System', 'Тормозная система', '', 3),
    (cat4, '传动系统', 'Drivetrain', 'Трансмиссия', '', 4),
    (cat5, '电气系统', 'Electrical', 'Электрика', '', 5);

  INSERT INTO products (id, name_zh, name_en, name_ru, category_id, active) VALUES
    (p1, '前叉总成', 'Front Fork Assembly', 'Вилка в сборе', cat1, true),
    (p2, '后轮毂总成', 'Rear Hub Assembly', 'Задняя ступица', cat2, true),
    (p3, '刹车蹄总成', 'Brake Shoe Assembly', 'Тормозные колодки', cat3, true),
    (p4, '差速器总成', 'Differential Assembly', 'Дифференциал', cat4, true),
    (p5, 'LED大灯总成', 'LED Headlight', 'Светодиодная фара', cat5, true),
    (p6, '车架主梁', 'Main Frame Beam', 'Главная балка рамы', cat1, true),
    (p7, '轮胎内胎', 'Inner Tube', 'Камера', cat2, true),
    (p8, '离合器片', 'Clutch Plate', 'Диск сцепления', cat4, true);

  INSERT INTO variants (product_id, model, size, weight) VALUES
    (p1, '标准型', '32mm', '2.4kg'),
    (p1, '加粗型', '36mm', '2.8kg'),
    (p1, '轻量型', '28mm', '1.9kg'),
    (p2, '标准型', '16寸', '3.1kg'),
    (p2, '重型', '18寸', '4.0kg'),
    (p3, '标准型', '130mm', '0.8kg'),
    (p3, '高性能', '150mm', '1.0kg'),
    (p4, '18齿', '标准', '4.2kg'),
    (p4, '20齿', '标准', '4.5kg'),
    (p4, '16齿', '小型', '3.6kg'),
    (p5, '12V', '7寸', '0.6kg'),
    (p5, '24V', '9寸', '0.9kg'),
    (p6, '加厚型', '2.5m', '15.0kg'),
    (p6, '标准型', '2.5m', '12.0kg'),
    (p7, '标准型', '3.00-12', '0.5kg'),
    (p7, '标准型', '3.50-12', '0.6kg'),
    (p7, '标准型', '4.00-12', '0.7kg'),
    (p8, '标准型', '150mm', '1.2kg'),
    (p8, '加强型', '160mm', '1.5kg');
END $$;
