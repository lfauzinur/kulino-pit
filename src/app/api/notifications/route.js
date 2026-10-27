import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql } from '@/lib/app-database';
import { notificationEvents, notificationProviderStatus } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function recipientRow(row) {
  return {
    id: String(row.id), channel: row.channel, destination: row.destination, label: row.label,
    events: Array.isArray(row.events) ? row.events : [], enabled: row.enabled,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function deliveryRow(row) {
  return {
    id: String(row.id), eventType: row.event_type, channel: row.channel, destination: row.destination,
    status: row.status, error: row.error, createdAt: row.created_at, sentAt: row.sent_at,
  };
}

function normalizeRecipient(body) {
  const channel = body.channel === 'telegram' ? 'telegram' : body.channel === 'email' ? 'email' : '';
  const destination = String(body.destination || '').trim().slice(0, 180);
  const label = String(body.label || '').trim().slice(0, 120);
  const events = [...new Set((Array.isArray(body.events) ? body.events : []).filter((item) => notificationEvents.includes(item)))];
  if (!channel) throw new Error('Pilih kanal Telegram atau Email.');
  if (!destination) throw new Error('Alamat penerima wajib diisi.');
  if (channel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)) throw new Error('Alamat email tidak valid.');
  if (channel === 'telegram' && !/^(-?\d+|@[A-Za-z0-9_]{5,})$/.test(destination)) throw new Error('Chat ID Telegram atau username channel tidak valid.');
  if (!events.length) throw new Error('Pilih minimal satu jenis notifikasi.');
  return { channel, destination, label, events, enabled: body.enabled !== false };
}

export async function GET() {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const [recipients, deliveries] = await Promise.all([
      sql`SELECT * FROM notification_recipients ORDER BY created_at DESC`,
      sql`SELECT * FROM notification_deliveries ORDER BY created_at DESC LIMIT 30`,
    ]);
    return NextResponse.json({
      recipients: recipients.map(recipientRow), deliveries: deliveries.map(deliveryRow), providers: notificationProviderStatus(),
    }, { headers: noStore });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ error: 'Gagal memuat pengaturan notifikasi.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const recipient = normalizeRecipient(await request.json());
    const rows = await sql`
      INSERT INTO notification_recipients (channel, destination, label, events, enabled)
      VALUES (${recipient.channel}, ${recipient.destination}, ${recipient.label}, ${JSON.stringify(recipient.events)}::jsonb, ${recipient.enabled})
      RETURNING *
    `;
    return NextResponse.json(recipientRow(rows[0]), { status: 201, headers: noStore });
  } catch (error) {
    const message = String(error?.message || 'Penerima notifikasi gagal ditambahkan.');
    if (message.includes('notification_recipients_channel_destination_key')) {
      return NextResponse.json({ error: 'Penerima pada kanal ini sudah terdaftar.' }, { status: 409, headers: noStore });
    }
    return NextResponse.json({ error: message }, { status: 400, headers: noStore });
  }
}
