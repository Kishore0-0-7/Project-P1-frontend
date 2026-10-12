import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

describe('organization-scoped API defaults', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } })));
  });

  it('uses the signed-in organization for scoped AI and reporting requests', async () => {
    localStorage.setItem('opstriage.auth.user', JSON.stringify({ org_id: 'tenant-cafe' }));
    await api.getSystemPosture();
    const calledUrl = String(vi.mocked(fetch).mock.calls[0][0]);
    expect(calledUrl).toContain('org_id=tenant-cafe');
  });
});
