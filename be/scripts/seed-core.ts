import 'dotenv/config';

import { ensureCoreSeed } from '../src/services/BootstrapService';

/**
 * Seed lõi khi dựng Docker (dev + prod), idempotent:
 * roles -> permissions -> tài khoản admin (ADMIN_DEFAULT_*) -> 6 nhóm khoá học chính.
 *
 * Dev:  DOTENV_CONFIG_PATH=./config/.env.development npm run db:seed:core
 * Prod: npm run db:seed:core   (biến môi trường do Compose truyền vào)
 */
async function main(): Promise<void> {
  await ensureCoreSeed();
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
