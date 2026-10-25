import { NextResponse } from 'next/server';
import { bookingRow, ensureAppDatabase, sql } from '@/lib/app-database';
import { getMemberSession } from '@/lib/member-auth';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
  try {
    const session = await getMemberSession();
    if (!session) return NextResponse.json({ error: 'Sesi member tidak ditemukan.' }, { status: 401, headers: noStore });
    await ensureAppDatabase();
    const members = await sql`
      SELECT id, member_code, name, phone, email, address, provider, photo_url, created_at, last_login_at
      FROM members
      WHERE id = ${session.memberId} AND member_code = ${session.memberCode}
      LIMIT 1
    `;
    if (!members.length) return NextResponse.json({ error: 'Data member tidak ditemukan.' }, { status: 404, headers: noStore });
    const member = members[0];
    const phoneDigits = String(member.phone || '').replace(/\D/g, '');
    const email = String(member.email || '').trim().toLowerCase();
    const bookings = await sql`
      SELECT * FROM bookings
      WHERE member_id = ${member.id}
         OR (${phoneDigits} <> '' AND regexp_replace(COALESCE(customer_phone, ''), '[^0-9]', '', 'g') = ${phoneDigits})
         OR (${email} <> '' AND LOWER(TRIM(COALESCE(customer_email, ''))) = ${email})
      ORDER BY created_at DESC
    `;
    return NextResponse.json({
      member: {
        memberId: member.member_code,
        name: member.name,
        wa: member.phone || '',
        email: member.email || '',
        address: member.address || '',
        provider: member.provider,
        photo: member.photo_url || null,
        registeredAt: member.created_at,
        lastLoginAt: member.last_login_at,
      },
      bookings: bookings.map((row) => ({ ...bookingRow(row), status: String(row.status || '').toLowerCase() })),
    }, { headers: noStore });
  } catch (error) {
    console.error('GET /api/members/dashboard error:', error);
    return NextResponse.json({ error: 'Dashboard member gagal dimuat.' }, { status: 500, headers: noStore });
  }
}
