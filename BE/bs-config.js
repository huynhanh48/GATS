const dotenv = require('dotenv');

dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || './config/.env.development',
});

const backendPort = process.env.PORT || '3000';
// Tránh trùng với admin (3001) và fe (3002).
const browserSyncPort = Number(process.env.BROWSER_SYNC_PORT || 3010);
const browserSyncUiPort = Number(process.env.BROWSER_SYNC_UI_PORT || 3011);

module.exports = {
  proxy: `http://localhost:${backendPort}`,
  port: browserSyncPort,
  ui: { port: browserSyncUiPort },
  open: false,
  notify: false,
  reloadDelay: 300,
  files: ['src/views/**/*.html', 'src/public/**/*', 'src/**/*.ts'],
};
