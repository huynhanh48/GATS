import { drizzle } from 'drizzle-orm/node-postgres';

import EnvVars from '@src/common/constants/env';

import { relations } from './relations';

export const db = drizzle(EnvVars.DatabaseUrl, { relations });

export default db;
