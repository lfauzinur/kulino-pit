import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { ensureAppDatabase, sql } from '@/lib/app-database';
import { cyclingRoutes } from '@/lib/routes-data';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

function slugify(value, fallback) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback;
}

function adminRoute(route, index = 0) {
  const coordinates = Array.isArray(route.coordinates) ? route.coordinates : [];
  const distance = Number(route.distance_km ?? parseFloat(route.distance));
  const elevation = Number(route.elevation_m ?? parseFloat(route.elevationGain));
  const checkpoints = Array.isArray(route.checkpoints) && route.checkpoints.length
    ? route.checkpoints
    : coordinates.map(([lat, lng], pointIndex) => ({ id: `cp-${route.id || index}-${pointIndex}`, name: pointIndex === 0 ? 'Titik Mulai' : `Titik ${pointIndex + 1}`, description: '', lat, lng }));
  return {
    id: route.id || `route-${index + 1}`,
    slug: route.slug || slugify(route.name?.id || route.name, `route-${index + 1}`),
    name: typeof route.name === 'object' ? (route.name.id || route.name.en) : String(route.name || ''),
    description: typeof route.description === 'object' ? (route.description.id || route.description.en) : String(route.description || ''),
    color: route.color || '#3B82F6',
    difficulty: typeof route.difficulty === 'object' ? (route.difficulty.id || route.difficulty.en) : (route.difficulty || 'Pemula'),
    distance_km: Number.isFinite(distance) ? distance : 0,
    duration_min: Number(route.duration_min || Math.max(15, Math.round((parseFloat(route.distance) || 0) * 4))),
    elevation_m: Number.isFinite(elevation) ? elevation : 0,
    active: route.active !== false,
    checkpoints: checkpoints.map((point, pointIndex) => ({
      id: point.id || `cp-${route.id || index}-${pointIndex}`,
      name: String(point.name || `Titik ${pointIndex + 1}`),
      description: String(point.description || ''),
      lat: Number(point.lat ?? point[0] ?? 0),
      lng: Number(point.lng ?? point[1] ?? 0),
    })),
  };
}

function publicRoute(route, index = 0) {
  const item = adminRoute(route, index);
  const coordinates = item.checkpoints.map((point) => [point.lat, point.lng]).filter(([lat, lng]) => lat && lng);
  const elevationProfile = Array.isArray(route.elevationProfile) && route.elevationProfile.length
    ? route.elevationProfile
    : coordinates.map((_, pointIndex) => ({ dist: Number(((item.distance_km / Math.max(1, coordinates.length - 1)) * pointIndex).toFixed(1)), elev: Math.round((item.elevation_m / Math.max(1, coordinates.length - 1)) * pointIndex) }));
  return {
    ...item,
    name: typeof route.name === 'object' ? route.name : { id: item.name, en: item.name },
    description: typeof route.description === 'object' ? route.description : { id: item.description, en: item.description },
    difficulty: typeof route.difficulty === 'object' ? route.difficulty : { id: item.difficulty, en: item.difficulty },
    surface: typeof route.surface === 'object' ? route.surface : { id: route.surface || 'Aspal', en: route.surface || 'Asphalt' },
    author: route.author || 'Kulino Pit',
    downloads: Number(route.downloads || 0),
    distance: `${item.distance_km} km`,
    elevationGain: `${item.elevation_m} m`,
    elevationLoss: `${Number(route.elevationLoss ? parseFloat(route.elevationLoss) : item.elevation_m)} m`,
    coordinates,
    elevationProfile,
    meetingPoint: route.meetingPoint || item.checkpoints[0]?.name || 'Kulino House, Banyuwangi',
    center: route.center || coordinates[0] || [-8.2192, 114.3691],
    zoom: Number(route.zoom || 13),
  };
}

async function readStoredRoutes() {
  const rows = await sql`SELECT value FROM app_settings WHERE key = 'cycling_routes' LIMIT 1`;
  const stored = rows[0]?.value;
  return Array.isArray(stored) ? stored : null;
}

export async function GET(request) {
  try {
    await ensureAppDatabase();
    const stored = await readStoredRoutes();
    const source = stored || cyclingRoutes;
    if (request.nextUrl.searchParams.get('admin') === '1') {
      if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
      return NextResponse.json({ items: source.map(adminRoute), configured: Boolean(stored) }, { headers: noStore });
    }
    const routes = source.map(publicRoute).filter((route) => route.active !== false);
    const slug = request.nextUrl.searchParams.get('slug');
    if (slug) {
      const route = routes.find((item) => item.slug === slug);
      return route ? NextResponse.json(route, { headers: noStore }) : NextResponse.json({ error: 'Rute tidak ditemukan.' }, { status: 404, headers: noStore });
    }
    return NextResponse.json(routes, { headers: noStore });
  } catch (error) {
    console.error('GET /api/routes error:', error);
    return NextResponse.json({ error: 'Data rute gagal dimuat.' }, { status: 500, headers: noStore });
  }
}

export async function PUT(request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  try {
    await ensureAppDatabase();
    const body = await request.json();
    if (!Array.isArray(body.routes) || body.routes.length > 100) {
      return NextResponse.json({ error: 'Format daftar rute tidak valid.' }, { status: 400, headers: noStore });
    }
    const routes = body.routes.map(adminRoute);
    await sql`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES ('cycling_routes', ${JSON.stringify(routes)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
    return NextResponse.json({ items: routes, configured: true }, { headers: noStore });
  } catch (error) {
    console.error('PUT /api/routes error:', error);
    return NextResponse.json({ error: 'Rute gagal disimpan.' }, { status: 500, headers: noStore });
  }
}
