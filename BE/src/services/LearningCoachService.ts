import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  buildMinioPublicUrl,
  uploadBuffer,
} from '@src/libs/minio-storage';
import LearningHistoryService, {
  type CourseExerciseHistory,
} from '@src/services/LearningHistoryService';
import {
  chatWithViava,
  getViavaBaseUrl,
  resolveViavaDomainFromCourseId,
} from '@src/services/viava/ViavaClient';

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

function extractAiTipsFromAnswer(answer: string): string {
  return ['## Gợi ý cải thiện (AI)', answer.trim()].join('\n');
}

async function callViavaCoach(
  markdownHistory: string,
  domain: string,
): Promise<string | null> {
  if (!getViavaBaseUrl()) return null;

  const prompt = [
    'Bạn là cố vấn học tập. Dựa trên lịch sử làm bài dưới đây, hãy đưa đánh giá và gợi ý cải thiện bằng tiếng Việt.',
    'Tập trung: điểm yếu, chủ đề cần ôn, thứ tự làm lại bài, thói quen học.',
    'Trả lời dạng markdown ngắn gọn, có bullet points cụ thể.',
    '',
    markdownHistory,
  ].join('\n');

  const result = await chatWithViava({
    query: prompt,
    domains: domain && domain !== 'general' ? [domain] : undefined,
  });
  if (!result?.answer) return null;
  return extractAiTipsFromAnswer(result.answer);
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

  const domain = await resolveViavaDomainFromCourseId(courseId);
  const baseMd = buildDeterministicMarkdown(history);
  const aiSection = await callViavaCoach(baseMd, domain);
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
      domain,
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
