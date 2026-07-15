import supertest, { Test } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { beforeAll } from 'vitest';

import MockOrm from '@src/repos/MockOrm';

/******************************************************************************
                                    Run
******************************************************************************/

let agent: TestAgent<Test>;

beforeAll(async () => {
  const { default: app } = await import('@src/server');
  agent = supertest.agent(app);
  await MockOrm.cleanDb();
});

/******************************************************************************
                                    Export
******************************************************************************/

export { agent };
