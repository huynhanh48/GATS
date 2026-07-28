import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars from '@src/common/constants/env';
import { RouteError } from '@src/common/utils/route-errors';
import {
  buildMinioPublicUrl,
  uploadBuffer,
} from '@src/libs/minio-storage';
import LearningHistoryService, {
  type CourseExerciseHistory,
} from '@src/services/LearningHistoryService';

const Errors = {
  EMPTY_HISTORY: 'Học viên chưa có lịch sử làm bài trong khóa này',
  GENERATION_FAILED: 'AI coach generation failed',
} as const;

function buildDeterministicMarkdown(history: CourseExerciseHistory): string {
  const lines: string[] = [];
  lines.push(`# Báo cáo học tập — ${history.course.title}`);
  lines.push('');
  lines.push(
    `**Học viên:** ${history.user.name ?? `#${history.user.id}`} (${history.user.email ?? '—'})`,
  );
  lines.push(`**Ngày xuất:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Tóm tắt');
  lines.push(`- Số lần làm quiz: ${history.summary.quizAttempts}`);
  lines.push(
    `- Số lần nộp bài tập: ${history.summary.assignmentSubmissions}`,
  );
  lines.push(
    `- Điểm quiz trung bình: ${history.summary.avgQuizPercentage ?? '—'}%`,
  );
  lines.push(
    `- Bài/lesson yếu: ${
      history.summary.weakLessons.length
        ? history.summary.weakLessons.join(', ')
        : 'Không ghi nhận'
    }`,
  );
  lines.push('');
  lines.push('## Lịch sử chi tiết');

  for (const item of history.items) {
    if (item.kind === 'quiz') {
      lines.push('');
      lines.push(
        `### [Quiz] ${item.lessonTitle ?? item.lessonId} — lần ${item.attemptNumber}`,
      );
      lines.push(
        `- Kết quả: ${item.percentage ?? '—'}% (${item.score ?? '—'}/${item.maxScore ?? '—'}) · ${item.passed ? 'Đạt' : 'Chưa đạt'} · ${item.status}`,
      );
      if (item.wrongQuestions.length > 0) {
        lines.push('- Câu sai:');
        for (const w of item.wrongQuestions) {
          lines.push(`  - ${w.question}`);
        }
      }
    } else {
      lines.push('');
      lines.push(
        `### [Assignment] ${item.lessonTitle ?? item.lessonId} — lần ${item.submissionNumber}`,
      );
      lines.push(
        `- Kết quả: ${item.percentage != null ? `${Math.round(item.percentage)}%` : '—'} (${item.score ?? '—'}/${item.maxScore}) · ${item.passed == null ? 'Chưa chấm' : item.passed ? 'Đạt' : 'Chưa đạt'} · ${item.status}`,
      );
      if (item.feedback) {
        lines.push(`- Feedback GV: ${item.feedback}`);
      }
    }
  }

  lines.push('');
  lines.push('## Gợi ý cải thiện (baseline hệ thống)');
  if (history.summary.weakLessons.length === 0) {
    lines.push(
      '- Học viên đang ổn định. Có thể tăng độ khó hoặc làm thêm bài nâng cao.',
    );
  } else {
    lines.push('- Ưu tiên ôn lại các lesson:');
    for (const lesson of history.summary.weakLessons) {
      lines.push(`  - ${lesson}`);
    }
    lines.push(
      '- Làm lại quiz các lesson yếu cho đến khi đạt passing score.',
    );
    lines.push(
      '- Rà soát các câu sai trong lịch sử và đọc lại phần giải thích/đáp án.',
    );
  }

  return lines.join('\n');
}

