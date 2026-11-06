import 'dotenv/config';

import {
  getTranscodeJobId,
  getVideoQueue,
} from '../src/queues/video.queue';

const DEFAULT_VIDEO_ID = 'fd14d5a7-f969-4227-a207-5880ecfc169d';

async function main() {
  const videoId = process.argv[2] ?? DEFAULT_VIDEO_ID;
  const queue = getVideoQueue();
  const job = await queue.getJob(getTranscodeJobId(videoId));

  if (!job) {
    console.log('job       : missing');
    await queue.close();
    return;
  }

  console.log('jobId     :', job.id);
  console.log('name      :', job.name);
  console.log('state     :', await job.getState());
  console.log('attempts  :', `${job.attemptsMade}/${job.opts.attempts ?? 1}`);
  console.log('failed    :', job.failedReason ?? null);
  console.log('processed :', job.processedOn ? new Date(job.processedOn) : null);
  console.log('finished  :', job.finishedOn ? new Date(job.finishedOn) : null);
  console.log('data      :', JSON.stringify(job.data));

  await queue.close();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
