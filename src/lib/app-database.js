import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

let schemaPromise;

export function ensureAppDatabase() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id BIGSERIAL PRIMARY KEY,
          booking_code TEXT NOT NULL UNIQUE,
          customer_name TEXT NOT NULL,
          customer_phone TEXT DEFAULT '',
          customer_email TEXT DEFAULT '',
          customer_id_number TEXT DEFAULT '',
          bike_id BIGINT REFERENCES bikes(id) ON DELETE SET NULL,
          bike_name TEXT NOT NULL,
          rental_date DATE NOT NULL,
          start_time TEXT DEFAULT '',
          duration_key TEXT DEFAULT 'day',
          duration_label TEXT DEFAULT '',
          duration_minutes INTEGER DEFAULT 1440,
          pickup_method TEXT DEFAULT 'pickup',
          delivery_address TEXT DEFAULT '',
          accessories JSONB DEFAULT '[]'::jsonb,
          payment_method TEXT DEFAULT '',
          total_amount INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'Pending',
          active_since TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS partner_applications (
          id BIGSERIAL PRIMARY KEY,
          application_code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT DEFAULT '',
          city TEXT NOT NULL,
          address TEXT DEFAULT '',
          bike_name TEXT NOT NULL,
          bike_brand TEXT DEFAULT '',
          bike_category TEXT DEFAULT '',
          bike_condition TEXT DEFAULT 'Baik',
          bike_year TEXT DEFAULT '',
          bike_color TEXT DEFAULT '',
          bike_frame TEXT DEFAULT '',
          bike_groupset TEXT DEFAULT '',
          bike_brake TEXT DEFAULT '',
          bike_wheel TEXT DEFAULT '',
          notes TEXT DEFAULT '',
          join_reason TEXT DEFAULT '',
          id_card TEXT DEFAULT '',
          photo_url TEXT DEFAULT '',
          photo_public_id TEXT,
          status TEXT NOT NULL DEFAULT 'Pending',
          revenue INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS photo_public_id TEXT`;

      await sql`
        CREATE TABLE IF NOT EXISTS articles (
          id BIGSERIAL PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          title_id TEXT NOT NULL,
          title_en TEXT NOT NULL,
          excerpt_id TEXT DEFAULT '',
          excerpt_en TEXT DEFAULT '',
          content JSONB DEFAULT '[]'::jsonb,
          image TEXT DEFAULT '/images/bikes/roadbike.png',
          image_public_id TEXT,
          author TEXT DEFAULT 'Kulino Team',
          category_id TEXT DEFAULT 'Berita',
          category_en TEXT DEFAULT 'News',
          tags JSONB DEFAULT '[]'::jsonb,
          meta_title TEXT DEFAULT '',
          meta_description TEXT DEFAULT '',
          keywords TEXT DEFAULT '',
          canonical_url TEXT DEFAULT '',
          published_global BOOLEAN DEFAULT false,
          published_english BOOLEAN DEFAULT false,
          status TEXT NOT NULL DEFAULT 'draft',
          published_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`ALTER TABLE bikes ADD COLUMN IF NOT EXISTS stock_count INTEGER NOT NULL DEFAULT 1`;
      await sql`UPDATE bikes SET stock_count = 1 WHERE stock_count IS NULL OR stock_count < 0`;

      await sql`
        CREATE TABLE IF NOT EXISTS tour_categories (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS tour_packages (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          price INTEGER NOT NULL DEFAULT 0,
          category_id BIGINT NOT NULL REFERENCES tour_categories(id) ON DELETE RESTRICT,
          duration TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`CREATE UNIQUE INDEX IF NOT EXISTS tour_categories_name_lower_idx ON tour_categories (LOWER(name))`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS tour_packages_name_lower_idx ON tour_packages (LOWER(name))`;
      await sql`INSERT INTO tour_categories (name) VALUES ('Group Tours'), ('Private Tours') ON CONFLICT DO NOTHING`;
      await sql`
        INSERT INTO tour_packages (name, price, category_id, duration)
        SELECT 'Banyuwangi City Tour', 150000, id, '4 Hours'
        FROM tour_categories
        WHERE name = 'Group Tours'
          AND NOT EXISTS (SELECT 1 FROM tour_packages WHERE name = 'Banyuwangi City Tour')
        LIMIT 1
        ON CONFLICT DO NOTHING
      `;

      await sql`CREATE INDEX IF NOT EXISTS bookings_rental_date_idx ON bookings (rental_date)`;
      await sql`CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS partner_status_idx ON partner_applications (status)`;
      await sql`CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status, published_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS tour_packages_category_idx ON tour_packages (category_id)`;
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }

  return schemaPromise;
}

