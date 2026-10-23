import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { normalizePaymentMethod, readPaymentMethods, validatePaymentMethod, writePaymentMethods } from '@/lib/payment-methods';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const current = await readPaymentMethods();
    const index = current.findIndex((item) => item.id === id);
    if (index < 0) return NextResponse.json({ error: 'Metode pembayaran tidak ditemukan.' }, { status: 404 });

    const method = normalizePaymentMethod({ ...current[index], ...(await request.json()), id }, id);
    const validationError = validatePaymentMethod(method);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    current[index] = method;
    const saved = await writePaymentMethods(current);
    return NextResponse.json(saved.find((item) => item.id === id));
  } catch (error) {
    console.error('PATCH /api/payment-methods/[id] error:', error);
    return NextResponse.json({ error: 'Metode pembayaran gagal diperbarui.' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const current = await readPaymentMethods();
    const target = current.find((item) => item.id === id);
    if (!target) return NextResponse.json({ error: 'Metode pembayaran tidak ditemukan.' }, { status: 404 });
    await writePaymentMethods(current.filter((item) => item.id !== id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/payment-methods/[id] error:', error);
    return NextResponse.json({ error: 'Metode pembayaran gagal dihapus.' }, { status: 500 });
  }
}