function extractAiTips(remote: unknown): string | null {
  if (!remote || typeof remote !== 'object') return null;
  const suite = (remote as { exercise_suite?: { exercises?: unknown[] } })
    .exercise_suite;
  const path = (remote as {
    learning_path?: {
      milestones?: Array<{
        title?: string;
        description?: string;
        learning_objectives?: string[];
      }>;
    };
  }).learning_path;

  const tips: string[] = [];

  for (const ex of suite?.exercises ?? []) {
    if (!ex || typeof ex !== 'object') continue;
    const rec = ex as Record<string, unknown>;
    const q =
      (typeof rec.question === 'string' && rec.question) ||
      (typeof rec.statement === 'string' && rec.statement) ||
      (typeof rec.problem === 'string' && rec.problem) ||
      (typeof rec.text === 'string' && rec.text);
    if (q) tips.push(`- ${q}`);
    if (Array.isArray(rec.keywords)) {
      for (const kw of rec.keywords) {
        if (typeof kw === 'string' && kw.trim()) tips.push(`- ${kw.trim()}`);
      }
    }
  }

  for (const m of path?.milestones ?? []) {
    if (m.title) tips.push(`- **${m.title}**: ${m.description ?? ''}`.trim());
    for (const obj of m.learning_objectives ?? []) {
      if (obj.trim()) tips.push(`- ${obj.trim()}`);
    }
  }

  if (tips.length === 0) return null;
  return ['## Gợi ý cải thiện (AI)', ...tips.slice(0, 40)].join('\n');
}

async function callViavaCoach(markdownHistory: string): Promise<string | null> {
  const base = EnvVars.ViavaCourseGenUrl?.replace(/\/$/, '');
  if (!base) return null;

  const path = EnvVars.ViavaCourseGenPath.startsWith('/')
    ? EnvVars.ViavaCourseGenPath
    : `/${EnvVars.ViavaCourseGenPath}`;

  const prompt = [
    'Bạn là cố vấn học tập. Dựa trên lịch sử làm bài dưới đây, hãy đưa đánh giá và gợi ý cải thiện bằng tiếng Việt.',
    'Tập trung: điểm yếu, chủ đề cần ôn, thứ tự làm lại bài, thói quen học.',
    'Trả kết quả dưới dạng bài tập short_answer / true_false / mcq với nội dung là các gợi ý cải thiện cụ thể.',
    '',
    markdownHistory,
  ].join('\n');

  const form = new FormData();
  form.append('text', prompt);
  form.append('language', 'vi');
  form.append('target_level', 'intermediate');
  form.append('max_lessons', '3');
  form.append('exercises_per_lesson', '5');
  form.append('exercise_types', 'short_answer,true_false,mcq');
  form.append('detail_level', 'detailed');
  form.append('include_coding', 'false');

  const headers: Record<string, string> = {};
  if (EnvVars.ViavaApiKey) {
    headers.Authorization = `Bearer ${EnvVars.ViavaApiKey}`;
  }

  try {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers,
      body: form,
      signal: AbortSignal.timeout(180_000),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return extractAiTips(payload);
  } catch {
    return null;
  }
}

async function generateCoachReport(
  courseId: string,
  userId: number,
  actorUserId: number,
) {
  const history = await LearningHistoryService.getCourseUserHistory(
    courseId,
    userId,
    actorUserId,
  );

  if (history.items.length === 0) {
    throw new RouteError(HttpStatusCodes.UNPROCESSABLE_ENTITY, Errors.EMPTY_HISTORY);
  }

  const baseMd = buildDeterministicMarkdown(history);
  const aiSection = await callViavaCoach(baseMd);
  const usedAi = Boolean(aiSection);
  const reportMarkdown = aiSection
    ? `${baseMd}\n\n${aiSection}\n`
    : `${baseMd}\n`;

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseKey = `learning-coach/${courseId}/${userId}/${stamp}`;
  const mdKey = `${baseKey}-report.md`;
  const jsonKey = `${baseKey}-history.json`;

  const historyJson = JSON.stringify(history, null, 2);

  await Promise.all([
    uploadBuffer(mdKey, reportMarkdown, 'text/markdown; charset=utf-8'),
    uploadBuffer(jsonKey, historyJson, 'application/json; charset=utf-8'),
  ]);

  return {
    data: {
      history,
      reportMarkdown,
      usedAi,
      files: {
        markdown: {
          storageKey: mdKey,
          url: buildMinioPublicUrl(mdKey),
          filename: `coach-${userId}-${stamp}.md`,
        },
        historyJson: {
          storageKey: jsonKey,
          url: buildMinioPublicUrl(jsonKey),
          filename: `history-${userId}-${stamp}.json`,
        },
      },
    },
    message: usedAi
      ? 'Đã tạo báo cáo AI coach và lưu file'
      : 'Đã tạo báo cáo (baseline) và lưu file — cấu hình VIAVA_COURSE_GEN_URL để bật AI',
  };
}

export default {
  Errors,
  generateCoachReport,
  buildDeterministicMarkdown,
};
