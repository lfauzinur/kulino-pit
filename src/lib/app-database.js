import { neon } from '@neondatabase/serverless';
import { resolveSocialMedia } from '@/lib/social-media';

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

      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method_id TEXT DEFAULT ''`;

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

      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS slug TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS description_id TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS description_en TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS distance TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS difficulty_id TEXT NOT NULL DEFAULT 'Mudah'`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS difficulty_en TEXT NOT NULL DEFAULT 'Easy'`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT '/images/hero-banner.png'`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS image_public_id TEXT`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS includes_id JSONB NOT NULL DEFAULT '[]'::jsonb`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS includes_en JSONB NOT NULL DEFAULT '[]'::jsonb`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS meeting_point TEXT NOT NULL DEFAULT 'Kulino House, Banyuwangi'`;
      await sql`ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true`;

      await sql`
        CREATE TABLE IF NOT EXISTS services (
          id BIGSERIAL PRIMARY KEY,
          title_id TEXT NOT NULL,
          title_en TEXT NOT NULL DEFAULT '',
          description_id TEXT NOT NULL DEFAULT '',
          description_en TEXT NOT NULL DEFAULT '',
          features_id JSONB NOT NULL DEFAULT '[]'::jsonb,
          features_en JSONB NOT NULL DEFAULT '[]'::jsonb,
          price_label TEXT NOT NULL DEFAULT '',
          icon TEXT NOT NULL DEFAULT 'camera',
          accent_color TEXT NOT NULL DEFAULT '#3B82F6',
          sort_order INTEGER NOT NULL DEFAULT 0,
          published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS gallery_items (
          id BIGSERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          media_type TEXT NOT NULL DEFAULT 'photo',
          media_url TEXT NOT NULL,
          media_public_id TEXT,
          thumbnail_url TEXT NOT NULL DEFAULT '',
          thumbnail_public_id TEXT,
          caption TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'upload'`;
      await sql`ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS embed_url TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS playback_url TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS aspect_ratio TEXT NOT NULL DEFAULT '16 / 9'`;
      const legacySocialItems = await sql`
        SELECT id, media_url FROM gallery_items
        WHERE media_type = 'video' AND (provider = 'upload' OR (provider = 'instagram' AND playback_url = ''))
          AND (media_url ILIKE '%youtube.com/%' OR media_url ILIKE '%youtu.be/%' OR media_url ILIKE '%instagram.com/%' OR media_url ILIKE '%tiktok.com/%')
      `;
      for (const item of legacySocialItems) {
        const social = await resolveSocialMedia(item.media_url);
        if (social) {
          await sql`
            UPDATE gallery_items SET provider = ${social.provider}, embed_url = ${social.embedUrl}, playback_url = ${social.playbackUrl || ''},
              thumbnail_url = ${social.thumbnailUrl}, aspect_ratio = ${social.aspectRatio}, updated_at = NOW()
            WHERE id = ${item.id}
          `;
        }
      }

      await sql`
        CREATE TABLE IF NOT EXISTS content_cards (
          id BIGSERIAL PRIMARY KEY,
          section_key TEXT NOT NULL,
          title_id TEXT NOT NULL,
          title_en TEXT NOT NULL DEFAULT '',
          description_id TEXT NOT NULL DEFAULT '',
          description_en TEXT NOT NULL DEFAULT '',
          icon TEXT NOT NULL DEFAULT 'users',
          accent_color TEXT NOT NULL DEFAULT '#3B82F6',
          sort_order INTEGER NOT NULL DEFAULT 0,
          published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`CREATE UNIQUE INDEX IF NOT EXISTS tour_categories_name_lower_idx ON tour_categories (LOWER(name))`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS tour_packages_name_lower_idx ON tour_packages (LOWER(name))`;
      await sql`INSERT INTO tour_categories (name) VALUES ('Group Tours'), ('Private Tours') ON CONFLICT DO NOTHING`;
      await sql`UPDATE tour_packages SET published = false WHERE slug = ''`;
      await sql`
        INSERT INTO tour_packages (
          name, slug, price, category_id, duration, distance, difficulty_id, difficulty_en,
          description_id, description_en, image, includes_id, includes_en, meeting_point, published
        )
        SELECT
          seed.name, seed.slug, seed.price, category.id, seed.duration, seed.distance,
          seed.difficulty_id, seed.difficulty_en, seed.description_id, seed.description_en,
          '/images/hero-banner.png', seed.includes_id::jsonb, seed.includes_en::jsonb,
          'Kulino House, Banyuwangi', true
        FROM (
          VALUES
            ('City Tour Sunrise Ride', 'city-tour-sunrise-ride', 450000, '4 jam', '35 km', 'Mudah', 'Easy',
             'Nikmati sunrise spektakuler sambil bersepeda menyusuri jalanan kota yang masih sepi di pagi hari.',
             'Enjoy a spectacular sunrise while cycling through the quiet city streets in the early morning.',
             '["Sepeda & Helm","Road Captain","Snack & Air Mineral","Dokumentasi Foto"]',
             '["Bike & Helmet","Road Captain","Snack & Water","Photo Documentation"]'),
            ('Mountain Scenic Trail', 'mountain-scenic-trail', 750000, '6 jam', '45 km', 'Sedang', 'Medium',
             'Petualangan off-road menyusuri jalur pegunungan dengan pemandangan alam yang memukau.',
             'Off-road adventure through mountain trails with breathtaking natural views.',
             '["MTB & Helm","Road Captain + Sweeper","Makan Siang Lokal","Dokumentasi Drone","Tim Medis"]',
             '["MTB & Helmet","Road Captain + Sweeper","Local Lunch","Drone Documentation","Medical Team"]'),
            ('Coastal Explorer Full Day', 'coastal-explorer-full-day', 1200000, '8 jam', '65 km', 'Sulit', 'Hard',
             'Tour sehari penuh menyusuri pesisir pantai dengan dukungan tim lengkap dan pengalaman tak terlupakan.',
             'Full day tour along the coast with complete team support and an unforgettable experience.',
             '["Sepeda Premium","Full Support Team","Makan Siang + Snack","Dokumentasi Full","Jersey Eksklusif","Medali Finisher"]',
             '["Premium Bike","Full Support Team","Lunch + Snacks","Full Documentation","Exclusive Jersey","Finisher Medal"]')
        ) AS seed(name, slug, price, duration, distance, difficulty_id, difficulty_en, description_id, description_en, includes_id, includes_en)
        CROSS JOIN LATERAL (SELECT id FROM tour_categories WHERE name = 'Group Tours' LIMIT 1) category
        WHERE NOT EXISTS (SELECT 1 FROM tour_packages WHERE tour_packages.slug = seed.slug)
        ON CONFLICT DO NOTHING
      `;

      await sql`
        INSERT INTO services (title_id, title_en, description_id, description_en, features_id, features_en, price_label, icon, accent_color, sort_order)
        SELECT seed.* FROM (VALUES
          ('Dokumentasi Profesional', 'Professional Documentation', 'Layanan foto & video profesional menggunakan Drone, DSLR, dan Action Cam saat gowes.', 'Professional cycling photo and video service using drones, DSLR, and action cameras.', '["Drone DJI Mavic 3 Pro","DSLR Canon EOS R5","GoPro Hero 12 Black","Video Edit & Highlight Reel","Foto High-Res Unlimited"]'::jsonb, '["DJI Mavic 3 Pro Drone","Canon EOS R5 DSLR","GoPro Hero 12 Black","Video Edit & Highlight Reel","Unlimited High-Res Photos"]'::jsonb, 'Mulai dari Rp 500.000', 'camera', '#3B82F6', 10),
          ('Angkut Sepeda (Trucking)', 'Bike Transport (Trucking)', 'Transportasi pengangkutan sepeda antar kota atau ke titik start event.', 'Bike transportation between cities or to an event starting point.', '["Pickup truck hingga 20 unit sepeda","Antar-jemput ke titik start/finish","Antar kota Jawa & Bali","Asuransi pengangkutan","Pengemasan aman dengan foam padding"]'::jsonb, '["Pickup truck for up to 20 bikes","Start/finish point pickup","Java & Bali intercity","Transport insurance","Safe foam-padded packing"]'::jsonb, 'Mulai dari Rp 750.000', 'truck', '#F59E0B', 20),
          ('Manpower Event & Escort', 'Event Manpower & Escort', 'Road Captain, Marshal, MC Event, Mekanik, Tim Medis, dan Patwal.', 'Road Captain, Marshal, Event MC, Mechanic, Medical Team, and Escort.', '["Road Captain bersertifikat","Marshal & Sweeper berpengalaman","MC Event profesional","Mekanik terlatih","Tim medis siaga","Patwal resmi"]'::jsonb, '["Certified Road Captain","Experienced Marshal & Sweeper","Professional Event MC","Trained Mechanic","Standby Medical Team","Official Escort"]'::jsonb, 'Harga disesuaikan', 'users', '#10B981', 30)
        ) AS seed(title_id, title_en, description_id, description_en, features_id, features_en, price_label, icon, accent_color, sort_order)
        WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(services.title_id) = LOWER(seed.title_id))
        ON CONFLICT DO NOTHING
      `;

      // These three records were initial UI demos. Older builds re-created them on
      // every request after an admin deleted them. Clean them once and never seed
      // them again so an admin deletion remains permanent.
      await sql`
        WITH cleanup_marker AS (
          INSERT INTO app_settings (key, value)
          VALUES ('cleanup_demo_gallery_v1', '{"completed":true}'::jsonb)
          ON CONFLICT (key) DO NOTHING
          RETURNING key
        )
        DELETE FROM gallery_items
        WHERE EXISTS (SELECT 1 FROM cleanup_marker)
          AND (
            (title = 'Sunrise Ride Banyuwangi' AND media_url = '/images/hero-banner.png')
            OR (title = 'Koleksi Sepeda Kulino Pit' AND media_url = '/images/tour_gallery_1.png')
            OR (title = 'Kulino Pit Ride Highlight' AND media_url = '/videos/kulino-pit-highlight.mp4')
          )
      `;

      await sql`
        INSERT INTO content_cards (section_key, title_id, title_en, description_id, description_en, icon, accent_color, sort_order)
        SELECT seed.* FROM (VALUES
          ('corporate_benefits', 'Team Building', 'Team Building', 'Perkuat solidaritas tim melalui aktivitas bersepeda bersama', 'Strengthen team solidarity through cycling activities', 'users', '#2563EB', 10),
          ('corporate_benefits', 'Dokumentasi', 'Documentation', 'Foto & video profesional untuk kenangan dan media perusahaan', 'Professional photos and videos for company memories and media', 'camera', '#F59E0B', 20),
          ('corporate_benefits', 'Prestise', 'Prestige', 'Kegiatan yang berkesan dan berbeda dari team building konvensional', 'A memorable activity beyond conventional team building', 'award', '#8B5CF6', 30),
          ('corporate_benefits', 'Ramah Lingkungan', 'Eco Friendly', 'Tunjukkan komitmen perusahaan terhadap lingkungan', 'Show your company commitment to the environment', 'leaf', '#10B981', 40),
          ('manpower_roles', 'Road Captain (RC)', 'Road Captain (RC)', 'Pemimpin rute dan keselamatan peserta', 'Route leader responsible for participant safety', 'flag', '#F59E0B', 10),
          ('manpower_roles', 'Marshal / Sweeper', 'Marshal / Sweeper', 'Pengawal di persimpangan dan pendampingan', 'Intersection marshal and participant escort', 'shield-check', '#EF4444', 20),
          ('manpower_roles', 'MC Event Cycling', 'Cycling Event MC', 'Pembawa acara event bersepeda', 'Cycling event host', 'mic', '#8B5CF6', 30),
          ('manpower_roles', 'Mekanik / Teknisi', 'Mechanic / Technician', 'Penanganan masalah teknis sepeda', 'Bicycle technical support', 'wrench', '#3B82F6', 40),
          ('manpower_roles', 'Tim Medis & First Aid', 'Medical & First Aid Team', 'Penanganan pertolongan pertama', 'First aid and medical response', 'heart-pulse', '#10B981', 50),
          ('manpower_roles', 'Patwal / Pengawalan', 'Police Escort', 'Pengawalan rombongan di jalan raya', 'Road escort for cycling groups', 'siren', '#06B6D4', 60)
        ) AS seed(section_key, title_id, title_en, description_id, description_en, icon, accent_color, sort_order)
        WHERE NOT EXISTS (
          SELECT 1 FROM content_cards
          WHERE content_cards.section_key = seed.section_key AND LOWER(content_cards.title_id) = LOWER(seed.title_id)
        )
      `;

      await sql`CREATE INDEX IF NOT EXISTS bookings_rental_date_idx ON bookings (rental_date)`;
      await sql`CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS partner_status_idx ON partner_applications (status)`;
      await sql`CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status, published_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS tour_packages_category_idx ON tour_packages (category_id)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS tour_packages_slug_idx ON tour_packages (slug) WHERE slug <> ''`;
      await sql`DELETE FROM services a USING services b WHERE LOWER(a.title_id) = LOWER(b.title_id) AND a.id > b.id`;
      await sql`DELETE FROM gallery_items a USING gallery_items b WHERE a.media_url = b.media_url AND a.id > b.id`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS services_title_lower_idx ON services (LOWER(title_id))`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS gallery_items_media_url_idx ON gallery_items (media_url)`;
      await sql`CREATE INDEX IF NOT EXISTS services_sort_idx ON services (published, sort_order, id)`;
      await sql`CREATE INDEX IF NOT EXISTS gallery_items_sort_idx ON gallery_items (published, sort_order, id)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS content_cards_section_title_idx ON content_cards (section_key, LOWER(title_id))`;
      await sql`CREATE INDEX IF NOT EXISTS content_cards_sort_idx ON content_cards (section_key, published, sort_order, id)`;
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
    paymentMethodId: row.payment_method_id || '',
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
    gallery: Array.isArray(row.gallery)
      ? row.gallery
        .map((item) => typeof item === 'string' ? { url: item, publicId: '' } : item)
        .filter((item) => item && typeof item.url === 'string' && item.url.trim())
      : [],
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

