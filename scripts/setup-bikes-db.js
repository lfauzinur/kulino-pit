// Script untuk setup database bikes table + seed data awal
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function setup() {
  console.log('Creating bikes table...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS bikes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'city',
      image TEXT NOT NULL DEFAULT '/images/bikes/roadbike.png',
      image_public_id TEXT,
      frame_size JSONB DEFAULT '["M"]',
      price_per_day INTEGER DEFAULT 100000,
      price_2h INTEGER DEFAULT 0,
      price_3h INTEGER DEFAULT 0,
      price_4h INTEGER DEFAULT 0,
      price_6h INTEGER DEFAULT 0,
      popular BOOLEAN DEFAULT false,
      available BOOLEAN DEFAULT true,
      stock_count INTEGER NOT NULL DEFAULT 1,
      description_id TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      spec_weight TEXT DEFAULT '',
      spec_groupset TEXT DEFAULT '',
      spec_brake TEXT DEFAULT '',
      spec_wheel TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('Table created!');

  // Cek apakah sudah ada data
  const existing = await sql`SELECT COUNT(*) as count FROM bikes`;
  if (parseInt(existing[0].count) > 0) {
    console.log(`Already has ${existing[0].count} bikes in DB. Skipping seed.`);
    return;
  }

  console.log('Seeding initial bikes...');
  await sql`
    INSERT INTO bikes (name, category, image, frame_size, price_per_day, price_2h, price_3h, price_4h, price_6h, popular, available, description_id, description_en, spec_weight, spec_groupset, spec_brake, spec_wheel, sort_order) VALUES
    ('Polygon Helios C8', 'roadbike', '/images/bikes/roadbike.png', '["S","M","L","XL"]', 100000, 25000, 30000, 40000, 50000, true, true, 'Road bike karbon premium untuk performa optimal di jalan raya.', 'Premium carbon road bike for optimal road performance.', '7.8kg', 'Shimano Ultegra R8000', 'Disc Brake', '700c', 1),
    ('Polygon Siskiu T8', 'mtb', '/images/bikes/mtb.png', '["S","M","L"]', 100000, 25000, 30000, 40000, 50000, false, true, 'Full suspension MTB tangguh untuk medan off-road yang menantang.', 'Tough full suspension MTB for challenging off-road terrain.', '13.2kg', 'Shimano Deore XT', 'Hydraulic Disc', '29"', 2),
    ('Brompton C Line Explore', 'folding', '/images/bikes/folding.png', '["One Size"]', 100000, 25000, 30000, 40000, 50000, true, true, 'Sepeda lipat premium klasik Inggris, kompak dan stylish.', 'Classic premium British folding bike, compact and stylish.', '12.3kg', '6-speed', 'Rim Brake', '16"', 3),
    ('Specialized Turbo Vado SL', 'ebike', '/images/bikes/ebike.png', '["S","M","L"]', 100000, 25000, 30000, 40000, 50000, false, true, 'E-bike ringan dengan motor SL 1.1 untuk komuter urban modern.', 'Lightweight e-bike with SL 1.1 motor for modern urban commuting.', '15.0kg', 'SL 1.1 Motor', 'Hydraulic Disc', '700c', 4),
    ('Polygon Strattos S5', 'roadbike', '/images/bikes/roadbike.png', '["S","M","L","XL"]', 100000, 25000, 30000, 40000, 50000, false, false, 'Road bike alloy terjangkau dengan performa luar biasa.', 'Affordable alloy road bike with outstanding performance.', '8.9kg', 'Shimano 105', 'Disc Brake', '700c', 5),
    ('Polygon Xtrada 7', 'mtb', '/images/bikes/mtb.png', '["S","M","L"]', 100000, 25000, 30000, 40000, 50000, false, true, 'Hardtail MTB serbaguna untuk trail ringan hingga sedang.', 'Versatile hardtail MTB for light to moderate trails.', '11.5kg', 'Shimano Deore', 'Hydraulic Disc', '27.5"', 6)
  `;
  
  console.log('Seed complete!');
  
  const all = await sql`SELECT id, name, category FROM bikes ORDER BY sort_order`;
  console.log('Bikes in DB:', all);
}

setup().catch(console.error);
