import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import EnvVars from './src/common/constants/env';
export default defineConfig({
  // `drizzle/` is legacy history and cannot replay on an empty database
  // because it predates the initial schema. Runtime migrations start from the
  // generated production baseline in `migrations/`.
  out: './migrations',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: EnvVars.DatabaseUrl,
  },
});
