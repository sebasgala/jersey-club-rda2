import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5001/api/auth';
const JWT_SECRET = 'testsecret';

const testCases = [
  {
    description: '1) POST /api/auth/register con email nuevo',
    endpoint: '/register',
    method: 'POST',
    body: { nombre: 'Test User', email: 'test@example.com', password: 'password123' },
    expectedStatus: 201,
  },
  {
    description: '2) POST /api/auth/register con email repetido',
    endpoint: '/register',
    method: 'POST',
    body: { nombre: 'Test User', email: 'test@example.com', password: 'password123' },
    expectedStatus: 409,
  },
  {
    description: '3) POST /api/auth/login con credenciales válidas',
    endpoint: '/login',
    method: 'POST',
    body: { email: 'test@example.com', password: 'password123' },
    expectedStatus: 200,
  },
  {
    description: '4) POST /api/auth/login inválido',
    endpoint: '/login',
    method: 'POST',
    body: { email: 'test@example.com', password: 'wrongpassword' },
    expectedStatus: 401,
  },
];

const runTests = async () => {
  for (const testCase of testCases) {
    const { description, endpoint, method, body, expectedStatus } = testCase;
    console.log(`Running: ${description}`);

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log('Response:', result);

      if (response.status === expectedStatus) {
        console.log(`${description}: Passed`);
      } else {
        console.error(`${description}: Failed (Expected ${expectedStatus}, got ${response.status})`);
      }
    } catch (error) {
      console.error(`${description}: Error`, error);
    }
  }
};

runTests();