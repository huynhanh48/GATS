import 'dotenv/config';

import { inArray } from 'drizzle-orm';

import db from '../src/db';
import { RESOURCE_TYPES } from '../src/db/schema/constants';
import { permissionsTable } from '../src/db/schema/permission';
import { seedPermissions } from '../src/services/PermissionSeedService';

async function main() {
  await seedPermissions();

  const seeded = await db
    .select({ name: permissionsTable.name })
    .from(permissionsTable)
    .where(
      inArray(permissionsTable.resourceType, [
        RESOURCE_TYPES.COURSE,
        RESOURCE_TYPES.POST,
      ]),
    );

  console.log(
    `Permissions seeded (${seeded.length} total for course + post); admin has full access on both`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
