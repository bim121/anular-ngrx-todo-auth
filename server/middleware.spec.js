import { describe, expect, it, vi } from 'vitest';
import { createApiMiddleware } from './middleware.js';

function mockReq(overrides = {}) {
  return {
    method: 'GET',
    url: '/todos',
    headers: {},
    body: {},
    ...overrides,
  };
}

function mockRes() {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

describe('createApiMiddleware', () => {
  const db = {
    read: vi.fn(async () => {}),
    data: {
      users: [{ id: '1', email: 'taken@example.com', password: 'x' }],
    },
  };
  const { auth, rejectDuplicateUserEmail } = createApiMiddleware(db);

  it('auth allows GET /users without Authorization', () => {
    const req = mockReq({ url: '/users?email=a@b.com' });
    const res = mockRes();
    const next = vi.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  it('auth rejects /todos without Bearer token', () => {
    const req = mockReq({ url: '/todos?userId=1' });
    const res = mockRes();
    const next = vi.fn();

    auth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Authorization');
  });

  it('auth allows /todos with Bearer token', () => {
    const req = mockReq({
      url: '/todos',
      headers: { authorization: 'Bearer mockToken=abc' },
    });
    const res = mockRes();
    const next = vi.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rejectDuplicateUserEmail returns 409 for existing email', async () => {
    const req = mockReq({
      method: 'POST',
      url: '/users',
      body: { email: 'Taken@Example.com', password: 'pw', name: 'X' },
    });
    const res = mockRes();
    const next = vi.fn();

    await rejectDuplicateUserEmail(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('Email already exists');
  });

  it('rejectDuplicateUserEmail passes for new email', async () => {
    const req = mockReq({
      method: 'POST',
      url: '/users',
      body: { email: 'new@example.com', password: 'pw', name: 'X' },
    });
    const res = mockRes();
    const next = vi.fn();

    await rejectDuplicateUserEmail(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
