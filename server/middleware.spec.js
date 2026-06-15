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
      profiles: [
        {
          userId: 'user_1',
          displayName: 'Test User',
          bio: 'Bio',
          avatarUrl: 'https://example.com/a.svg',
          memberSince: '2026-01-01',
          stats: { todosCompleted: 0, loginCount: 1 },
        },
      ],
    },
  };
  const { auth, getCurrentUserProfile, rejectDuplicateUserEmail } =
    createApiMiddleware(db);

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

  it('getCurrentUserProfile rejects /users/me without Bearer token', async () => {
    const req = mockReq({ url: '/users/me' });
    const res = mockRes();
    const next = vi.fn();

    await getCurrentUserProfile(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it('getCurrentUserProfile returns profile for valid token', async () => {
    const req = mockReq({
      url: '/users/me',
      headers: { authorization: 'Bearer mockToken=user_1-1234567890' },
    });
    const res = mockRes();
    const next = vi.fn();

    await getCurrentUserProfile(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.displayName).toBe('Test User');
  });

  it('getCurrentUserProfile passes through other routes', async () => {
    const req = mockReq({ url: '/users?email=a@b.com' });
    const res = mockRes();
    const next = vi.fn();

    await getCurrentUserProfile(req, res, next);

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
