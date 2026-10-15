const { PracticeAttempt } = require('../models/PracticeLab');

/**
 * Curated Question Bank dataset
 */
const PRACTICE_QUESTIONS = [
  // DSA
  {
    id: 'dsa-1',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Easy',
    title: 'Two Sum Problem (Hash Map Pattern)',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    hint: 'Use a hash map to store each number and its index. For each element x, check if (target - x) is already in the map.',
    solutionExplanation: 'By maintaining an auxiliary Hash Map of visited values, lookup takes O(1) time on average. Total time complexity is O(N) and space complexity is O(N).',
  },
  {
    id: 'dsa-2',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    title: 'LRU Cache Design (Doubly Linked List + Hash Map)',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with get(key) and put(key, value) in O(1) average time.',
    hint: 'Combine a Doubly Linked List (for maintaining eviction order in O(1)) with a Hash Map (for direct key lookup in O(1)).',
    solutionExplanation: 'Head holds the most recently used node, while tail holds the least recently used node. On put/get, relocate the target node to the head.',
  },
  // DBMS & SQL
  {
    id: 'dbms-1',
    topic: 'DBMS & SQL',
    difficulty: 'Easy',
    title: 'ACID Properties in Relational Databases',
    description: 'Explain the four ACID properties in database management systems and provide an example of how a bank transfer transaction adheres to them.',
    hint: 'Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent transactions don’t clash), Durability (committed changes persist).',
    solutionExplanation: 'In a bank transfer of $100 from Account A to B: Atomicity ensures both debit and credit occur or neither does; Durability ensures money is not lost if the server loses power right after commit.',
  },
  {
    id: 'dbms-2',
    topic: 'DBMS & SQL',
    difficulty: 'Medium',
    title: 'SQL Indexing Mechanisms (B-Tree vs Hash Index)',
    description: 'Compare B-Tree indexes and Hash indexes. Why is B-Tree the default choice for most relational databases like PostgreSQL and MySQL?',
    hint: 'Consider range queries (e.g. WHERE age BETWEEN 20 AND 30) versus exact equality searches (WHERE id = 5).',
    solutionExplanation: 'Hash indexes only support O(1) exact equality lookups (=, !=). B-Tree indexes maintain sorted keys, supporting both equality and range scans (<, >, BETWEEN, ORDER BY) in O(log N).',
  },
  // Operating Systems
  {
    id: 'os-1',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    title: 'Process vs Thread and Context Switching Overhead',
    description: 'Differentiate between a process and a thread in terms of memory space, creation cost, and context switching overhead.',
    hint: 'Processes have isolated Virtual Address Spaces. Threads within the same process share code, data, and heap, but have independent stacks.',
    solutionExplanation: 'Process switching requires invalidating CPU TLB (Translation Lookaside Buffer) caches and reloading page tables, incurring heavy latency. Thread switching only saves registers, program counter, and stack pointer without changing the page table.',
  },
  // Computer Networks
  {
    id: 'cn-1',
    topic: 'Computer Networks',
    difficulty: 'Easy',
    title: 'TCP 3-Way Handshake and Connection Teardown',
    description: 'Explain the exact message sequence of the TCP 3-way handshake during connection establishment and the 4-way handshake during termination.',
    hint: 'Establishment: SYN -> SYN-ACK -> ACK. Termination: FIN -> ACK -> FIN -> ACK.',
    solutionExplanation: 'The 3-way handshake synchronizes initial sequence numbers (ISN) for reliable ordered packet delivery. The TIME_WAIT state at termination ensures delayed packets in transit do not corrupt subsequent new connections.',
  },
  // OOP
  {
    id: 'oop-1',
    topic: 'Object-Oriented Programming',
    difficulty: 'Easy',
    title: 'The 4 Pillars of OOP and Real-World Examples',
    description: 'Define Encapsulation, Abstraction, Inheritance, and Polymorphism, and describe how they improve software maintainability.',
    hint: 'Encapsulation bundles data with methods; Abstraction hides implementation complexity; Inheritance promotes code reuse; Polymorphism enables multiple forms.',
    solutionExplanation: 'Polymorphism via interfaces or abstract classes allows decoupling client code from specific implementations, enabling modular extension without modifying existing tested code (Open/Closed Principle).',
  },
  // Full Stack & Web Dev
  {
    id: 'fs-1',
    topic: 'Full Stack & Web Dev',
    difficulty: 'Medium',
    title: 'JWT Authentication Workflow & Security Trade-offs',
    description: 'Explain how JSON Web Tokens work in stateless authentication, where tokens should be stored in the browser, and how CSRF / XSS risks are mitigated.',
    hint: 'Header.Payload.Signature. Storing in localStorage exposes tokens to XSS; storing in httpOnly, Secure SameSite cookies prevents XSS extraction.',
    solutionExplanation: 'Server verifies signature with its secret without querying the database for session state. Using short-lived access tokens paired with rotating refresh tokens provides tight security control.',
  },
  // JavaScript & React
  {
    id: 'js-1',
    topic: 'JavaScript & React',
    difficulty: 'Medium',
    title: 'Closures and Execution Context in JavaScript',
    description: 'What is a closure in JavaScript? Provide an example of how closures enable data privacy or memoization.',
    hint: 'A closure is the combination of a function bundled together with references to its lexical environment.',
    solutionExplanation: 'When an outer function returns an inner function, the inner function retains access to the outer function’s scope variables even after the outer function has completed execution.',
  },
  // System Design
  {
    id: 'sd-1',
    topic: 'System Design',
    difficulty: 'Hard',
    title: 'Designing a Scalable URL Shortener (e.g. TinyURL)',
    description: 'Design a high-volume URL shortening service. Estimate throughput, storage requirements, URL encoding strategy (Base62), and caching architecture.',
    hint: 'Convert a unique 64-bit integer ID into Base62 (a-z, A-Z, 0-9). 7 characters can represent 62^7 (~3.5 trillion) unique URLs.',
    solutionExplanation: 'Architecture includes API Gateway -> Web Servers -> Cache (Redis for 80/20 read rule) -> Database (NoSQL or sharded relational with unique auto-incrementing key generator or Snowflake IDs).',
  },
];

