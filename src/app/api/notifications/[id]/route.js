import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql } from '@/lib/app-database';
import { notificationEvents } from '@/lib/notifications';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function asId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function row(data) {
  return { id: String(data.id), channel: data.channel, destination: data.destination, label: data.label, events: Array.isArray(data.events) ? data.events : [], enabled: data.enabled, createdAt: data.created_at, updatedAt: data.updated_at };
}

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  const id = asId((await params).id);
  if (!id) return NextResponse.json({ error: 'Penerima tidak valid.' }, { status: 400, headers: noStore });
  try {
    await ensureAppDatabase();
    const body = await request.json();
    const existing = await sql`SELECT * FROM notification_recipients WHERE id = ${id}`;
    if (!existing.length) return NextResponse.json({ error: 'Penerima tidak ditemukan.' }, { status: 404, headers: noStore });
    const current = existing[0];
    const label = body.label === undefined ? current.label : String(body.label || '').trim().slice(0, 120);
    const enabled = body.enabled === undefined ? current.enabled : Boolean(body.enabled);
    const events = body.events === undefined ? current.events : [...new Set((Array.isArray(body.events) ? body.events : []).filter((item) => notificationEvents.includes(item)))];
    if (!events.length) return NextResponse.json({ error: 'Pilih minimal satu jenis notifikasi.' }, { status: 400, headers: noStore });
    const rows = await sql`
      UPDATE notification_recipients
      SET label = ${label}, enabled = ${enabled}, events = ${JSON.stringify(events)}::jsonb, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(row(rows[0]), { headers: noStore });
  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error);
    return NextResponse.json({ error: 'Penerima notifikasi gagal diperbarui.' }, { status: 500, headers: noStore });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  const id = asId((await params).id);
  if (!id) return NextResponse.json({ error: 'Penerima tidak valid.' }, { status: 400, headers: noStore });
  try {
    await ensureAppDatabase();
    const rows = await sql`DELETE FROM notification_recipients WHERE id = ${id} RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: 'Penerima tidak ditemukan.' }, { status: 404, headers: noStore });
    return NextResponse.json({ success: true }, { headers: noStore });
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);
    return NextResponse.json({ error: 'Penerima notifikasi gagal dihapus.' }, { status: 500, headers: noStore });
  }
}
