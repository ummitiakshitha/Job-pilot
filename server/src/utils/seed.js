require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const JobApplication = require('../models/JobApplication');

const seedDemoData = async () => {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  try {
    const demoEmail = 'alex.pilot@jobpilot.io';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      const passwordHash = await User.hashPassword('Password123');
      demoUser = await User.create({
        name: 'Alex Hunter (Demo)',
        email: demoEmail,
        passwordHash,
      });
      console.log('[Seed] Created demo user: alex.pilot@jobpilot.io');
    } else {
      console.log('[Seed] Demo user already exists:', demoUser.email);
    }

    // Clean existing demo user's applications
    await JobApplication.deleteMany({ userId: demoUser._id });

    const now = new Date();
    const day = 86400000;

    const sampleApplications = [
      {
        userId: demoUser._id,
        company: 'Stripe',
        role: 'Senior Full Stack Engineer',
        jobLink: 'https://stripe.com/jobs/full-stack',
        salaryExpectation: 165000,
        applicationDate: new Date(now.getTime() - 14 * day),
        status: 'Offer',
        interviewDate: new Date(now.getTime() - 3 * day),
        notes: 'Passed system architecture and behavioral rounds. Competitive equity offer received!',
      },
      {
        userId: demoUser._id,
        company: 'Google',
        role: 'Software Engineer II (Cloud)',
        jobLink: 'https://careers.google.com/jobs/results/cloud-swe',
        salaryExpectation: 175000,
        applicationDate: new Date(now.getTime() - 10 * day),
        status: 'Interview',
        interviewDate: new Date(now.getTime() + 4 * day),
        notes: 'Round 2 Technical Interview scheduled on distributed systems and algorithms.',
      },
      {
        userId: demoUser._id,
        company: 'Meta',
        role: 'Frontend Systems Engineer',
        jobLink: 'https://metacareers.com/jobs/frontend',
        salaryExpectation: 160000,
        applicationDate: new Date(now.getTime() - 12 * day),
        status: 'Interview',
        interviewDate: new Date(now.getTime() + 7 * day),
        notes: 'Virtual onsite coding round. Focus on React DOM optimization and CSS architectures.',
      },
      {
        userId: demoUser._id,
        company: 'Netflix',
        role: 'UI Platform Engineer',
        jobLink: 'https://jobs.netflix.com/jobs/ui-platform',
        salaryExpectation: 170000,
        applicationDate: new Date(now.getTime() - 4 * day),
        status: 'Applied',
        notes: 'Application submitted via employee referral on LinkedIn.',
      },
      {
        userId: demoUser._id,
        company: 'Airbnb',
        role: 'Full Stack Product Engineer',
        jobLink: 'https://careers.airbnb.com/positions/product-swe',
        salaryExpectation: 155000,
        applicationDate: new Date(now.getTime() - 2 * day),
        status: 'Applied',
        notes: 'Submitted resume and portfolio highlighting React Three Fiber & MERN architectures.',
      },
      {
        userId: demoUser._id,
        company: 'Uber',
        role: 'Backend Services Engineer',
        jobLink: 'https://uber.com/careers/backend',
        salaryExpectation: 145000,
        applicationDate: new Date(now.getTime() - 22 * day),
        status: 'Rejected',
        notes: 'Position closed internally. Reapply in 6 months.',
      },
    ];

    await JobApplication.insertMany(sampleApplications);
    console.log(`[Seed] Seeded ${sampleApplications.length} realistic applications for demo user!`);
  } catch (error) {
    console.error('[Seed] Seeding error:', error.message);
  } finally {
    await disconnectDB();
    console.log('[Seed] Done.');
  }
};

if (require.main === module) {
  seedDemoData();
}

module.exports = seedDemoData;
