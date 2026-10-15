// Automated REST API Test Suite for JobPilot
require('dotenv').config();
const http = require('http');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');

let server;
let baseUrl;

// Simple HTTP request helper using standard Node.js http module
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- 🧪 STARTING JOBPILOT BACKEND REST API TEST SUITE ---');

  await connectDB();
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  const assert = (description, condition) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await request('GET', '/api/health');
    assert('GET /api/health returns 200 OK', healthRes.status === 200 && healthRes.data.success === true);

    // 2. Reject unauthenticated access
    const unauthRes = await request('GET', '/api/applications');
    assert('GET /api/applications rejects unauthenticated request (401)', unauthRes.status === 401);

    // 3. User Registration
    const testEmail1 = `pilot_${Date.now()}@jobpilot.io`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Alex Hunter',
      email: testEmail1,
      password: 'SecurePassword123',
    });
    assert('POST /api/auth/register creates user and returns token (201)', regRes.status === 201 && regRes.data.data.token);
    const token1 = regRes.data?.data?.token;

    // 4. Duplicate Registration Rejection
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'Alex Duplicate',
      email: testEmail1,
      password: 'SecurePassword123',
    });
    assert('POST /api/auth/register prevents duplicate email (409)', dupRes.status === 409);

    // 5. User Login
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail1,
      password: 'SecurePassword123',
    });
    assert('POST /api/auth/login succeeds with valid credentials (200)', loginRes.status === 200 && loginRes.data.data.token);

    // 6. Bad Password Login Rejection
    const badLogin = await request('POST', '/api/auth/login', {
      email: testEmail1,
      password: 'WrongPassword',
    });
    assert('POST /api/auth/login fails with invalid credentials (401)', badLogin.status === 401);

    // 7. GET /api/auth/me
    const meRes = await request('GET', '/api/auth/me', null, token1);
    assert('GET /api/auth/me retrieves current user profile (200)', meRes.status === 200 && meRes.data.data.email === testEmail1);

    // 8. Create Job Application
    const createRes = await request(
      'POST',
      '/api/applications',
      {
        company: 'Stripe',
        role: 'Full Stack Engineer',
        jobLink: 'https://stripe.com/jobs/12345',
        salaryExpectation: 145000,
        applicationDate: new Date().toISOString(),
        status: 'Applied',
        notes: 'Applied with customized resume emphasizing React & Node expertise.',
      },
      token1
    );
    assert('POST /api/applications creates application in MongoDB (201)', createRes.status === 201 && createRes.data.data.company === 'Stripe');
    const appId = createRes.data?.data?._id;

    // 9. Validation Failure Check
    const badAppRes = await request('POST', '/api/applications', { company: '' }, token1);
    assert('POST /api/applications rejects missing required fields (400)', badAppRes.status === 400 && badAppRes.data.errors.company);

    // 10. GET /api/applications
    const listRes = await request('GET', '/api/applications', null, token1);
    assert('GET /api/applications lists authenticated user applications (200)', listRes.status === 200 && listRes.data.data.length >= 1);

    // 11. Search and Status Filtering
    const searchRes = await request('GET', '/api/applications?search=Stripe', null, token1);
    assert('GET /api/applications?search=Stripe filters correctly (200)', searchRes.status === 200 && searchRes.data.data[0].company === 'Stripe');

    // 12. PATCH /api/applications/:id/status
    const patchRes = await request(
      'PATCH',
      `/api/applications/${appId}/status`,
      { status: 'Interview' },
      token1
    );
    assert('PATCH /api/applications/:id/status changes status to Interview (200)', patchRes.status === 200 && patchRes.data.data.status === 'Interview');

    // 13. PUT /api/applications/:id full update
    const putRes = await request(
      'PUT',
      `/api/applications/${appId}`,
      {
        company: 'Stripe, Inc.',
        role: 'Senior Full Stack Engineer',
        jobLink: 'https://stripe.com/jobs/12345',
        salaryExpectation: 160000,
        applicationDate: new Date().toISOString(),
        status: 'Interview',
        interviewDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        notes: 'Round 1 technical phone interview scheduled!',
      },
      token1
    );
    assert('PUT /api/applications/:id updates application details (200)', putRes.status === 200 && putRes.data.data.salaryExpectation === 160000);

    // 14. GET /api/applications/stats
    const statsRes = await request('GET', '/api/applications/stats', null, token1);
    assert('GET /api/applications/stats computes aggregation metrics (200)', statsRes.status === 200 && statsRes.data.data.interview === 1 && statsRes.data.data.total === 1);

    // 15. User Data Isolation Test: User 2 cannot access or delete User 1's record
    const user2Email = `pilot_user2_${Date.now()}@jobpilot.io`;
    const regUser2 = await request('POST', '/api/auth/register', {
      name: 'Jordan Rivera',
      email: user2Email,
      password: 'User2Password123',
    });
    const token2 = regUser2.data?.data?.token;

    const user2AccessRes = await request('GET', `/api/applications/${appId}`, null, token2);
    assert('User 2 cannot access User 1 application (404/Isolated)', user2AccessRes.status === 404);

    const user2DeleteRes = await request('DELETE', `/api/applications/${appId}`, null, token2);
    assert('User 2 cannot delete User 1 application (404/Isolated)', user2DeleteRes.status === 404);

    // 16. DELETE /api/applications/:id by owner
    const deleteRes = await request('DELETE', `/api/applications/${appId}`, null, token1);
    assert('DELETE /api/applications/:id removes document for owner (200)', deleteRes.status === 200);

    // Confirm deletion
    const verifyDelete = await request('GET', `/api/applications/${appId}`, null, token1);
    assert('Subsequent GET for deleted application returns 404', verifyDelete.status === 404);

  } catch (err) {
    console.error('Fatal test execution error:', err);
    failed++;
  } finally {
    server.close();
    await disconnectDB();
  }

  console.log(`\n================ TEST SUMMARY ================`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failed}`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
