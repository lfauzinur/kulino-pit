import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { bookingRow, ensureAppDatabase, sql } from '@/lib/app-database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function phoneKey(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? `phone:${digits}` : '';
}

function emailKey(value) {
  const email = String(value || '').trim().toLowerCase();
  return email ? `email:${email}` : '';
}

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }

  try {
    await ensureAppDatabase();
    const [members, bookingRows] = await Promise.all([
      sql`SELECT * FROM members ORDER BY created_at DESC`,
      sql`SELECT * FROM bookings ORDER BY created_at DESC`,
    ]);
    const customers = new Map();
    const aliases = new Map();

    const rememberAlias = (key, customerKey) => {
      if (key) aliases.set(key, customerKey);
    };

    for (const member of members) {
      const pKey = phoneKey(member.phone);
      const eKey = emailKey(member.email);
      const key = pKey || eKey || `member:${member.id}`;
      customers.set(key, {
        id: member.member_code || `member-${member.id}`,
        name: member.name,
        phone: member.phone || '',
        email: member.email || '',
        address: member.address || '',
        provider: member.provider || 'form',
        registeredAt: member.created_at,
        lastLoginAt: member.last_login_at,
        bookings: [],
      });
      rememberAlias(pKey, key);
      rememberAlias(eKey, key);
    }

    for (const row of bookingRows) {
      const booking = bookingRow(row);
      const pKey = phoneKey(row.customer_phone);
      const eKey = emailKey(row.customer_email);
      const key = aliases.get(pKey) || aliases.get(eKey) || pKey || eKey || `booking:${row.id}`;
      if (!customers.has(key)) {
        customers.set(key, {
          id: `customer-${row.id}`,
          name: row.customer_name,
          phone: row.customer_phone || '',
          email: row.customer_email || '',
          address: row.delivery_address || '',
          provider: 'booking',
          registeredAt: row.created_at,
          lastLoginAt: null,
          bookings: [],
        });
      }
      const customer = customers.get(key);
      customer.name ||= row.customer_name;
      customer.phone ||= row.customer_phone || '';
      customer.email ||= row.customer_email || '';
      if (row.delivery_address) customer.address = row.delivery_address;
      if (new Date(row.created_at) < new Date(customer.registeredAt)) customer.registeredAt = row.created_at;
      customer.bookings.push(booking);
      rememberAlias(pKey, key);
      rememberAlias(eKey, key);
    }

    const result = [...customers.values()].map((customer) => ({
      ...customer,
      bookingCount: customer.bookings.length,
      totalTransaction: customer.bookings.reduce((sum, booking) => sum + Number(booking.total || 0), 0),
      paidTransaction: customer.bookings
        .filter((booking) => ['Active', 'Completed'].includes(booking.status))
        .reduce((sum, booking) => sum + Number(booking.total || 0), 0),
    })).sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    return NextResponse.json(result, { headers: noStore });
  } catch (error) {
    console.error('GET /api/admin/customers error:', error);
    return NextResponse.json({ error: 'Gagal memuat data customer.' }, { status: 500, headers: noStore });
  }
}