/**
 * @desc    Get questions filtered by topic, difficulty, or search
 * @route   GET /api/practice/questions
 * @access  Private
 */
const getQuestions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { topic, difficulty, status } = req.query;

    // Get user's attempts
    const attempts = await PracticeAttempt.find({ userId });
    const attemptMap = new Map();
    attempts.forEach((a) => attemptMap.set(a.questionId, a));

    let filtered = PRACTICE_QUESTIONS;
    if (topic && topic !== 'All') {
      filtered = filtered.filter((q) => q.topic.toLowerCase() === topic.toLowerCase());
    }
    if (difficulty && difficulty !== 'All') {
      filtered = filtered.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    const questionsWithStatus = filtered.map((q) => {
      const userAtt = attemptMap.get(q.id);
      return {
        ...q,
        userStatus: userAtt ? userAtt.status : 'Unattempted',
        userNotes: userAtt ? userAtt.userNotes : '',
        timeSpentSeconds: userAtt ? userAtt.timeSpentSeconds : 0,
        selfRating: userAtt ? userAtt.selfRating : 0,
      };
    });

    let finalQuestions = questionsWithStatus;
    if (status && status !== 'All') {
      finalQuestions = questionsWithStatus.filter((q) => q.userStatus.toLowerCase() === status.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      data: finalQuestions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record or update an attempt on a question
 * @route   POST /api/practice/attempt
 * @access  Private
 */
const recordAttempt = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { questionId, topic, difficulty, status, userNotes, timeSpentSeconds, selfRating } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required.',
      });
    }

    const attempt = await PracticeAttempt.findOneAndUpdate(
      { userId, questionId },
      {
        $set: {
          topic: topic || 'Data Structures & Algorithms',
          difficulty: difficulty || 'Medium',
          status: status || 'Solved',
          userNotes: userNotes || '',
          timeSpentSeconds: timeSpentSeconds || 0,
          selfRating: selfRating || 3,
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Attempt updated successfully',
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user practice progress metrics
 * @route   GET /api/practice/stats
 * @access  Private
 */
const getPracticeStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const attempts = await PracticeAttempt.find({ userId });

    const totalQuestions = PRACTICE_QUESTIONS.length;
    const solvedCount = attempts.filter((a) => a.status === 'Solved').length;
    const bookmarkedCount = attempts.filter((a) => a.status === 'Bookmarked').length;
    const attemptedCount = attempts.length;

    // Progress percentage
    const progressPercent = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalQuestions,
        solvedCount,
        bookmarkedCount,
        attemptedCount,
        progressPercent,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  recordAttempt,
  getPracticeStats,
};
