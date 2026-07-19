import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import EnvVars from './src/common/constants/env';
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: EnvVars.DatabaseUrl,
  },
});
