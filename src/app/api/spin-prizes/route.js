import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql } from '@/lib/app-database';

const DEFAULT_PRIZES = [
  { label: 'Diskon 10%', color: '#0284C7', chance: 25 },
  { label: 'Gratis Helm', color: '#0D9488', chance: 15 },
  { label: 'Voucher 50K', color: '#D97706', chance: 20 },
  { label: 'Coba Lagi', color: '#475569', chance: 25 },
  { label: 'Gratis 1 Jam', color: '#2563EB', chance: 10 },
  { label: 'Jersey Kulino', color: '#059669', chance: 5 },
];

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
  try {
    await ensureAppDatabase();
    const rows = await sql`SELECT value FROM app_settings WHERE key = 'spin_prizes'`;
    return NextResponse.json(rows[0]?.value || DEFAULT_PRIZES, { headers: noStore });
  } catch (error) {
    console.error('GET /api/spin-prizes error:', error);
    return NextResponse.json({ error: 'Gagal memuat hadiah.' }, { status: 500, headers: noStore });
  }
}

export async function PUT(request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureAppDatabase();
    const prizes = await request.json();
    if (!Array.isArray(prizes) || prizes.length < 2) {
      return NextResponse.json({ error: 'Minimal dua hadiah diperlukan.' }, { status: 400 });
    }

    const normalized = prizes.map((prize) => ({
      label: String(prize.label || '').trim(),
      color: String(prize.color || ''),
      chance: Number(prize.chance),
    }));
    const valid = normalized.every((prize) =>
      prize.label && /^#[0-9a-f]{6}$/i.test(prize.color) &&
      Number.isInteger(prize.chance) && prize.chance >= 0 && prize.chance <= 100
    );
    const total = normalized.reduce((sum, prize) => sum + prize.chance, 0);
    if (!valid || total !== 100) {
      return NextResponse.json({ error: `Total probabilitas wajib tepat 100% (saat ini ${total}%).` }, { status: 400 });
    }

    await sql`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES ('spin_prizes', ${JSON.stringify(normalized)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('PUT /api/spin-prizes error:', error);
    return NextResponse.json({ error: 'Hadiah gagal disimpan.' }, { status: 500 });
  }
}
