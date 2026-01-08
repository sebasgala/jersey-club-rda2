import requireAuth from './server/middleware/requireAuth.js';
import requireAdmin from './server/middleware/requireAdmin.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'testsecret';

const testCases = [
  {
    description: '1) Request sin Authorization',
    req: { headers: {} },
    middleware: requireAuth,
  },
  {
    description: '2) Request con Bearer token inválido',
    req: { headers: { authorization: 'Bearer invalidtoken' } },
    middleware: requireAuth,
  },
  {
    description: '3) Request con token válido rol="user" a ruta admin',
    req: {
      headers: { authorization: `Bearer ${jwt.sign({ id: 1, rol: 'user' }, JWT_SECRET)}` },
      user: { id: 1, rol: 'user' },
    },
    middleware: requireAdmin,
  },
  {
    description: '4) Request con token válido rol="admin"',
    req: {
      headers: { authorization: `Bearer ${jwt.sign({ id: 1, rol: 'admin' }, JWT_SECRET)}` },
      user: { id: 1, rol: 'admin' },
    },
    middleware: requireAdmin,
  },
];

testCases.forEach(({ description, req, middleware }) => {
  const res = {};
  const next = (err) => {
    if (err) {
      console.error(`${description}:`, err.message, err.status);
    } else {
      console.log(`${description}: Success`);
    }
  };
  console.log(`Running ${description}`);
  middleware(req, res, next);
});