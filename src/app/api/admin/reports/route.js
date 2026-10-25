import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function number(value) {
  return Number(value || 0);
}

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }

  try {
    await ensureAppDatabase();
    const [summaryRows, bookingsDaily, membersDaily, bookingStatuses, partnerStatuses, fleetRows, tourRows, recentBookings] = await Promise.all([
      sql`
        SELECT
          (SELECT COUNT(*) FROM bookings)::int AS bookings,
          (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status IN ('Active', 'Completed', 'Returned'))::bigint AS revenue,
          (SELECT COUNT(*) FROM members)::int AS members,
          (SELECT COUNT(*) FROM partner_applications)::int AS partners,
          (SELECT COUNT(*) FROM partner_applications WHERE status = 'Approved')::int AS approved_partners,
          (SELECT COUNT(*) FROM bikes)::int AS bike_models,
          (SELECT COALESCE(SUM(stock_count), 0) FROM bikes)::int AS bike_units,
          (SELECT COUNT(*) FROM tour_packages)::int AS tours,
          (SELECT COUNT(*) FROM tour_packages WHERE published = true)::int AS published_tours
      `,
      sql`
        SELECT TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS count,
               COALESCE(SUM(total_amount), 0)::bigint AS value
        FROM bookings
        WHERE created_at >= NOW() - INTERVAL '370 days'
        GROUP BY 1 ORDER BY 1
      `,
      sql`
        SELECT TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS count
        FROM members
        WHERE created_at >= NOW() - INTERVAL '370 days'
        GROUP BY 1 ORDER BY 1
      `,
      sql`SELECT status, COUNT(*)::int AS count FROM bookings GROUP BY status ORDER BY count DESC`,
      sql`SELECT status, COUNT(*)::int AS count FROM partner_applications GROUP BY status ORDER BY count DESC`,
      sql`
        SELECT b.id, b.name, b.category, b.stock_count, b.available,
               COUNT(bookings.id) FILTER (WHERE bookings.status = 'Active')::int AS rented_count
        FROM bikes b
        LEFT JOIN bookings ON bookings.bike_id = b.id
        GROUP BY b.id
        ORDER BY b.name ASC
      `,
      sql`
        SELECT c.name AS category, COUNT(p.id)::int AS total,
               COUNT(p.id) FILTER (WHERE p.published = true)::int AS published
        FROM tour_categories c
        LEFT JOIN tour_packages p ON p.category_id = c.id
        GROUP BY c.id, c.name ORDER BY c.name ASC
      `,
      sql`
        SELECT booking_code, customer_name, bike_name, total_amount, status,
               TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI') AS created_label
        FROM bookings ORDER BY created_at DESC LIMIT 8
      `,
    ]);

    const summary = summaryRows[0];
    const fleet = fleetRows.map((row) => {
      const stock = number(row.stock_count);
      const rented = number(row.rented_count);
      return {
        id: number(row.id),
        name: row.name,
        category: row.category,
        stock,
        rented,
        available: row.available ? Math.max(0, stock - rented) : 0,
        active: Boolean(row.available),
      };
    });

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary: {
        bookings: number(summary.bookings),
        revenue: number(summary.revenue),
        members: number(summary.members),
        partners: number(summary.partners),
        approvedPartners: number(summary.approved_partners),
        bikeModels: number(summary.bike_models),
        bikeUnits: number(summary.bike_units),
        tours: number(summary.tours),
        publishedTours: number(summary.published_tours),
      },
      bookingDaily: bookingsDaily.map((row) => ({ day: row.day, count: number(row.count), value: number(row.value) })),
      memberDaily: membersDaily.map((row) => ({ day: row.day, count: number(row.count) })),
      bookingStatuses: bookingStatuses.map((row) => ({ status: row.status, count: number(row.count) })),
      partnerStatuses: partnerStatuses.map((row) => ({ status: row.status, count: number(row.count) })),
      fleet,
      tours: tourRows.map((row) => ({ category: row.category, total: number(row.total), published: number(row.published) })),
      recentBookings: recentBookings.map((row) => ({
        code: row.booking_code,
        customer: row.customer_name,
        bike: row.bike_name,
        total: number(row.total_amount),
        status: row.status,
        createdAt: row.created_label,
      })),
    }, { headers: noStore });
  } catch (error) {
    console.error('GET /api/admin/reports error:', error);
    return NextResponse.json({ error: 'Laporan operasional gagal dimuat.' }, { status: 500, headers: noStore });
  }
}