export function bookingRow(row) {
  return {
    databaseId: Number(row.id),
    id: row.booking_code,
    date: String(row.rental_date).slice(0, 10),
    time: row.start_time || '',
    user: row.customer_name,
    phone: row.customer_phone,
    email: row.customer_email,
    bikeId: row.bike_id ? Number(row.bike_id) : null,
    bike: row.bike_name,
    duration: row.duration_label,
    durationMinutes: row.duration_minutes,
    days: Math.max(1, Math.ceil((row.duration_minutes || 1440) / 1440)),
    pickupMethod: row.pickup_method,
    paymentMethod: row.payment_method,
    total: row.total_amount,
    status: row.status,
    activeSince: row.active_since ? new Date(row.active_since).getTime() : null,
    createdAt: row.created_at,
  };
}

export function bikeRow(row) {
  const stockCount = Math.max(0, Number(row.stock_count ?? 1));
  const rentedCount = Math.max(0, Number(row.active_count || 0));
  const availableStock = Math.max(0, stockCount - rentedCount);
  const manualAvailable = Boolean(row.available);
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    image: row.image,
    imagePublicId: row.image_public_id,
    frameSize: Array.isArray(row.frame_size) ? row.frame_size : (row.frame_size ? JSON.parse(row.frame_size) : ['M']),
    pricePerDay: Number(row.price_per_day),
    price2h: Number(row.price_2h),
    price3h: Number(row.price_3h),
    price4h: Number(row.price_4h),
    price6h: Number(row.price_6h),
    popular: Boolean(row.popular),
    available: manualAvailable && availableStock > 0,
    manualAvailable,
    stockCount,
    rentedCount,
    availableStock,
    description: { id: row.description_id, en: row.description_en },
    specs: {
      weight: row.spec_weight,
      groupset: row.spec_groupset,
      brake: row.spec_brake,
      wheel: row.spec_wheel,
    },
  };
}

export function partnerRow(row) {
  return {
    databaseId: Number(row.id),
    id: row.application_code,
    name: row.name,
    phone: row.phone,
    email: row.email,
    city: row.city,
    address: row.address,
    bike: row.bike_name,
    bikeBrand: row.bike_brand,
    category: row.bike_category,
    condition: row.bike_condition,
    bikeYear: row.bike_year,
    bikeColor: row.bike_color,
    bikeFrame: row.bike_frame,
    bikeGroupset: row.bike_groupset,
    bikeBrake: row.bike_brake,
    bikeWheel: row.bike_wheel,
    notes: row.notes,
    joinReason: row.join_reason,
    idCard: row.id_card,
    photoUrl: row.photo_url,
    photoPublicId: row.photo_public_id,
    status: row.status,
    revenue: row.revenue,
    date: new Date(row.created_at).toISOString().slice(0, 10),
  };
}

export function articleRow(row) {
  return {
    databaseId: Number(row.id),
    id: row.slug,
    slug: row.slug,
    title: { id: row.title_id, en: row.title_en },
    excerpt: { id: row.excerpt_id, en: row.excerpt_en },
    content: Array.isArray(row.content) ? row.content : [],
    image: row.image,
    imagePublicId: row.image_public_id,
    author: row.author,
    category: { id: row.category_id, en: row.category_en },
    tags: Array.isArray(row.tags) ? row.tags : [],
    date: new Date(row.published_at || row.created_at).toISOString().slice(0, 10),
    publishedGlobally: row.published_global,
    publishedEnglish: row.published_english,
    status: row.status,
    meta: {
      title: row.meta_title,
      description: row.meta_description,
      keywords: row.keywords,
      canonical: row.canonical_url,
    },
  };
}
