import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  return neon(url);
}

// Helper to get today's date in WIB (Asia/Jakarta, GMT+7)
function getTodayDateWIB() {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

// Anonymize IP via SHA-256 (no raw IP stored, strictly 1 IP/day logic)
function hashIp(ip) {
  const salt = 'kulino_pit_wib_salt_2026';
  return crypto.createHash('sha256').update((ip || '127.0.0.1') + salt).digest('hex').substring(0, 16);
}

// In-memory fallback if database is temporarily unreachable
let memoryStore = {
  total: 0,
  days: {},
  seenIps: {}
};

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS kulino_visitors (
      ip_hash VARCHAR(64) NOT NULL,
      visit_date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (ip_hash, visit_date)
    );
  `;
}

// GET: Read current real visitor stats without incrementing
export async function GET() {
  const today = getTodayDateWIB();
  const sql = getDb();

  if (sql) {
    try {
      await ensureTable(sql);
      const [todayResult, totalResult] = await Promise.all([
        sql`SELECT COUNT(*)::int AS count FROM kulino_visitors WHERE visit_date = ${today}::date`,
        sql`SELECT COUNT(*)::int AS count FROM kulino_visitors`
      ]);

      return NextResponse.json({
        total: totalResult[0]?.count || 0,
        today: todayResult[0]?.count || 0,
        date: today
      });
    } catch (dbErr) {
      console.error('Database GET error, falling back:', dbErr);
    }
  }

  // Fallback to memoryStore
  const todayCount = (memoryStore.days && memoryStore.days[today]) ? memoryStore.days[today].length : 0;
  return NextResponse.json({
    total: memoryStore.total,
    today: todayCount,
    date: today
  });
}

// POST: Record real visit (strictly 1 IP per day)
export async function POST(req) {
  try {
    // 1. Extract Real IP from request headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip');
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : (realIp || cfIp || '127.0.0.1');

    // 2. Anonymize IP
    const ipHash = hashIp(rawIp);
    const today = getTodayDateWIB();
    const sql = getDb();

    if (sql) {
      try {
        await ensureTable(sql);

        // 3. Insert if not exists for today (ON CONFLICT DO NOTHING guarantees max 1 IP per day)
        const insertResult = await sql`
          INSERT INTO kulino_visitors (ip_hash, visit_date)
          VALUES (${ipHash}, ${today}::date)
          ON CONFLICT (ip_hash, visit_date) DO NOTHING
          RETURNING ip_hash;
        `;
        const isNewVisitToday = insertResult.length > 0;

        // 4. Fetch real accurate counts
        const [todayResult, totalResult] = await Promise.all([
          sql`SELECT COUNT(*)::int AS count FROM kulino_visitors WHERE visit_date = ${today}::date`,
          sql`SELECT COUNT(*)::int AS count FROM kulino_visitors`
        ]);

        return NextResponse.json({
          total: totalResult[0]?.count || 0,
          today: todayResult[0]?.count || 0,
          isNewVisitToday,
          date: today
        });
      } catch (dbErr) {
        console.error('Database POST error, falling back:', dbErr);
      }
    }

    // Fallback if DB is not available
    if (!memoryStore.days) memoryStore.days = {};
    if (!memoryStore.seenIps) memoryStore.seenIps = {};
    if (!Array.isArray(memoryStore.days[today])) memoryStore.days[today] = [];

    const lastSeenDate = memoryStore.seenIps[ipHash];
    const isNewVisitorToday = lastSeenDate !== today;

    if (isNewVisitorToday) {
      memoryStore.seenIps[ipHash] = today;
      memoryStore.days[today].push(ipHash);
      memoryStore.total = (memoryStore.total || 0) + 1;
    }

    return NextResponse.json({
      total: memoryStore.total,
      today: memoryStore.days[today].length,
      isNewVisitToday: isNewVisitorToday,
      date: today
    });
  } catch (error) {
    return NextResponse.json({ total: 0, today: 0, error: error.message }, { status: 500 });
  }
}
