import { sql } from '@/lib/app-database';

export const notificationEvents = ['booking', 'customer', 'partner'];

function clean(value, fallback = '-') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function dateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[character]);
}

export function notificationProviderStatus() {
  return {
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFICATION_FROM_EMAIL),
  };
}

function eventMessage(eventType, payload = {}) {
  if (eventType === 'booking') {
    const booking = payload.booking || {};
    return {
      subject: `Booking baru ${clean(booking.id)}`,
      title: 'Booking Baru',
      rows: [
        ['Kode', clean(booking.id)], ['Customer', clean(booking.user)], ['WhatsApp', clean(booking.phone)],
        ['Unit', clean(booking.bike)], ['Tanggal sewa', clean(booking.date)], ['Durasi', clean(booking.duration)],
        ['Total', rupiah(booking.total)], ['Pembayaran', clean(booking.paymentMethod)],
      ],
    };
  }
  if (eventType === 'customer') {
    const member = payload.member || {};
    return {
      subject: `Customer baru ${clean(member.memberCode)}`,
      title: 'Customer Baru',
      rows: [
        ['Kode member', clean(member.memberCode)], ['Nama', clean(member.name)], ['WhatsApp', clean(member.phone)],
        ['Email', clean(member.email)], ['Pendaftaran', dateTime(member.registeredAt)], ['Metode daftar', clean(member.provider)],
      ],
    };
  }
  if (eventType === 'partner') {
    const partner = payload.partner || {};
    return {
      subject: `Pendaftar mitra baru ${clean(partner.id)}`,
      title: 'Pendaftar Mitra Baru',
      rows: [
        ['Kode pendaftaran', clean(partner.id)], ['Nama', clean(partner.name)], ['WhatsApp', clean(partner.phone)],
        ['Email', clean(partner.email)], ['Lokasi', clean(partner.city)], ['Sepeda', clean(partner.bikeName)],
        ['Kategori', clean(partner.category)], ['Didaftarkan', dateTime(partner.createdAt)],
      ],
    };
  }
  return { subject: 'Uji notifikasi Kulino Pit', title: 'Uji Notifikasi', rows: [['Status', 'Koneksi notifikasi aktif'], ['Waktu', dateTime(new Date())]] };
}

function renderText(message) {
  return [message.title, '', ...message.rows.map(([label, value]) => `${label}: ${value}`), '', 'Kulino Pit Admin'].join('\n');
}

function renderHtml(message) {
  return `<div style="font-family:Arial,sans-serif;color:#1f2937"><h2>${escapeHtml(message.title)}</h2><table style="border-collapse:collapse">${message.rows.map(([label, value]) => `<tr><td style="padding:6px 14px 6px 0;color:#64748b"><strong>${escapeHtml(label)}</strong></td><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`).join('')}</table><p style="color:#64748b">Kulino Pit Admin</p></div>`;
}

async function sendTelegram(destination, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN belum dikonfigurasi.');
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: destination, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.description || 'Telegram gagal mengirim pesan.');
  return String(data.result?.message_id || '');
}

async function sendEmail(destination, message) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('RESEND_API_KEY atau NOTIFICATION_FROM_EMAIL belum dikonfigurasi.');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [destination], subject: message.subject, text: renderText(message), html: renderHtml(message) }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.name || 'Email gagal dikirim.');
  return String(data.id || '');
}

async function deliver(recipient, eventType, payload) {
  const [delivery] = await sql`
    INSERT INTO notification_deliveries (recipient_id, event_type, channel, destination, status, payload)
    VALUES (${recipient.id}, ${eventType}, ${recipient.channel}, ${recipient.destination}, 'pending', ${JSON.stringify(payload)}::jsonb)
    RETURNING id
  `;
  const configured = recipient.channel === 'telegram'
    ? notificationProviderStatus().telegramConfigured
    : notificationProviderStatus().emailConfigured;
  if (!configured) {
    await sql`UPDATE notification_deliveries SET status = 'skipped', error = 'Provider belum dikonfigurasi.' WHERE id = ${delivery.id}`;
    return { recipientId: recipient.id, status: 'skipped' };
  }
  try {
    const message = eventMessage(eventType, payload);
    const providerMessageId = recipient.channel === 'telegram'
      ? await sendTelegram(recipient.destination, renderText(message))
      : await sendEmail(recipient.destination, message);
    await sql`UPDATE notification_deliveries SET status = 'sent', provider_message_id = ${providerMessageId}, sent_at = NOW() WHERE id = ${delivery.id}`;
    return { recipientId: recipient.id, status: 'sent' };
  } catch (error) {
    const message = String(error?.message || 'Pengiriman gagal.').slice(0, 700);
    await sql`UPDATE notification_deliveries SET status = 'failed', error = ${message} WHERE id = ${delivery.id}`;
    return { recipientId: recipient.id, status: 'failed', error: message };
  }
}

export async function sendEventNotifications(eventType, payload = {}) {
  const recipients = await sql`
    SELECT id, channel, destination, label, events
    FROM notification_recipients
    WHERE enabled = true AND (${eventType} = 'test' OR events @> ${JSON.stringify([eventType])}::jsonb)
    ORDER BY created_at ASC
  `;
  return Promise.all(recipients.map((recipient) => deliver(recipient, eventType, payload)));
}
