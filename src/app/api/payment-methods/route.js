import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { normalizePaymentMethod, readPaymentMethods, validatePaymentMethod, writePaymentMethods } from '@/lib/payment-methods';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(request) {
  try {
    const includeInactive = new URL(request.url).searchParams.get('all') === '1';
    if (includeInactive && !(await requireAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
    }
    const methods = await readPaymentMethods({ activeOnly: !includeInactive });
    return NextResponse.json(methods, { headers: noStore });
  } catch (error) {
    console.error('GET /api/payment-methods error:', error);
    return NextResponse.json({ error: 'Gagal memuat metode pembayaran.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const current = await readPaymentMethods();
    const method = normalizePaymentMethod(await request.json());
    const validationError = validatePaymentMethod(method);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    if (current.some((item) => item.id === method.id)) {
      return NextResponse.json({ error: 'ID metode pembayaran sudah digunakan.' }, { status: 409 });
    }
    const saved = await writePaymentMethods([...current, method]);
    return NextResponse.json(saved.find((item) => item.id === method.id), { status: 201 });
  } catch (error) {
    console.error('POST /api/payment-methods error:', error);
    return NextResponse.json({ error: 'Metode pembayaran gagal ditambahkan.' }, { status: 500 });
  }
}

