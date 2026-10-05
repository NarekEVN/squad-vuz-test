import request from 'supertest';
import { type TestApp } from './create-app.js';

export async function registerUser(
  app: TestApp,
  email: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({ email, password: 'test1234' })
    .expect(201);
  return (res.body as { accessToken: string }).accessToken;
}
