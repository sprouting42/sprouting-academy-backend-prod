const customFormatPlugin = {
  rules: {
    'custom-format': parsed => {
      const { header } = parsed;

      // Pattern: <type>(<scope>): <description> (NO space between type and scope)
      const pattern =
        /^(build|ci|docs|feat|fix|perf|refactor|test)\([a-z-]+\):\s+.+/;

      if (!pattern.test(header)) {
        return [
          false,
          'Header must follow format: <type>(<scope>): <short summary>\n' +
            'Examples:\n' +
            '- feat(auth): add user authentication system\n' +
            '- fix(api): resolve memory leak in user service\n' +
            '- docs(readme): update installation instructions\n' +
            '- test(utils): add unit tests for crypto utility',
        ];
      }

      return [true];
    },
  },
};

module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [customFormatPlugin],
  rules: {
    // Only use our custom format rule
    'custom-format': [2, 'always'],
    // Allow longer header length
    'header-max-length': [2, 'always', 150],
  },
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          refactor: {
            description:
              'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description:
              'Changes that affect the build system or external dependencies',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description: 'Changes to our CI configuration files and scripts',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
        },
      },
      scope: {
        description:
          'What is the scope of this change (e.g. component or file name)',
      },
      subject: {
        description:
          'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description:
          'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};
