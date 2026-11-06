import cliProgress from 'cli-progress';

export type DownloadProgressBar = {
  stop: () => void;
  update: (doneBytes: number) => void;
};

function bytesToMb(bytes: number): number {
  return Math.max(0, bytes) / (1024 * 1024);
}

function formatSpeed(doneBytes: number, startedAt: number): string {
  const elapsedSec = Math.max((Date.now() - startedAt) / 1000, 0.001);
  return `${(bytesToMb(doneBytes) / elapsedSec).toFixed(2)} MB/s`;
}

/**
 * Single-line download progress (cli-progress SingleBar).
 * Uses stderr; falls back to noTTY scheduled output when not a TTY.
 */
export function createDownloadProgressBar(
  label: string,
  totalBytes: number,
  initialBytes = 0,
): DownloadProgressBar {
  // Keep unit-test output quiet; resume/download logic is covered without UI asserts.
  if (process.env.NODE_ENV === 'test') {
    return { update() {}, stop() {} };
  }

  const startedAt = Date.now();
  const isTTY = Boolean(process.stderr.isTTY);
  const shortLabel =
    label.length > 48 ? `…${label.slice(-47)}` : label;

  const bar = new cliProgress.SingleBar(
    {
      format: `${shortLabel} |{bar}| {percentage}% || {value}/{total} MB || Speed: {speed}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
      clearOnComplete: true,
      stopOnComplete: true,
      fps: 5,
      stream: process.stderr,
      noTTYOutput: !isTTY,
      notTTYSchedule: 5000,
      autopadding: true,
    },
    cliProgress.Presets.shades_classic,
  );

  let stopped = false;
  bar.start(Number(bytesToMb(totalBytes).toFixed(1)), Number(bytesToMb(initialBytes).toFixed(1)), {
    speed: 'N/A',
  });

  return {
    update(doneBytes: number) {
      if (stopped) return;
      bar.update(Number(bytesToMb(doneBytes).toFixed(1)), {
        speed: formatSpeed(doneBytes, startedAt),
      });
    },
    stop() {
      if (stopped) return;
      stopped = true;
      bar.stop();
    },
  };
}
