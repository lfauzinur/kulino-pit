export async function syncMemberProfile(profile, { required = false } = {}) {
  try {
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      if (required) throw new Error(result.error || 'Data member gagal disimpan.');
      return profile;
    }
    const stored = await response.json();
    return { ...profile, ...stored };
  } catch (error) {
    if (required) throw error;
    return profile;
  }
}
