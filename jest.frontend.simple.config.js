module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/unit/frontend.test.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react|react-dom|react-router-dom|@testing-library)/)'
  ],
  // Use experimental ESM support
  experimental: {
    esm: true
  }
};