const currentYear = new Date().getFullYear();

function stableHash(value) {
  let hash = 0;
  for (const character of String(value || 'member')) {
    hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

export const memberRewards = [
  { id: 1, name: { id: 'Diskon 10% Booking', en: '10% Booking Discount' }, cost: 100, iconType: 'discount' },
  { id: 2, name: { id: 'Free Helm MTB', en: 'Free MTB Helmet' }, cost: 200, iconType: 'helmet' },
  { id: 3, name: { id: 'Kaos Kulino Pit', en: 'Kulino Pit T-Shirt' }, cost: 500, iconType: 'shirt' },
  { id: 4, name: { id: 'Free Half-Day Tour', en: 'Free Half-Day Tour' }, cost: 1000, iconType: 'tour' },
];

export function normalizeMemberProfile(profile = {}, bookings = [], points = 0) {
  const name = String(profile.name || '').trim() || 'Member Kulino Pit';
  const identity = String(profile.email || profile.wa || profile.phone || name).trim().toLowerCase();
  const identityHash = stableHash(identity);
  const memberId = profile.memberId || `KP-${currentYear}-${String(identityHash % 1000000).padStart(6, '0')}`;
  const referralCode = profile.referralCode || `${name.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase() || 'KULINO'}${String(identityHash % 1000).padStart(3, '0')}`;

  return {
    ...profile,
    name,
    memberId,
    points: Number.isFinite(Number(points)) ? Number(points) : 0,
    level: profile.level || 'Member',
    totalBookings: Array.isArray(bookings) ? bookings.length : 0,
    referralCode,
    referralLink: `https://sewasepedabanyuwangi.fun/ref/${referralCode}`,
    referralStats: profile.referralStats || { clicks: 0, signups: 0, earnings: 0 },
  };
}
