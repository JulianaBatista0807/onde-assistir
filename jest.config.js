const reporters = ['default'];

if (process.env.CI) {
  reporters.push([
    'jest-junit',
    {
      outputDirectory: 'reports',
      outputName: 'junit.xml',
      suiteName: 'onde-assistir',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
    },
  ]);
}

module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  coverageDirectory: 'coverage',
  reporters,
};
