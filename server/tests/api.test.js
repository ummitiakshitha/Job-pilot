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

    // 16. Feature 4: Checklist endpoints
    const addChecklistRes = await request('POST', `/api/applications/${appId}/checklist`, { text: 'Practice dynamic programming' }, token1);
    assert('POST /api/applications/:id/checklist adds preparation task (201)', addChecklistRes.status === 201);
    const addedTaskId = addChecklistRes.data?.data?.checklist?.slice(-1)[0]?.id;

    const toggleTaskRes = await request('PATCH', `/api/applications/${appId}/checklist/${addedTaskId}`, { completed: true }, token1);
    assert('PATCH /api/applications/:id/checklist/:taskId marks task completed (200)', toggleTaskRes.status === 200);

    // 17. Feature 5: Follow-Up endpoints
    const followUpRes = await request('PATCH', `/api/applications/${appId}/follow-up`, { followUpDate: new Date().toISOString(), followUpCompleted: false }, token1);
    assert('PATCH /api/applications/:id/follow-up sets follow-up date (200)', followUpRes.status === 200);

    // 18. Feature 9: Favorites endpoints
    const favRes = await request('PATCH', `/api/applications/${appId}/favorite`, null, token1);
    assert('PATCH /api/applications/:id/favorite bookmarks application (200)', favRes.status === 200);

    // 19. DELETE /api/applications/:id by owner
    const deleteRes = await request('DELETE', `/api/applications/${appId}`, null, token1);
    assert('DELETE /api/applications/:id removes document for owner (200)', deleteRes.status === 200);

    // Confirm deletion
    const verifyDelete = await request('GET', `/api/applications/${appId}`, null, token1);
    assert('Subsequent GET for deleted application returns 404', verifyDelete.status === 404);

    // ================= NEW AI & PLACEMENT MODULE TESTS =================
    // 20. Module Two: JD Decoder
    const jdRes = await request('POST', '/api/job-descriptions/decode', {
      rawText: 'Looking for a Senior React Developer with 3+ years experience in Node.js, Express, MongoDB, TypeScript, and Docker. Responsibilities include designing scalable REST APIs and mentoring juniors.',
      title: 'Senior Full Stack Engineer',
      company: 'TechCorp Solutions',
    }, token1);
    assert('POST /api/job-descriptions/decode parses structured requirements (201)', jdRes.status === 201 && jdRes.data.data.extracted.requiredSkills.length > 0);
    const decodedJdId = jdRes.data?.data?._id;

    // 21. Module Three: Skills & Gap Analysis
    const addSkillRes = await request('POST', '/api/skills', {
      name: 'React',
      category: 'Frontend',
      proficiency: 'Advanced',
      confidenceScore: 5,
      status: 'Proficient',
    }, token1);
    assert('POST /api/skills adds skill to inventory (201)', addSkillRes.status === 201);

    const gapRes = await request('POST', '/api/skills/gap-analysis', {
      targetRole: 'Senior Full Stack Engineer',
      requiredSkills: ['React', 'Node.js', 'Docker', 'Kubernetes'],
    }, token1);
    assert('POST /api/skills/gap-analysis calculates mathematical coverage % (200)', gapRes.status === 200 && typeof gapRes.data.data.coveragePercentage === 'number');

    // 22. Module Four: Learning Plan
    const planRes = await request('POST', '/api/learning-plans/generate', {
      targetRole: 'Full Stack Engineer',
      missingSkills: ['Docker', 'Kubernetes'],
      dailyHours: 2,
    }, token1);
    assert('POST /api/learning-plans/generate builds structured roadmap (201)', planRes.status === 201 && planRes.data.data.modules.length > 0);
    const planId = planRes.data?.data?._id;
    const firstTaskId = planRes.data?.data?.modules[0]?.tasks[0]?._id;

    if (planId && firstTaskId) {
      const taskToggleRes = await request('PATCH', `/api/learning-plans/${planId}/tasks/${firstTaskId}`, {}, token1);
      assert('PATCH /api/learning-plans/:id/tasks/:taskId toggles milestone completion (200)', taskToggleRes.status === 200 && taskToggleRes.data.data.task.completed === true);
    }

    // 23. Module Five: AI Interview Coach
    const interviewRes = await request('POST', '/api/interviews/start', {
      targetRole: 'Full Stack Developer',
      interviewType: 'Technical',
      difficulty: 'Intermediate',
      questionCount: 2,
    }, token1);
    assert('POST /api/interviews/start initializes mock interview session (201)', interviewRes.status === 201 && interviewRes.data.data.questions.length === 2);
    const sessionId = interviewRes.data?.data?._id;

    if (sessionId) {
      const answerRes = await request('POST', `/api/interviews/${sessionId}/answer`, {
        questionIndex: 0,
        answerText: 'In Node.js, the event loop handles asynchronous operations using libuv. Microtasks run before macrotasks.',
        timeSpentSeconds: 45,
      }, token1);
      assert('POST /api/interviews/:id/answer evaluates response with rubric feedback (200)', answerRes.status === 200 && answerRes.data.data.evaluation.score > 0);

      const completeRes = await request('POST', `/api/interviews/${sessionId}/complete`, {}, token1);
      assert('POST /api/interviews/:id/complete finalizes session with summary (200)', completeRes.status === 200 && completeRes.data.data.status === 'Completed');
    }

    // 24. Module Six: STAR Answer Builder
    const starRes = await request('POST', '/api/star-answers', {
      title: 'Resolved Database Query Latency',
      competency: 'Problem Solving & Performance',
      situation: 'Our application was suffering from 4-second latency spikes during morning peak loads on user registration.',
      task: 'I was assigned to diagnose the root cause and optimize the MongoDB queries without breaking schema contracts.',
      action: 'I used MongoDB explain plans, created compound indexes on userId and createdAt, and cached common lookups in Redis.',
      result: 'Query response times dropped by 78%, and CPU utilization dropped from 85% to 32%, saving the team 4 hours of weekly debugging.',
      tags: ['MongoDB', 'Performance', 'Redis'],
    }, token1);
    assert('POST /api/star-answers creates structured narrative with clarity checks (201)', starRes.status === 201 && starRes.data.data.completenessScore >= 75);

    // 25. Module Seven: Practice Lab
    const practiceQRes = await request('GET', '/api/practice/questions?topic=All', null, token1);
    assert('GET /api/practice/questions retrieves curated question bank (200)', practiceQRes.status === 200 && practiceQRes.data.data.length > 0);

    const practiceAttRes = await request('POST', '/api/practice/attempt', {
      questionId: 'dsa-1',
      topic: 'Data Structures & Algorithms',
      difficulty: 'Easy',
      status: 'Solved',
      timeSpentSeconds: 120,
    }, token1);
    assert('POST /api/practice/attempt records user practice progress (200)', practiceAttRes.status === 200);

    // 26. Module Eight: Career Readiness Dashboard
    const readinessRes = await request('GET', '/api/career-readiness', null, token1);
    assert('GET /api/career-readiness computes composite score and recommended actions (200)', readinessRes.status === 200 && typeof readinessRes.data.data.compositeScore === 'number');

    // 27. Module Nine: Placement Rescue Mode
    const rescueRes = await request('POST', '/api/placement-rescue/plan', {}, token1);
    assert('POST /api/placement-rescue/plan handles interview state safely without false countdowns (200)', rescueRes.status === 200);

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
