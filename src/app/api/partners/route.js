import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, partnerRow, sql } from '@/lib/app-database';
import { sendEventNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageSize = 4 * 1024 * 1024;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function readPartnerSubmission(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return { body: await request.json(), photo: null };
  }

  const formData = await request.formData();
  const body = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === 'string')
  );
  const photo = formData.get('photo');
  return { body, photo: photo && typeof photo !== 'string' && photo.size ? photo : null };
}

async function uploadPartnerPhoto(photo) {
  if (!photo) return { url: '', publicId: null };
  if (!allowedImageTypes.has(photo.type)) {
    throw new Error('PHOTO_TYPE');
  }
  if (photo.size > maxImageSize) {
    throw new Error('PHOTO_SIZE');
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('PHOTO_CONFIG');
  }

  const bytes = await photo.arrayBuffer();
  const dataUri = `data:${photo.type};base64,${Buffer.from(bytes).toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'kulino-pit/partners',
    resource_type: 'image',
    transformation: [{ width: 1600, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  }
  try {
    await ensureAppDatabase();
    const rows = await sql`SELECT * FROM partner_applications ORDER BY created_at DESC`;
    return NextResponse.json(rows.map(partnerRow), { headers: noStore });
  } catch (error) {
    console.error('GET /api/partners error:', error);
    return NextResponse.json({ error: 'Gagal memuat pendaftaran mitra.' }, { status: 500, headers: noStore });
  }
}

export async function POST(request) {
  let uploadedPhoto = null;
  try {
    await ensureAppDatabase();
    const { body, photo } = await readPartnerSubmission(request);
    const name = String(body.name || '').trim();
    const phone = String(body.phone || body.whatsapp || '').trim();
    const city = String(body.city || body.location || '').trim();
    const bikeName = String(body.bikeName || body.bikeType || '').trim();
    if (!name || !phone || !city || !bikeName) {
      return NextResponse.json({ error: 'Nama, WhatsApp, lokasi, dan tipe sepeda wajib diisi.' }, { status: 400 });
    }
    uploadedPhoto = await uploadPartnerPhoto(photo);
    const code = `PR-${randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`;
    const rows = await sql`
      INSERT INTO partner_applications (
        application_code, name, phone, email, city, address, bike_name, bike_brand,
        bike_category, bike_condition, bike_year, bike_color, bike_frame, bike_groupset,
        bike_brake, bike_wheel, notes, join_reason, id_card, photo_url, photo_public_id
      ) VALUES (
        ${code}, ${name}, ${phone}, ${String(body.email || '')}, ${city}, ${String(body.address || '')},
        ${bikeName}, ${String(body.bikeBrand || '')}, ${String(body.category || '')},
        ${String(body.condition || 'Baik')}, ${String(body.bikeYear || '')}, ${String(body.bikeColor || '')},
        ${String(body.bikeSize || body.bikeFrame || '')}, ${String(body.bikeGroupset || '')},
        ${String(body.bikeBrake || '')}, ${String(body.bikeWheel || '')}, ${String(body.notes || '')},
        ${String(body.joinReason || '')}, ${String(body.idCard || '')},
        ${uploadedPhoto.url || String(body.photoUrl || '')}, ${uploadedPhoto.publicId}
      ) RETURNING *
    `;
    const partner = partnerRow(rows[0]);
    await sendEventNotifications('partner', { partner: {
      id: partner.id, name: partner.name, phone: partner.phone, email: partner.email,
      city: partner.city, bikeName: partner.bike, category: partner.category, createdAt: partner.date,
    } }).catch((error) => console.error('Partner notification error:', error));
    return NextResponse.json(partner, { status: 201, headers: noStore });
  } catch (error) {
    console.error('POST /api/partners error:', error);
    if (uploadedPhoto?.publicId) {
      await cloudinary.uploader.destroy(uploadedPhoto.publicId).catch(() => undefined);
    }
    if (error.message === 'PHOTO_TYPE') {
      return NextResponse.json({ error: 'Foto harus berformat JPG, PNG, atau WebP.' }, { status: 400, headers: noStore });
    }
    if (error.message === 'PHOTO_SIZE') {
      return NextResponse.json({ error: 'Ukuran foto maksimal 4 MB.' }, { status: 400, headers: noStore });
    }
    if (error.message === 'PHOTO_CONFIG') {
      return NextResponse.json({ error: 'Penyimpanan foto belum dikonfigurasi di server.' }, { status: 503, headers: noStore });
    }
    return NextResponse.json({ error: 'Pendaftaran mitra gagal disimpan.' }, { status: 500, headers: noStore });
  }
}
