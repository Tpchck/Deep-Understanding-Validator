import { describe, it, expect, vi } from 'vitest';
import { proxy } from '../proxy';
import { NextRequest } from 'next/server';

// Mock Supabase to avoid hitting real database
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}));

describe('Security middleware (proxy.ts)', () => {
  it('should reject disallowed origins', async () => {
    const req = new NextRequest('http://localhost:3000/', {
      headers: new Headers({
        origin: 'https://evil.com',
      }),
    });

    const res = await proxy(req);
    expect(res.status).toBe(403);
    const text = await res.text();
    expect(text).toBe('CORS Forbidden');
  });

  it('should reject CSRF on mutating methods if referer is bad', async () => {
    const req = new NextRequest('http://localhost:3000/api/data', {
      method: 'POST',
      headers: new Headers({
        referer: 'https://evil.com/page',
      }),
    });

    const res = await proxy(req);
    expect(res.status).toBe(403);
    const text = await res.text();
    expect(text).toBe('CSRF Forbidden');
  });

  it('should allow allowed origins', async () => {
    const req = new NextRequest('http://localhost:3000/login', {
      headers: new Headers({
        origin: 'http://localhost:3000',
      }),
    });

    const res = await proxy(req);
    // Because user is null, it should redirect to /login but since we are at /login, it allows it
    expect(res.status).toBe(200);
  });
});
