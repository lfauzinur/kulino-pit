import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, partnerRow, sql } from '@/lib/app-database';

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureAppDatabase();
    const { id } = await params;
    const { status } = await request.json();
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
    }
    const rows = await sql`
      UPDATE partner_applications SET status = ${status}, updated_at = NOW()
      WHERE application_code = ${decodeURIComponent(id)} RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Pendaftaran tidak ditemukan.' }, { status: 404 });
    return NextResponse.json(partnerRow(rows[0]));
  } catch (error) {
    console.error('PATCH /api/partners/[id] error:', error);
    return NextResponse.json({ error: 'Status mitra gagal diperbarui.' }, { status: 500 });
  }
}
