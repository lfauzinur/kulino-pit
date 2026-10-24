export async function syncMemberProfile(profile) {
  try {
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) return profile;
    const stored = await response.json();
    return { ...profile, ...stored };
  } catch {
    return profile;
  }
}
