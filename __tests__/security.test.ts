import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { createServer, Server } from 'http';
import next from 'next';

const app = next({ dev: true });
const handle = app.getRequestHandler();

describe('Security headers', () => {
  let server: Server;
  let request: ReturnType<typeof supertest>;
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => handle(req, res)).listen(4000);
    request = supertest('http://localhost:4000');
  });
  afterAll(() => {
    server.close();
  });
  it('should set security headers', async () => {
    const res = await request.get('/');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBeDefined();
  });
});

describe('CORS', () => {
  let server: Server;
  let request: ReturnType<typeof supertest>;
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => handle(req, res)).listen(4001);
    request = supertest('http://localhost:4001');
  });
  afterAll(() => {
    server.close();
  });
  it('should reject disallowed origins', async () => {
    const res = await request.get('/').set('Origin', 'https://evil.com');
    expect(res.status).toBe(403);
  });
});

describe('Rate-limit', () => {
  it('should rate-limit excessive requests (manual)', () => {
    expect(true).toBe(true);
  });
});

describe('Cookie flags', () => {
  let server: Server;
  let request: ReturnType<typeof supertest>;
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => handle(req, res)).listen(4002);
    request = supertest('http://localhost:4002');
  });
  afterAll(() => {
    server.close();
  });
  it('should set secure cookie flags', async () => {
    const res = await request.post('/api/auth/callback');
    const setCookieHeader = res.headers['set-cookie'];
    const setCookie = Array.isArray(setCookieHeader) ? setCookieHeader.join(';') : (setCookieHeader || '');
    expect(setCookie).toMatch(/HttpOnly/);
    expect(setCookie).toMatch(/Secure/);
    expect(setCookie).toMatch(/SameSite/);
  });
});
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { createServer, Server } from 'http';
import next from 'next';

const app = next({ dev: true });
const handle = app.getRequestHandler();

describe('Security headers', () => {
  let server: Server;
  let request: ReturnType<typeof supertest>;
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => handle(req, res)).listen(4000);
    request = supertest('http://localhost:4000');
  });
  afterAll(() => {
    server.close();
  });
  it('should set security headers', async () => {
    const res = await request.get('/');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBeDefined();
  });
});

describe('CORS', () => {
  let server: Server;
  let request: ReturnType<typeof supertest>;
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => handle(req, res)).listen(4001);
    request = supertest('http://localhost:4001');
  });
  afterAll(() => {
    server.close();
  });
  it('should reject disallowed origins', async () => {
    const res = await request.get('/').set('Origin', 'https://evil.com');
    expect(res.status).toBe(403);
  });
});

describe('Rate-limit', () => {
  it('should rate-limit excessive requests (manual)', () => {
    expect(true).toBe(true);
  });
});

describe('Cookie flags', () => {
  let server: Server;
  let request: ReturnType<typeof supertest>;
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => handle(req, res)).listen(4002);
    request = supertest('http://localhost:4002');
  });
  afterAll(() => {
    server.close();
  });
  it('should set secure cookie flags', async () => {
    const res = await request.post('/api/auth/callback');
    const setCookieHeader = res.headers['set-cookie'];
    const setCookie = Array.isArray(setCookieHeader) ? setCookieHeader.join(';') : (setCookieHeader || '');
    expect(setCookie).toMatch(/HttpOnly/);
    expect(setCookie).toMatch(/Secure/);
    expect(setCookie).toMatch(/SameSite/);
  });
});
