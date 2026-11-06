import 'dotenv/config';

import * as RoleRepo from '../src/repos/RoleRepo';

async function main() {
  await RoleRepo.seedDefaults();
  console.log('Roles seeded: admin, user');
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
