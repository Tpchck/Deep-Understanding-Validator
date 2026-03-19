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

describe('Security middleware', () => {
  it('blocks requests from untrusted origins (CORS)', async () => {
    const req = new NextRequest('http://localhost:3000/', {
      headers: new Headers({
        origin: 'https://evil.com',
      }),
    });

    const res = await proxy(req);
    expect(res.status).toBe(403);
    expect(await res.text()).toBe('CORS Forbidden');
  });

  it('blocks POST with untrusted referer (CSRF)', async () => {
    const req = new NextRequest('http://localhost:3000/api/submit', {
      method: 'POST',
      headers: new Headers({
        referer: 'https://evil.com/phishing',
      }),
    });

    const res = await proxy(req);
    expect(res.status).toBe(403);
    expect(await res.text()).toBe('CSRF Forbidden');
  });

  it('allows requests from trusted origin (localhost)', async () => {
    const req = new NextRequest('http://localhost:3000/login', {
      headers: new Headers({
        origin: 'http://localhost:3000',
      }),
    });

    const res = await proxy(req);
    // User is null → middleware allows /login page without redirect
    expect(res.status).toBe(200);
  });

  it('redirects unauthenticated users to /login', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/login');
  });

  it('allows GET requests without referer check', async () => {
    // GET requests should not be subject to CSRF referer checks
    const req = new NextRequest('http://localhost:3000/login', {
      method: 'GET',
      headers: new Headers({
        referer: 'https://evil.com/',
      }),
    });

    const res = await proxy(req);
    // Should still pass (CSRF only applies to mutating methods)
    expect(res.status).not.toBe(403);
  });
});
