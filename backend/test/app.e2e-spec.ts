import request from 'supertest';
import { REDIS_CLIENT } from '../src/integrations/redis/redis.module.js';
import { createTestApp, type TestApp } from './utils/create-app.js';

describe('App foundation (e2e)', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health reports database and redis up', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.info.database.status).toBe('up');
    expect(res.body.info.redis.status).toBe('up');
  });

  it('echoes an incoming x-request-id, or generates one', async () => {
    const echoed = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('x-request-id', 'test-123');
    expect(echoed.headers['x-request-id']).toBe('test-123');

    const generated = await request(app.getHttpServer()).get('/api/v1/health');
    expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('renders unknown routes in the uniform error format', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/does-not-exist')
      .expect(404);

    expect(res.body).toEqual({
      statusCode: 404,
      error: 'NOT_FOUND',
      message: expect.any(String),
    });
  });

  it('only serves routes under the /api/v1 prefix', async () => {
    await request(app.getHttpServer()).get('/health').expect(404);
  });

  it('sets security headers and allows the configured CORS origin', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
  });

  it('serves the OpenAPI document', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.paths).toHaveProperty('/api/v1/health');
    expect(res.body.paths).toHaveProperty('/api/v1/auth/login');
  });
});

describe('Health when Redis is down (e2e)', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp((builder) =>
      builder.overrideProvider(REDIS_CLIENT).useValue({
        ping: () => Promise.reject(new Error('connection refused')),
        quit: () => Promise.resolve('OK'),
      }),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 503 with the per-dependency report under details', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(503);

    expect(res.body.error).toBe('SERVICE_UNAVAILABLE');
    expect(res.body.details.info.database.status).toBe('up');
    expect(res.body.details.error.redis.status).toBe('down');
  });
});
