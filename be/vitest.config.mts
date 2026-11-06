import path from 'path';

const config = {
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['dotenv/config'],
    isolate: true,
    env: {
      NODE_ENV: 'test',
      DOTENV_CONFIG_PATH: 'config/.env.test',
    },
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
};

export default config;
