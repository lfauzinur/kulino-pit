import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }

  try {
    await ensureAppDatabase();
    const rows = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'Active')::int AS active,
        COUNT(*) FILTER (WHERE status = 'Completed')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'Cancelled')::int AS cancelled,
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('Active', 'Completed')), 0)::bigint AS revenue,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'Completed'), 0)::bigint AS completed_revenue
      FROM bookings
    `;
    const row = rows[0];
    return NextResponse.json({
      total: Number(row.total),
      pending: Number(row.pending),
      active: Number(row.active),
      completed: Number(row.completed),
      cancelled: Number(row.cancelled),
      revenue: Number(row.revenue),
      completedRevenue: Number(row.completed_revenue),
      revenueDefinition: 'Active + Completed',
    }, { headers: noStore });
  } catch (error) {
    console.error('GET /api/bookings/summary error:', error);
    return NextResponse.json({ error: 'Ringkasan booking gagal dimuat.' }, { status: 500, headers: noStore });
  }
}
