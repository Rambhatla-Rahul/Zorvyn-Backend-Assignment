import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/db/prisma.js';
let adminToken;
let viewerToken;
let analystToken;

let viewerId;
let recordId;


beforeAll(async () => {
  await prisma.record.deleteMany();
  await prisma.user.deleteMany();
});
describe('Full API Test Suite', () => {
  
  test('Register admin', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'admin@test.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(201);
  });

  test('Register viewer', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'viewer@test.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(201);
    viewerId = res.body.data.user.id;
  });

  test('Login admin', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@test.com',
      password: '123456',
    });

    adminToken = res.body.data.token;
    expect(adminToken).toBeDefined();
  });

  test('Login viewer', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'viewer@test.com',
      password: '123456',
    });

    viewerToken = res.body.data.token;
    expect(viewerToken).toBeDefined();
  });

  test('Set roles correctly', async () => {
  await prisma.user.update({
    where: { email: 'admin@test.com' },
    data: { role: 'ADMIN' },
  });

  await prisma.user.update({
    where: { email: 'viewer@test.com' },
    data: { role: 'VIEWER' },
  });

  const adminLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@test.com',
    password: '123456',
  });

  adminToken = adminLogin.body.data.token;

  const viewerLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'viewer@test.com',
    password: '123456',
  });

  viewerToken = viewerLogin.body.data.token;
});

  test('Admin creates record for viewer', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 1000,
        type: 'income',
        category: 'salary',
        date: '2026-04-01T00:00:00.000Z',
        email: 'viewer@test.com',
      });

    expect(res.statusCode).toBe(201);
    recordId = res.body.data.id;
  });

  test('Viewer cannot create record', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        amount: 200,
        type: 'expense',
        category: 'food',
        date: '2026-04-01T00:00:00.000Z',
      });

    expect(res.statusCode).toBe(403);
  });

  test('Viewer can view own records', async () => {
    const res = await request(app)
      .get('/api/v1/records')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('Admin can update record', async () => {
    const res = await request(app)
      .put(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2000 });

    expect(res.statusCode).toBe(200);
  });

  test('Viewer cannot update record', async () => {
    const res = await request(app)
      .put(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 3000 });

    expect(res.statusCode).toBe(403);
  });

  test('Admin soft deletes record', async () => {
    const res = await request(app)
      .delete(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test('Deleted record should not appear', async () => {
    const res = await request(app)
      .get('/api/v1/records')
      .set('Authorization', `Bearer ${viewerToken}`);

    const ids = res.body.data.map(r => r.id);
    expect(ids).not.toContain(recordId);
  });

  test('Viewer dashboard summary', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('totalIncome');
  });

  test('Unauthorized access blocked', async () => {
    const res = await request(app).get('/api/v1/records');
    expect(res.statusCode).toBe(401);
  });

  test('Invalid UUID rejected', async () => {
    const res = await request(app)
      .get('/api/v1/records/invalid-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  });

});


afterAll(async () => {
  await prisma.$disconnect();
});