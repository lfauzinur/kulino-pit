import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { bookingRow, ensureAppDatabase, sql } from '@/lib/app-database';

const allowedStatuses = new Set(['Pending', 'Active', 'Returned', 'Completed', 'Cancelled']);

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureAppDatabase();
    const { id } = await params;
    const { status } = await request.json();
    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
    }

    const bookingCode = decodeURIComponent(id);
    const currentRows = await sql`SELECT * FROM bookings WHERE booking_code = ${bookingCode} LIMIT 1`;
    if (!currentRows.length) return NextResponse.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });
    const current = currentRows[0];
    const allowedTransition = current.status === status
      || (current.status === 'Pending' && ['Active', 'Cancelled'].includes(status))
      || (['Active', 'Completed'].includes(current.status) && status === 'Returned');
    if (!allowedTransition) return NextResponse.json({ error: `Status ${current.status} tidak dapat diubah menjadi ${status}.` }, { status: 409 });

    const rows = await sql`
      UPDATE bookings AS target
      SET status = ${status},
          active_since = CASE WHEN ${status} = 'Active' AND active_since IS NULL THEN NOW() ELSE active_since END,
          returned_at = CASE WHEN ${status} = 'Returned' THEN NOW() ELSE returned_at END,
          updated_at = NOW()
      WHERE booking_code = ${bookingCode}
        AND (
          ${status} <> 'Active'
          OR target.status = 'Active'
          OR EXISTS (
            SELECT 1 FROM bikes
            WHERE bikes.id = target.bike_id
              AND bikes.available = true
              AND (
                SELECT COUNT(*) FROM bookings AS occupied
                WHERE occupied.bike_id = target.bike_id
                  AND occupied.status = 'Active'
                  AND occupied.id <> target.id
              ) < bikes.stock_count
          )
        )
      RETURNING *
    `;
    if (!rows.length) {
      const existing = await sql`SELECT id FROM bookings WHERE booking_code = ${bookingCode} LIMIT 1`;
      if (existing.length && status === 'Active') {
        return NextResponse.json({ error: 'Booking tidak dapat disetujui karena stok unit sudah habis.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json(bookingRow(rows[0]));
  } catch (error) {
    console.error('PATCH /api/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Status booking gagal diperbarui.' }, { status: 500 });
  }
}
