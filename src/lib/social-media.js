const SOCIAL_HOSTS = new Set([
  'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be',
  'instagram.com', 'www.instagram.com',
  'tiktok.com', 'www.tiktok.com', 'm.tiktok.com',
  'vt.tiktok.com', 'vm.tiktok.com',
]);

function safeUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:' || !SOCIAL_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url;
  } catch {
    return null;
  }
}

function youtubeId(url) {
  if (url.hostname === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
  if (url.pathname === '/watch') return url.searchParams.get('v') || '';
  const parts = url.pathname.split('/').filter(Boolean);
  if (['shorts', 'embed', 'live'].includes(parts[0])) return parts[1] || '';
  return '';
}

export async function resolveSocialMedia(value) {
  const url = safeUrl(value);
  if (!url) return null;

  if (url.hostname.includes('youtu')) {
    const id = youtubeId(url).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!id) return null;
    return {
      provider: 'youtube',
      sourceUrl: url.toString(),
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      aspectRatio: '16 / 9',
    };
  }

  if (url.hostname.includes('instagram.com')) {
    const match = url.pathname.match(/^\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    const [, type, shortcode] = match;
    return {
      provider: 'instagram',
      sourceUrl: `https://www.instagram.com/${type}/${shortcode}/`,
      embedUrl: `https://www.instagram.com/${type}/${shortcode}/embed/`,
      thumbnailUrl: '',
      aspectRatio: type === 'p' ? '1 / 1' : '9 / 16',
    };
  }

  if (url.hostname.includes('tiktok.com')) {
    if (url.hostname === 'vt.tiktok.com' || url.hostname === 'vm.tiktok.com') {
      try {
        const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(5000) });
        if (response.url && response.url !== url.toString()) return resolveSocialMedia(response.url);
      } catch { return null; }
    }
    const match = url.pathname.match(/\/video\/(\d+)/);
    if (!match) return null;
    const result = {
      provider: 'tiktok',
      sourceUrl: url.toString(),
      embedUrl: `https://www.tiktok.com/player/v1/${match[1]}`,
      thumbnailUrl: '',
      aspectRatio: '9 / 16',
    };
    try {
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url.toString())}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json();
        result.thumbnailUrl = typeof data.thumbnail_url === 'string' ? data.thumbnail_url : '';
        if (Number(data.width) > 0 && Number(data.height) > 0) result.aspectRatio = `${Number(data.width)} / ${Number(data.height)}`;
      }
    } catch { /* keep the safe platform defaults */ }
    return result;
  }

  return null;
}
