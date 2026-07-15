import 'dotenv/config';

import * as VideoRepo from '../src/repos/VideoRepo';

const DEFAULT_VIDEO_ID = '1ea90912-cae0-4808-b4d0-7d078b8ac6b1';

async function main() {
  const videoId = process.argv[2] ?? DEFAULT_VIDEO_ID;
  const video = await VideoRepo.findById(videoId);
  if (!video) {
    throw new Error(`Video not found: ${videoId}`);
  }
  console.log('videoId    :', video.id);
  console.log('status     :', video.status);
  console.log('hlsKey     :', video.hlsKey);
  console.log('size       :', video.size);
  console.log('errorMessage:', video.errorMessage);
  console.log('updatedAt  :', video.updatedAt);
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
