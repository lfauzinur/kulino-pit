import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { bookingRow, ensureAppDatabase, sql } from '@/lib/app-database';
import { readPaymentMethods } from '@/lib/payment-methods';
import { getMemberSession } from '@/lib/member-auth';
import { sendEventNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const accessoryPrices = { helmet: 25000, lights: 35000, saddlebag: 20000, gps: 75000, jersey: 95000, repairkit: 30000 };

function normalizePhone(value) {
  return String(value || '').trim().replace(/[^\d+]/g, '').slice(0, 40);
}

function isValidPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }

  try {
    await ensureAppDatabase();
    const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    return NextResponse.json(rows.map(bookingRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json({ error: 'Gagal memuat booking.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const customerName = String(body.customerName || '').trim();
    const customerPhone = normalizePhone(body.customerPhone);
    const rentalDate = String(body.rentalDate || '').slice(0, 10);
    const durationMinutes = Number(body.durationMinutes || 1440);
    const bikeId = Number(body.bikeId);

    if (!customerName || !isValidPhone(customerPhone) || !Number.isSafeInteger(bikeId) || !/^\d{4}-\d{2}-\d{2}$/.test(rentalDate)) {
      return NextResponse.json({ error: 'Nama, nomor WhatsApp valid, sepeda, dan tanggal wajib diisi.' }, { status: 400 });
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return NextResponse.json({ error: 'Nilai booking tidak valid.' }, { status: 400 });
    }
    await ensureAppDatabase();
    const memberSession = await getMemberSession();

    const bikes = await sql`
      SELECT b.id, b.name, b.available, b.stock_count, b.price_per_day, b.price_2h, b.price_3h, b.price_4h, b.price_6h,
             COUNT(bookings.id) FILTER (WHERE bookings.status = 'Active')::int AS active_count
      FROM bikes b
      LEFT JOIN bookings ON bookings.bike_id = b.id
      WHERE b.id = ${bikeId}
      GROUP BY b.id
    `;
    if (!bikes.length || !bikes[0].available || Number(bikes[0].active_count) >= Number(bikes[0].stock_count)) {
      return NextResponse.json({ error: 'Unit sepeda tidak ditemukan atau stok sedang habis.' }, { status: 409 });
    }
    const bike = bikes[0];
    const durationKey = ['2h', '3h', '4h', '6h', 'day'].includes(body.durationKey) ? body.durationKey : 'day';
    const prices = {
      '2h': bike.price_2h,
      '3h': bike.price_3h,
      '4h': bike.price_4h,
      '6h': bike.price_6h,
      day: bike.price_per_day,
    };
    const quantity = durationKey === 'day' ? Math.max(1, Math.ceil(durationMinutes / 1440)) : 1;
    const selectedAccessories = Array.isArray(body.accessories)
      ? [...new Set(body.accessories.filter((id) => Object.hasOwn(accessoryPrices, id)))]
      : [];
    const accessoryTotal = selectedAccessories.reduce((sum, id) => sum + accessoryPrices[id], 0);
    const deliveryFee = body.pickupMethod === 'delivery' ? 50000 : 0;
    const uniqueCode = Math.min(99, Math.max(0, Number(body.uniqueCode) || 0));
    const totalAmount = (Number(prices[durationKey]) * quantity) + accessoryTotal + deliveryFee + uniqueCode;
    const paymentMethods = await readPaymentMethods({ activeOnly: true });
    const selectedPaymentMethod = paymentMethods.find((method) => method.id === String(body.paymentMethodId || ''))
      || paymentMethods.find((method) => method.name === String(body.paymentMethod || ''))
      || paymentMethods[0];
    if (!selectedPaymentMethod) {
      return NextResponse.json({ error: 'Belum ada metode pembayaran aktif. Hubungi admin.' }, { status: 409 });
    }

    const code = `KP-${Date.now().toString().slice(-9)}`;
    const rows = await sql`
      INSERT INTO bookings (
        booking_code, member_id, customer_name, customer_phone, customer_email, customer_id_number,
        bike_id, bike_name, rental_date, start_time, duration_key, duration_label,
        duration_minutes, pickup_method, delivery_address, accessories, payment_method, payment_method_id,
        total_amount, status, active_since
      ) VALUES (
        ${code}, ${memberSession?.memberId || null}, ${customerName}, ${customerPhone},
        ${String(body.customerEmail || '').trim()}, ${String(body.customerIdNumber || '').trim()},
        ${bikeId}, ${bike.name}, ${rentalDate},
        ${String(body.startTime || '')}, ${durationKey},
        ${String(body.durationLabel || '')}, ${Math.round(durationMinutes)},
        ${body.pickupMethod === 'delivery' ? 'delivery' : 'pickup'},
        ${String(body.deliveryAddress || '')}, ${JSON.stringify(selectedAccessories)}::jsonb,
        ${selectedPaymentMethod.name}, ${selectedPaymentMethod.id}, ${Math.round(totalAmount)}, 'Pending', NULL
      ) RETURNING *
    `;

    const booking = bookingRow(rows[0]);
    await sendEventNotifications('booking', { booking }).catch((error) => console.error('Booking notification error:', error));
    return NextResponse.json({ ...booking, paymentMethodDetails: selectedPaymentMethod }, { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Booking gagal disimpan.' }, { status: 500 });
  }
}
