const pdfParse = require('pdf-parse');

/**
 * Curated dictionary of common technical keywords and competencies
 */
const TECH_SKILLS_DICTIONARY = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby',
  'React', 'Next.js', 'Vue', 'Angular', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux',
  'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI', 'GraphQL', 'REST API',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Prisma', 'Mongoose',
  'Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Linux',
  'Data Structures', 'Algorithms', 'System Design', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks',
  'Unit Testing', 'Jest', 'Mocha', 'Cypress', 'Microservices', 'Agile', 'Scrum'
];

/**
 * Extract clean text and section cues from a PDF buffer
 */
const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text || '';
    return {
      success: true,
      text: text.trim(),
      totalPages: data.numpages || 1,
      charCount: text.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to parse PDF file.',
      text: '',
    };
  }
};

/**
 * Identify standard resume sections present in text
 */
const detectResumeSections = (text) => {
  const sections = [];
  const lower = text.toLowerCase();

  if (/education|academic|degree|university|college|b\.?tech|b\.?e/i.test(lower)) {
    sections.push('Education');
  }
  if (/experience|employment|work history|internship|job/i.test(lower)) {
    sections.push('Experience');
  }
  if (/skills|technical skills|technologies|proficiencies/i.test(lower)) {
    sections.push('Skills');
  }
  if (/projects|personal projects|academic projects/i.test(lower)) {
    sections.push('Projects');
  }
  if (/certifications|certificates|licenses|achievements|awards/i.test(lower)) {
    sections.push('Certifications & Achievements');
  }

  return sections;
};

/**
 * Extract matched skills from arbitrary text against dictionary
 */
