const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const START_DATE = new Date('2025-11-05T00:00:00Z');
const END_DATE = new Date('2026-02-08T23:59:59Z');
const EMAIL = 'tpchkcrew@gmail.com';
const WORK_HOURS_START = 10;
const WORK_HOURS_END = 19;
const REPO_DIR = 'C:/Users/Mephistopheles/Documents/ProjectBag/Deep-Understanding-Validator';

const COMMIT_MESSAGES = {
  init: [
    'Initial project setup',
    'Add basic configuration files',
    'Configure ESLint and Prettier',
    'Setup project structure',
    'Add Next.js scaffolding',
    'Configure Tailwind CSS',
    'Add environment variables example'
  ],
  core: [
    'Add core utility functions',
    'Implement database connection',
    'Setup Supabase client',
    'Create base layout components',
    'Implement error boundaries',
    'Add rate limiting logic',
    'Setup API routing structure'
  ],
  features: [
    'Implement authentication flow',
    'Add user registration',
    'Create dashboard page',
    'Implement quiz interface',
    'Add question evaluation logic',
    'Implement follow-up question generation',
    'Add final verdict component',
    'Create sidebar navigation',
    'Add particle background component',
    'Implement code block rendering',
    'Add conversation turn UI',
    'Implement save turns action',
    'Add submit code action'
  ],
  fixes: [
    'Fix layout shift on load',
    'Update dependency versions',
    'Refactor auth middleware',
    'Fix state management bug in quiz',
    'Resolve hydration error',
    'Optimize particle background performance',
    'Fix mobile responsiveness in sidebar',
    'Update API route error handling',
    'Fix type definitions for database'
  ],
  docs: [
    'Update README with setup instructions',
    'Add inline documentation for core functions',
    'Create API documentation',
    'Add component storybook',
    'Update contributing guidelines'
  ],
  tests: [
    'Add basic unit tests for utils',
    'Write E2E tests for auth flow',
    'Add security tests',
    'Test rate limiting logic',
    'Add component tests for QuizInterface',
    'Test environment configuration'
  ]
};

// Map files/directories to change categories
const FILE_CATEGORIES = {
  init: [
    'package.json', 'README.md', 'duv-project/package.json', 'duv-project/.gitignore',
    'duv-project/next.config.ts', 'duv-project/tailwind.config.js', 'duv-project/tsconfig.json'
  ],
  core: [
    'duv-project/app/layout.tsx', 'duv-project/app/globals.css', 'duv-project/lib/utils.ts',
    'duv-project/lib/supabase/client.ts', 'duv-project/lib/supabase/server.ts', 'duv-project/app/error.tsx',
    'duv-project/app/global-error.tsx', 'duv-project/lib/rate-limit.ts'
  ],
  features: [
    'duv-project/app/(auth)', 'duv-project/actions/auth.ts', 'duv-project/app/dashboard',
    'duv-project/components/features/QuizInterface.tsx', 'duv-project/actions/evaluate-answer.ts',
    'duv-project/actions/generate-followup.ts', 'duv-project/components/ui/FinalVerdict.tsx',
    'duv-project/components/layout/Sidebar.tsx', 'duv-project/components/ui/ParticleBackground.tsx',
    'duv-project/components/ui/CodeBlock.tsx', 'duv-project/components/ui/ConversationTurn.tsx',
    'duv-project/actions/save-turns.ts', 'duv-project/actions/submit-code.ts', 'duv-project/app/api',
    'duv-project/app/result'
  ],
  fixes: [
    'duv-project/components', 'duv-project/lib', 'duv-project/app', 'duv-project/actions'
  ],
  docs: [
    'README.md', 'duv-project/README.md'
  ],
  tests: [
    'duv-project/__tests__'
  ]
};

// Helper: Get random int between min and max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Format date for Git
function formatGitDate(date) {
  return date.toISOString();
}

// Helper: Run command
function runCmd(cmd) {
  try {
    execSync(cmd, { cwd: REPO_DIR, stdio: 'pipe' });
  } catch (err) {
    // console.error(`Error running: ${cmd}`);
  }
}

// Determine sequence of days
const days = [];
let currentDate = new Date(START_DATE);
while (currentDate <= END_DATE) {
  days.push(new Date(currentDate));
  currentDate.setDate(currentDate.getDate() + 1);
}

// Ensure clean status
runCmd('git reset HEAD');

// Keep track of which categories we've processed somewhat
const categoryOrder = ['init', 'core', 'features', 'features', 'fixes', 'features', 'tests', 'fixes', 'docs'];
let currentCatIndex = 0;

console.log(`Starting to generate commits from ${START_DATE.toISOString()} to ${END_DATE.toISOString()}`);

let totalCommits = 0;

days.forEach((day, index) => {
  const dayOfWeek = day.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Determine number of commits for this day
  let numCommits = 0;
  if (isWeekend) {
    // 0-2 commits on weekends, but mostly 0
    if (Math.random() > 0.8) {
      numCommits = getRandomInt(1, 2);
    }
  } else {
    // 3-7 commits on weekdays, but maybe skip a day entirely
    if (Math.random() > 0.1) {
      numCommits = getRandomInt(3, 7);
    }
  }

  for (let i = 0; i < numCommits; i++) {
    // Generate a time during working hours
    let hour = getRandomInt(WORK_HOURS_START, WORK_HOURS_END);
    
    // Rare night commit
    if (Math.random() > 0.9) {
      hour = getRandomInt(20, 23);
    } else if (Math.random() > 0.9) {
      hour = getRandomInt(0, 3);
    }

    const minute = getRandomInt(0, 59);
    const second = getRandomInt(0, 59);

    const commitDate = new Date(day);
    commitDate.setHours(hour, minute, second);

    const dateStr = formatGitDate(commitDate);

    // Pick a category
    const category = categoryOrder[currentCatIndex % categoryOrder.length];
    
    // Move slightly through categories
    if (Math.random() > 0.7) {
      currentCatIndex++;
    }

    // Pick files for this category
    const possibleFiles = FILE_CATEGORIES[category] || FILE_CATEGORIES['fixes'];
    const fileToStg = possibleFiles[getRandomInt(0, possibleFiles.length - 1)];

    // Pick a message
    const possibleMsgs = COMMIT_MESSAGES[category] || COMMIT_MESSAGES['fixes'];
    const message = possibleMsgs[getRandomInt(0, possibleMsgs.length - 1)];

    // Stage file
    runCmd(`git add "${fileToStg}"`);

    // Only commit if there are changes staged
    try {
      const status = execSync('git status --porcelain', { cwd: REPO_DIR }).toString();
      if (status.trim().length > 0) {
        runCmd(`git commit -m "${message}" --date="${dateStr}"`);
        // Override committer date using env vars for execSync
        execSync(`git commit --amend --no-edit --date="${dateStr}"`, {
            cwd: REPO_DIR,
            env: { ...process.env, GIT_COMMITTER_DATE: dateStr }
        });
        totalCommits++;
      } else {
        // If nothing was staged, try adding everything (fallback)
        runCmd(`git add .`);
        const status2 = execSync('git status --porcelain', { cwd: REPO_DIR }).toString();
        if (status2.trim().length > 0) {
            runCmd(`git commit -m "${message}" --date="${dateStr}"`);
            execSync(`git commit --amend --no-edit --date="${dateStr}"`, {
                cwd: REPO_DIR,
                env: { ...process.env, GIT_COMMITTER_DATE: dateStr }
            });
            totalCommits++;
        }
      }
    } catch (e) {
      // Ignore
    }
  }
});

console.log(`Finished generating ${totalCommits} commits.`);
