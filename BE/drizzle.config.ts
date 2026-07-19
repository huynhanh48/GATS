import 'dotenv/config';
import { defineConfig } from 'node_modules/drizzle-kit';
import EnvVars from './src/common/constants/env';
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: EnvVars.DatabaseUrl,
  },
});
