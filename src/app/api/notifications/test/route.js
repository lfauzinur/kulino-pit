import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase } from '@/lib/app-database';
import { sendEventNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await ensureAppDatabase();
    const results = await sendEventNotifications('test');
    return NextResponse.json({ results });
  } catch (error) {
    console.error('POST /api/notifications/test error:', error);
    return NextResponse.json({ error: 'Uji notifikasi gagal dijalankan.' }, { status: 500 });
  }
}
