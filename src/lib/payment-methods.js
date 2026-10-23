import { randomUUID } from 'crypto';
import { ensureAppDatabase, sql } from '@/lib/app-database';

const SETTINGS_KEY = 'payment_methods';

function cleanText(value, maxLength = 180) {
  return String(value || '').trim().slice(0, maxLength);
}

export function normalizePaymentMethod(input = {}, fallbackId = '') {
  const type = input.type === 'qris' ? 'qris' : 'bank';
  return {
    id: cleanText(input.id || fallbackId || randomUUID(), 80),
    type,
    name: cleanText(input.name || (type === 'qris' ? 'QRIS' : 'Transfer Bank'), 80),
    provider: cleanText(input.provider, 80),
    accountNumber: cleanText(input.accountNumber, 80),
    accountHolder: cleanText(input.accountHolder, 120),
    instructions: cleanText(input.instructions, 500),
    imageUrl: cleanText(input.imageUrl, 500),
    imagePublicId: cleanText(input.imagePublicId, 240),
    active: Boolean(input.active),
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Math.round(Number(input.sortOrder)) : 0,
  };
}

export function validatePaymentMethod(method) {
  if (!method.name) return 'Nama metode pembayaran wajib diisi.';
  if (method.type === 'bank' && (!method.provider || !method.accountNumber || !method.accountHolder)) {
    return 'Nama bank, nomor rekening, dan pemilik rekening wajib diisi.';
  }
  if (method.type === 'qris' && method.active && !method.imageUrl) {
    return 'Upload gambar QRIS sebelum metode QRIS diaktifkan.';
  }
  return '';
}

export async function readPaymentMethods({ activeOnly = false } = {}) {
  await ensureAppDatabase();
  const rows = await sql`SELECT value FROM app_settings WHERE key = ${SETTINGS_KEY}`;
  const methods = Array.isArray(rows[0]?.value) ? rows[0].value.map((item) => normalizePaymentMethod(item, item.id)) : [];

  const sorted = methods.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return activeOnly ? sorted.filter((method) => method.active) : sorted;
}

export async function writePaymentMethods(methods) {
  await ensureAppDatabase();
  const normalized = methods.map((method) => normalizePaymentMethod(method, method.id));
  await sql`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(normalized)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
  return normalized.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

