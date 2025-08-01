module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '@tauri-apps/api/(.*)': '<rootDir>/src/__mocks__/@tauri-apps/api/$1.js',
    '@tauri-apps/api': '<rootDir>/src/__mocks__/@tauri-apps/api/index.js',
  },
  transformIgnorePatterns: ['node_modules/(?!(@tauri-apps)/)'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],
};