export function tourRow(row) {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: { id: row.name, en: row.name },
    price: Number(row.price),
    categoryId: Number(row.category_id),
    category: row.category_name,
    duration: row.duration,
    distance: row.distance,
    difficulty: { id: row.difficulty_id, en: row.difficulty_en },
    description: { id: row.description_id, en: row.description_en },
    image: row.image,
    imagePublicId: row.image_public_id,
    includes: {
      id: Array.isArray(row.includes_id) ? row.includes_id : [],
      en: Array.isArray(row.includes_en) ? row.includes_en : [],
    },
    meetingPoint: row.meeting_point,
    published: Boolean(row.published),
  };
}

export function serviceRow(row) {
  return {
    id: Number(row.id),
    title: { id: row.title_id, en: row.title_en || row.title_id },
    description: { id: row.description_id, en: row.description_en || row.description_id },
    features: {
      id: Array.isArray(row.features_id) ? row.features_id : [],
      en: Array.isArray(row.features_en) ? row.features_en : [],
    },
    priceLabel: row.price_label,
    icon: row.icon,
    accentColor: row.accent_color,
    sortOrder: Number(row.sort_order),
    published: Boolean(row.published),
  };
}

export function galleryRow(row) {
  return {
    id: Number(row.id),
    title: row.title,
    type: row.media_type,
    mediaUrl: row.media_url,
    provider: row.provider || 'upload',
    embedUrl: row.embed_url || '',
    playbackUrl: row.playback_url || '',
    aspectRatio: row.aspect_ratio || '16 / 9',
    mediaPublicId: row.media_public_id,
    thumbnailUrl: row.thumbnail_url || (row.media_type === 'photo' ? row.media_url : ''),
    thumbnailPublicId: row.thumbnail_public_id,
    caption: row.caption,
    sortOrder: Number(row.sort_order),
    published: Boolean(row.published),
  };
}

export function contentCardRow(row) {
  return {
    id: Number(row.id),
    section: row.section_key,
    title: { id: row.title_id, en: row.title_en || row.title_id },
    description: { id: row.description_id, en: row.description_en || row.description_id },
    icon: row.icon,
    accentColor: row.accent_color,
    sortOrder: Number(row.sort_order),
    published: Boolean(row.published),
  };
}
