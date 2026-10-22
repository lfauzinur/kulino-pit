import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, partnerRow, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    return NextResponse.json(partnerRow(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/partners/[id] error:', error);
    return NextResponse.json({ error: 'Status mitra gagal diperbarui.' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }
  try {
    await ensureAppDatabase();
    const { id } = await params;
    const rows = await sql`
      DELETE FROM partner_applications
      WHERE application_code = ${decodeURIComponent(id)}
      RETURNING photo_public_id
    `;
    if (!rows.length) return NextResponse.json({ error: 'Pendaftaran tidak ditemukan.' }, { status: 404, headers: noStore });
    if (rows[0].photo_public_id) {
      await cloudinary.uploader.destroy(rows[0].photo_public_id).catch((error) => {
        console.error('Partner photo cleanup error:', error);
      });
    }
    return NextResponse.json({ success: true }, { headers: noStore });
  } catch (error) {
    console.error('DELETE /api/partners/[id] error:', error);
    return NextResponse.json({ error: 'Pendaftaran gagal dihapus.' }, { status: 500, headers: noStore });
  }
}
