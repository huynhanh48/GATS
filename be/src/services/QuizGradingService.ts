import type { QuizQuestion } from '@src/db/schema/quiz-question';
import type { QuizQuestionAnswer } from '@src/db/schema/quiz-question-answer';
import { normalizeFillBlankAnswer } from '@src/models/Quiz.model';

function countFillBlanks(questionText: string): number {
  // Treat a numbered marker such as `___1___` as one blank, not two.
  return (questionText.match(/_{3,}\s*\d+\s*_{3,}|_{3,}/g) ?? []).length;
}

function splitFillBlankParts(text: string): string[] {
  const value = text.trim();
  if (!value) return [];
  if (value.includes('|')) {
    return value.split('|').map((part) => part.trim());
  }
  if (value.includes(';')) {
    return value.split(';').map((part) => part.trim());
  }
  return [value];
}

export function gradeSingleChoiceQuestion(
  question: QuizQuestion,
  answers: QuizQuestionAnswer[],
  selectedAnswerId: string,
): { score: number; isCorrect: boolean } {
  const selected = answers.find((answer) => answer.id === selectedAnswerId);
  const isCorrect = Boolean(selected?.isCorrect);
  return { score: isCorrect ? question.points : 0, isCorrect };
}

export function gradeFillBlankQuestion(
  question: QuizQuestion,
  textAnswer: string | null | undefined,
  acceptedAnswers: QuizQuestionAnswer[],
): { score: number; isCorrect: boolean } {
  if (!textAnswer?.trim()) {
    return { score: 0, isCorrect: false };
  }

  const correctAnswers = acceptedAnswers
    .filter((answer) => answer.isCorrect)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const blankCount = countFillBlanks(question.question);

  // Multi-blank: grade each blank against ordered accepted answers.
  if (blankCount > 1 && correctAnswers.length >= blankCount) {
    const parts = splitFillBlankParts(textAnswer);
    if (parts.length !== blankCount || parts.some((part) => !part)) {
      return { score: 0, isCorrect: false };
    }

    const isCorrect = parts.every((part, index) => {
      const normalized = normalizeFillBlankAnswer(
        part,
        question.caseSensitive,
      );
      const accepted = normalizeFillBlankAnswer(
        correctAnswers[index].answer,
        question.caseSensitive,
      );
      return normalized === accepted;
    });

    return { score: isCorrect ? question.points : 0, isCorrect };
  }

  const normalized = normalizeFillBlankAnswer(
    textAnswer,
    question.caseSensitive,
  );
  const isCorrect = correctAnswers.some((answer) => {
    const accepted = normalizeFillBlankAnswer(
      answer.answer,
      question.caseSensitive,
    );
    return normalized === accepted;
  });

  return { score: isCorrect ? question.points : 0, isCorrect };
}

export function gradeTrueFalseQuestion(
  question: QuizQuestion,
  answers: QuizQuestionAnswer[],
  selectedAnswerId: string,
): { score: number; isCorrect: boolean } {
  return gradeSingleChoiceQuestion(question, answers, selectedAnswerId);
}

/**
 * Chấm câu "chọn nhiều đáp án": đúng khi tập lựa chọn trùng khít tập đáp án đúng
 * (không thiếu, không thừa).
 */
export function gradeMultipleChoiceQuestion(
  question: QuizQuestion,
  answers: QuizQuestionAnswer[],
  selectedAnswerIds: string[],
): { score: number; isCorrect: boolean } {
  const correctIds = answers
    .filter((answer) => answer.isCorrect)
    .map((answer) => answer.id)
    .sort();
  const selectedIds = Array.from(new Set(selectedAnswerIds)).sort();

  const isCorrect =
    correctIds.length > 0 &&
    correctIds.length === selectedIds.length &&
    correctIds.every((id, index) => id === selectedIds[index]);

  return { score: isCorrect ? question.points : 0, isCorrect };
}

export type GradedQuestion = {
  score: number;
  isCorrect: boolean;
  selectedAnswer: string | null;
};

/**
 * Chấm một câu hỏi theo loại. Dùng chung cho cả 2 luồng nộp bài
 * (POST /quizzes/:quizId/submit và POST /quiz-attempts/:attemptId/submit).
 */
export function gradeQuizQuestion(params: {
  question: QuizQuestion;
  answers: QuizQuestionAnswer[];
  selectedAnswerIds: string[];
  textAnswer?: string | null;
}): GradedQuestion {
  const { question, answers, selectedAnswerIds, textAnswer } = params;

  switch (question.type) {
    case 'single_choice':
    case 'true_false': {
      const selected =
        selectedAnswerIds.length === 1
          ? answers.find((answer) => answer.id === selectedAnswerIds[0])
          : undefined;
      const isCorrect = Boolean(selected?.isCorrect);
      return {
        score: isCorrect ? question.points : 0,
        isCorrect,
        selectedAnswer: selected?.answer ?? null,
      };
    }

    case 'multiple_choice': {
      const grade = gradeMultipleChoiceQuestion(
        question,
        answers,
        selectedAnswerIds,
      );
      const selectedIds = new Set(selectedAnswerIds);
      const selectedAnswer =
        answers
          .filter((answer) => selectedIds.has(answer.id))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((answer) => answer.answer)
          .join(', ') || null;
      return { ...grade, selectedAnswer };
    }

    case 'fill_blank':
    case 'short_answer': {
      const grade = gradeFillBlankQuestion(question, textAnswer, answers);
      return { ...grade, selectedAnswer: textAnswer?.trim() || null };
    }

    default:
      return { score: 0, isCorrect: false, selectedAnswer: null };
  }
}

export function gradeChoiceQuestion(
  question: QuizQuestion,
  answers: Array<QuizQuestionAnswer & { content?: string }>,
  selectedAnswerIds: string[],
): { score: number; isCorrect: boolean } {
  if (selectedAnswerIds.length !== 1) {
    return { score: 0, isCorrect: false };
  }
  return gradeSingleChoiceQuestion(question, answers, selectedAnswerIds[0]);
}

export function gradeShortAnswer(
  question: QuizQuestion,
  textAnswer: string | null | undefined,
  acceptedAnswers: Array<QuizQuestionAnswer & { content?: string }>,
): { score: number; isCorrect: boolean } {
  return gradeFillBlankQuestion(question, textAnswer, acceptedAnswers);
}

export function computeAttemptTotals(
  answerScores: Array<{ score: number; maxPoints: number }>,
  passingScore: number,
): {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
} {
  const score = answerScores.reduce((sum, a) => sum + a.score, 0);
  const maxScore = answerScores.reduce((sum, a) => sum + a.maxPoints, 0);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return {
    score,
    maxScore,
    percentage,
    passed: percentage >= passingScore,
  };
}