const extractSkillsFromText = (text) => {
  const matched = new Set();
  TECH_SKILLS_DICTIONARY.forEach((skill) => {
    // Regex boundary matching
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:\\b|[^a-zA-Z0-9])${escaped}(?:\\b|[^a-zA-Z0-9])`, 'i');
    if (regex.test(text)) {
      matched.add(skill);
    }
  });
  return Array.from(matched);
};

/**
 * Decode and parse a raw Job Description into structured parameters
 */
const decodeJobDescription = (jdText, roleTitle = '') => {
  const skillsFound = extractSkillsFromText(jdText);
  
  // Categorize required vs preferred
  const required = skillsFound.slice(0, Math.ceil(skillsFound.length * 0.7));
  const preferred = skillsFound.slice(Math.ceil(skillsFound.length * 0.7));

  // Extract experience mentions
  const expMatch = jdText.match(/(\d+\+?\s*(?:to\s*\d+)?\s*(?:years?|yrs?))/i);
  const experienceRequirements = expMatch ? `${expMatch[1]} of relevant experience` : 'Entry to Mid Level (0-2 years)';

  // Extract education mentions
  const eduMatch = jdText.match(/(bachelor'?s?|master'?s?|b\.?tech|b\.?e|computer science|degree|diploma)/i);
  const educationRequirements = eduMatch ? `Degree in ${eduMatch[1]} or related field` : "Bachelor's Degree in Computer Science or equivalent";

  // Technical concepts
  const technicalConcepts = [];
  if (/data structures|algorithms|dsa/i.test(jdText)) technicalConcepts.push('Data Structures & Algorithms');
  if (/system design|scalability|high throughput/i.test(jdText)) technicalConcepts.push('System Design & Architecture');
  if (/rest|api|graphql/i.test(jdText)) technicalConcepts.push('RESTful API Design');
  if (/database|sql|nosql/i.test(jdText)) technicalConcepts.push('Database Optimization & Indexing');
  if (/async|multithreading|concurrency/i.test(jdText)) technicalConcepts.push('Asynchronous Programming');

  // Responsibilities heuristics
  const lines = jdText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 25);
  const responsibilities = lines
    .filter(l => /^[•\-\*]|deliver|develop|build|design|collaborate|maintain|implement/i.test(l))
    .slice(0, 5)
    .map(l => l.replace(/^[•\-\*]\s*/, ''));

  return {
    jobTitle: roleTitle || (jdText.split('\n')[0].slice(0, 50)) || 'Software Engineer',
    requiredSkills: required.length > 0 ? required : ['JavaScript', 'React', 'Node.js', 'Git'],
    preferredSkills: preferred.length > 0 ? preferred : ['Docker', 'AWS', 'TypeScript'],
    technicalConcepts: technicalConcepts.length > 0 ? technicalConcepts : ['REST API Architecture', 'DSA', 'OOP'],
    toolsAndTechnologies: skillsFound.slice(0, 8),
    experienceRequirements,
    educationRequirements,
    responsibilities: responsibilities.length > 0 ? responsibilities : [
      'Design, develop, and maintain responsive full-stack applications.',
      'Collaborate with cross-functional teams to define and ship new features.',
      'Write clean, testable, and maintainable code adhering to industry standards.'
    ],
    keyKeywords: skillsFound,
  };
};

/**
 * Heuristic Resume Match & Analysis
 */
const analyzeResumeAgainstJD = (resumeText, jdText, targetRole) => {
  const resumeSkills = extractSkillsFromText(resumeText);
  const jdDecoded = decodeJobDescription(jdText, targetRole);
  const requiredSkills = jdDecoded.requiredSkills;

  // Matched and Missing
  const resumeSkillsLower = new Set(resumeSkills.map(s => s.toLowerCase()));
  const matchedSkills = requiredSkills.filter(s => resumeSkillsLower.has(s.toLowerCase()));
  const missingSkills = requiredSkills.filter(s => !resumeSkillsLower.has(s.toLowerCase()));

  // Coverage percentage
  const totalReq = requiredSkills.length;
  const keywordCoverage = totalReq > 0 ? Math.round((matchedSkills.length / totalReq) * 100) : 75;

  // Formatting & Completeness Audit
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasLinkedIn = /linkedin\.com/i.test(resumeText);
  const hasGitHub = /github\.com/i.test(resumeText);
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  // Sections
  const sectionsFound = detectResumeSections(resumeText);

  // Heuristic Score Calculation
  // 40% skills + 25% sections + 20% contact/formatting + 15% text depth
  let sectionScore = (sectionsFound.length / 5) * 25;
  let contactScore = (Number(hasEmail) + Number(hasPhone) + Number(hasLinkedIn || hasGitHub)) * (20 / 3);
  let depthScore = Math.min(15, (wordCount / 400) * 15);
  let skillsScore = (keywordCoverage / 100) * 40;

  const rawScore = Math.round(skillsScore + sectionScore + contactScore + depthScore);
  const matchScore = Math.min(96, Math.max(25, rawScore));

  // Bullet point improvement suggestions
  const bulletSuggestions = [
    {
      original: 'Worked on backend APIs using Express and Node.js for client apps.',
      improved: 'Architected and deployed 12+ RESTful APIs with Node.js and Express, reducing average endpoint latency by 28%.',
      rationale: 'Replaces passive verb "worked on" with active metric-driven delivery and measured performance gain.',
    },
    {
      original: 'Responsible for creating frontend components in React.',
      improved: 'Engineered 15+ reusable, mobile-responsive React components with Tailwind CSS, achieving 98% Lighthouse accessibility scores.',
      rationale: 'Adds concrete volume, styling stack clarity, and quality benchmark metrics.',
    },
    {
      original: 'Handled database queries and created schemas in MongoDB.',
      improved: 'Designed normalized Mongoose schemas and compound aggregation pipelines in MongoDB, accelerating query performance for 10,000+ records.',
      rationale: 'Demonstrates architectural maturity and production scalability techniques.',
    },
  ];

  // Prioritized Improvement Checklist
  const improvementChecklist = [];
  if (missingSkills.length > 0) {
    improvementChecklist.push({
      category: 'Core Competencies',
      suggestion: `Incorporate evidence of experience with missing required skills: ${missingSkills.slice(0, 3).join(', ')}.`,
      priority: 'High',
    });
  }
  if (!hasGitHub) {
    improvementChecklist.push({
      category: 'Portfolio Presence',
      suggestion: 'Include your active GitHub profile URL with pinned repositories demonstrating code cleanliness.',
      priority: 'High',
    });
  }
  if (!sectionsFound.includes('Projects')) {
    improvementChecklist.push({
      category: 'Project Evidence',
      suggestion: 'Dedicate a distinct "Projects" section highlighting full-stack architectures and live deployment URLs.',
      priority: 'High',
    });
  }
  improvementChecklist.push({
    category: 'Quantifiable Impact',
    suggestion: 'Enhance bullet points with the XYZ framework: Accomplished [X], as measured by [Y], by doing [Z].',
    priority: 'Medium',
  });
  improvementChecklist.push({
    category: 'ATS Cleanliness',
    suggestion: 'Keep document styling single-column with standard UTF-8 headers to ensure flawless recruiter parser extraction.',
    priority: 'Low',
  });

  return {
    matchScore,
    keywordCoverage,
    matchedSkills,
    missingSkills,
    sectionsFound,
    bulletSuggestions,
    improvementChecklist,
    formattingAudit: {
      hasEmail,
      hasPhone,
      hasLinkedIn,
      hasGitHub,
      wordCount,
      readingTimeMinutes,
    },
    calculationNotes: {
      formula: 'Match Score = 40% (Skill Coverage) + 25% (Sections) + 20% (Contact & Socials) + 15% (Length & Depth)',
      engine: 'Rule-Based NLP',
    },
  };
};

/**
 * Generate Structured Learning Plan
 */
const generateLearningPlan = (targetRole, missingSkills = [], dailyHours = 2) => {
  const skills = missingSkills.length > 0 ? missingSkills : ['Node.js', 'System Design', 'Docker', 'MongoDB'];

  const resourcesCatalog = {
    'JavaScript': { title: 'MDN JavaScript Guide & Modern ES6+', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    'React': { title: 'Official React Documentation & Patterns', url: 'https://react.dev/learn' },
    'Node.js': { title: 'Node.js Core Architecture & Streams Guide', url: 'https://nodejs.org/en/docs/guides' },
    'MongoDB': { title: 'MongoDB University Data Modeling Course', url: 'https://learn.mongodb.com' },
    'Docker': { title: 'Docker Official Getting Started Tutorial', url: 'https://docs.docker.com/get-started/' },
    'System Design': { title: 'System Design Primer (Open Source Architecture)', url: 'https://github.com/donnemartin/system-design-primer' },
    'Data Structures': { title: 'NeetCode Roadmap & DSA Patterns', url: 'https://neetcode.io/roadmap' },
    'REST API': { title: 'RESTful API Design Best Practices (HTTP Specs)', url: 'https://restfulapi.net' },
  };

  const modules = [
    {
      weekNumber: 1,
      title: 'Foundations & Architecture Review',
      goal: `Master foundational mechanics for ${skills.slice(0, 2).join(' & ')}`,
      milestones: ['Setup dev environment', 'Build proof-of-concept module', 'Complete code review self-test'],
      tasks: [
        {
          title: `Deep-dive core concepts of ${skills[0] || 'Technical Stack'}`,
          description: 'Review architectural principles, lifecycle methods, and memory management.',
          estimatedMinutes: 60,
          resourceTitle: resourcesCatalog[skills[0]]?.title || 'Comprehensive Stack Reference',
          resourceUrl: resourcesCatalog[skills[0]]?.url || 'https://developer.mozilla.org',
          completed: false,
          selfAssessmentQuestion: `Can you explain the concurrency model and performance trade-offs of ${skills[0] || 'your core stack'}?`,
        },
        {
          title: 'Implement hands-on practice sandbox',
          description: 'Create an isolated GitHub repository testing modular features with unit tests.',
          estimatedMinutes: 90,
          resourceTitle: 'GitHub Practical Templates',
          resourceUrl: 'https://github.com',
          completed: false,
          selfAssessmentQuestion: 'Are all edge cases properly guarded with error-handling boundaries?',
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Advanced Integration & Scalability',
      goal: `Address complex scenarios and integration patterns for ${skills.slice(2, 4).join(' & ') || 'System Architecture'}`,
      milestones: ['Implement caching/indexing', 'Containerize workflow', 'Deploy to staging testbed'],
      tasks: [
        {
          title: `Study production patterns for ${skills[1] || 'System Design'}`,
          description: 'Analyze horizontal scaling, database indexing strategies, and failover mechanisms.',
          estimatedMinutes: 75,
          resourceTitle: resourcesCatalog['System Design']?.title,
          resourceUrl: resourcesCatalog['System Design']?.url,
          completed: false,
          selfAssessmentQuestion: 'How would this design behave under a 10x spike in concurrent requests?',
        },
        {
          title: 'Refactor existing project with new learnings',
          description: 'Take one existing JobPilot application or past project and upgrade its implementation.',
          estimatedMinutes: 120,
          resourceTitle: 'Clean Code Best Practices',
          resourceUrl: 'https://github.com/ryanmcdermott/clean-code-javascript',
          completed: false,
          selfAssessmentQuestion: 'Does the refactored code adhere strictly to DRY and SOLID guidelines?',
        },
      ],
    },
    {
      weekNumber: 3,
      title: 'Interview Readiness & Mock Drills',
      goal: `Translate knowledge into crisp verbal explanations and live coding execution`,
      milestones: ['Conduct 3 timed mock interviews', 'Polish STAR stories', 'Final technical self-assessment'],
      tasks: [
        {
          title: 'Simulate high-pressure technical whiteboard interview',
          description: 'Practice explaining architecture tradeoffs verbally while drawing diagram components.',
          estimatedMinutes: 60,
          resourceTitle: 'Technical Interview Whiteboard Drills',
          resourceUrl: 'https://neetcode.io',
          completed: false,
          selfAssessmentQuestion: 'Did you clarify constraints and edge cases before presenting your solution?',
        },
        {
          title: 'Finalize STAR behavioral narratives',
          description: 'Align project experience with company values and conflict-resolution examples.',
          estimatedMinutes: 45,
          resourceTitle: 'STAR Behavioral Framework Guide',
          resourceUrl: 'https://www.thebalancemoney.com/what-is-the-star-interview-response-technique-2061629',
          completed: false,
          selfAssessmentQuestion: 'Did your result clearly specify measurable business or team impact?',
        },
      ],
    },
  ];

  return {
    title: `Placement Acceleration Roadmap: ${targetRole}`,
    targetRole,
    dailyHoursCommitment: dailyHours,
    targetedSkills: skills,
    modules,
    overallProgress: 0,
  };
};

/**
 * Curated Question Bank for Mock Interviews
 */
const QUESTION_BANK = {
  Technical: [
    {
      questionText: 'Can you explain the Event Loop in Node.js and how it manages asynchronous non-blocking I/O operations?',
      category: 'Technical',
      modelAnswer: 'Node.js is single-threaded using libuv for its event loop. The loop has phases: Timers (setTimeout/setInterval), Pending Callbacks, Poll (retrieves new I/O events), Check (setImmediate), and Close callbacks. Microtasks (process.nextTick and Promise callbacks) are executed between phases before the next phase begins.',
      keywords: ['event loop', 'libuv', 'microtask', 'non-blocking', 'single-threaded', 'poll', 'promise'],
      followUpPractice: 'What is the exact execution priority difference between process.nextTick() and setImmediate()?',
    },
    {
      questionText: 'How do you optimize React application rendering performance when dealing with large dynamic lists or frequent state changes?',
      category: 'Technical',
      modelAnswer: 'Optimization strategies include: 1) Using React.memo to prevent unnecessary component re-renders when props have not changed; 2) Memoizing callbacks with useCallback and expensive computations with useMemo; 3) Windowing/Virtualization (e.g. react-window) to render only visible DOM nodes; 4) Keeping state local to avoid top-level tree re-renders.',
      keywords: ['usememo', 'usecallback', 'react.memo', 'virtualization', 'rendering', 're-render', 'props'],
      followUpPractice: 'Why is using array index as a React list key harmful during reordering or deletion?',
    },
    {
      questionText: 'Explain database indexing in MongoDB or PostgreSQL. When does an index improve performance, and what are its trade-offs?',
      category: 'Technical',
      modelAnswer: 'Indexes create ordered B-tree data structures that allow database queries to search in O(log N) rather than doing an expensive full collection scan (O(N)). While indexes dramatically accelerate SELECT and query filter speeds, they consume disk space and add write overhead on INSERT, UPDATE, and DELETE operations since the B-tree must be rebalanced.',
      keywords: ['b-tree', 'index', 'collection scan', 'o(log n)', 'write overhead', 'performance', 'query'],
      followUpPractice: 'What is a compound index and how does index prefixing affect query matching?',
    },
  ],
  Behavioral: [
    {
      questionText: 'Tell me about a challenging technical hurdle you encountered during a project. How did you diagnose and overcome it?',
      category: 'Behavioral',
      modelAnswer: 'A strong STAR response clearly outlines the Situation (the project and bug), Task (the urgency and impact), Action (the systematic root-cause analysis, tooling used, and solution implemented), and Result (the concrete performance improvement, latency reduction, and lessons learned).',
      keywords: ['situation', 'task', 'action', 'result', 'root-cause', 'debugging', 'learned'],
      followUpPractice: 'What preventive measures or monitoring did you introduce to ensure the problem does not recur?',
    },
    {
      questionText: 'Describe a situation where you had a disagreement with a peer or teammate regarding a technical architecture choice. How did you reach alignment?',
      category: 'Behavioral',
      modelAnswer: 'Highlight active listening, objectifying decisions using data, benchmarks, or proof-of-concept tests rather than personal opinions, seeking compromise aligned with business requirements, and committing wholeheartedly to the agreed direction.',
      keywords: ['compromise', 'data', 'benchmark', 'proof of concept', 'teamwork', 'communication'],
      followUpPractice: 'How do you ensure constructive feedback is received positively by junior peers?',
    },
  ],
  HR: [
    {
      questionText: 'Why do you want to join our organization, and what makes your background an ideal match for this role?',
      category: 'HR & Situational',
      modelAnswer: 'Demonstrate specific knowledge of the company’s engineering culture, mission, and products. Connect your hands-on technical proficiencies and drive for continuous learning directly to their active roadmap goals.',
      keywords: ['culture', 'mission', 'alignment', 'growth', 'impact', 'skills'],
      followUpPractice: 'Where do you envision your technical leadership and career progression in the next 3 to 5 years?',
    },
  ],
};

/**
 * Generate Questions for a Mock Interview Session
 */
const generateInterviewQuestions = (type = 'Technical', difficulty = 'Intermediate', count = 3) => {
  let pool = [];
  if (type === 'Technical') pool = [...QUESTION_BANK.Technical];
  else if (type === 'Behavioral') pool = [...QUESTION_BANK.Behavioral];
  else if (type === 'HR') pool = [...QUESTION_BANK.HR];
  else pool = [...QUESTION_BANK.Technical, ...QUESTION_BANK.Behavioral, ...QUESTION_BANK.HR];

  // Shuffle and take count
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, pool.length));
};

/**
 * Evaluate User Answer Heuristically with Rubrics
 */
const evaluateAnswer = (questionText, userAnswer, category, modelAnswer, expectedKeywords = []) => {
  if (!userAnswer || userAnswer.trim().length < 15) {
    return {
      score: 25,
      strengths: ['Attempted the response.'],
      improvements: ['Answer was too brief. Expand with concrete technical explanations and examples.'],
      missingConcepts: expectedKeywords.slice(0, 3),
      modelAnswer: modelAnswer || 'A structured, thorough answer covering core concepts.',
      followUpPractice: 'Practice articulating the core mechanism aloud for 2 minutes before typing.',
    };
  }

  const lowerAnswer = userAnswer.toLowerCase();
  const wordCount = userAnswer.split(/\s+/).filter(Boolean).length;

  // Check keyword matches
  const matchedKeywords = expectedKeywords.filter(k => lowerAnswer.includes(k.toLowerCase()));
  const missingConcepts = expectedKeywords.filter(k => !lowerAnswer.includes(k.toLowerCase()));

  // Score components
  let lengthScore = Math.min(30, (wordCount / 60) * 30);
  let keywordScore = expectedKeywords.length > 0
    ? (matchedKeywords.length / expectedKeywords.length) * 45
    : 35;
  let structureScore = 20;

  // For behavioral, check STAR indicators
  if (category === 'Behavioral') {
    const hasSituation = /situation|context|project|when|at my/i.test(lowerAnswer);
    const hasAction = /action|i implemented|i built|i decided|i analyzed/i.test(lowerAnswer);
    const hasResult = /result|outcome|improved|reduced|learned|as a result/i.test(lowerAnswer);
    structureScore = (Number(hasSituation) + Number(hasAction) + Number(hasResult)) * 8;
  }

  const score = Math.min(95, Math.max(30, Math.round(lengthScore + keywordScore + structureScore)));

  const strengths = [];
  if (wordCount >= 40) strengths.push('Good detail depth and structured narrative.');
  if (matchedKeywords.length >= 2) strengths.push(`Effectively integrated relevant domain concepts: ${matchedKeywords.slice(0, 2).join(', ')}.`);
  if (strengths.length === 0) strengths.push('Directly addressed the prompt without unnecessary diversion.');

  const improvements = [];
  if (missingConcepts.length > 0) {
    improvements.push(`Deepen the explanation by addressing: ${missingConcepts.slice(0, 3).join(', ')}.`);
  }
  if (wordCount < 45) {
    improvements.push('Consider elaborating on real-world constraints or lessons learned to showcase practical depth.');
  }
  if (improvements.length === 0) {
    improvements.push('Maintain this concise, structured communication style during live rounds.');
  }

  return {
    score,
    strengths,
    improvements,
    missingConcepts,
    modelAnswer,
    followUpPractice: 'How would you summarize this answer in a 30-second elevator pitch to a lead engineer?',
  };
};

module.exports = {
  extractTextFromPDF,
  detectResumeSections,
  extractSkillsFromText,
  decodeJobDescription,
  analyzeResumeAgainstJD,
  generateLearningPlan,
  generateInterviewQuestions,
  evaluateAnswer,
};
