import supertest from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '@src/server';

describe('production HTTP security contracts', () => {
  it('serves liveness without dependencies', async () => {
    const response = await supertest(app).get('/health/live').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('does not reflect an untrusted CORS origin', async () => {
    const response = await supertest(app)
      .get('/health/live')
      .set('Origin', 'https://untrusted.example')
      .expect(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects browser mutations from an untrusted origin', async () => {
    await supertest(app)
      .post('/api/cart')
      .set('Origin', 'https://untrusted.example')
      .send({})
      .expect(403);
  });

  it('rejects a webhook with an invalid key', async () => {
    await supertest(app)
      .post('/api/payment/sepay/webhook')
      .set('x-api-key', 'wrong-key')
      .send({ id: 1, amountIn: 1000, content: 'GATS-INVALID' })
      .expect(401);
  });
});
