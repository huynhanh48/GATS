const dotenv = require('dotenv');

dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || './config/.env.development',
});

const backendPort = process.env.PORT || '3000';
const browserSyncPort = Number(process.env.BROWSER_SYNC_PORT || 3002);

module.exports = {
  proxy: `http://localhost:${backendPort}`,
  port: browserSyncPort,
  open: false,
  notify: false,
  reloadDelay: 300,
  files: ['src/views/**/*.html', 'src/public/**/*', 'src/**/*.ts'],
};
