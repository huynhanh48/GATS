const QuizPaths = {
  _: '/api',
  Quiz: {
    _: '/quizzes',
    Get: '/quizzes/:quizId',
    Update: '/quizzes/:quizId',
    Take: '/quizzes/:quizId/take',
    Submit: '/quizzes/:quizId/submit',
    Questions: {
      List: '/quizzes/:quizId/questions',
      Create: '/quizzes/:quizId/questions',
      Reorder: '/quizzes/:quizId/questions/reorder',
    },
    Attempts: {
      Create: '/quizzes/:quizId/attempts',
    },
  },
  Question: {
    Get: '/quiz-questions/:questionId',
    PutUpdate: '/quiz-questions/:questionId',
    Update: '/quiz-questions/:questionId',
    Delete: '/quiz-questions/:questionId',
  },
  Attempt: {
    SaveAnswer: '/quiz-attempts/:attemptId/answers/:questionId',
    Submit: '/quiz-attempts/:attemptId/submit',
    Result: '/quiz-attempts/:attemptId/result',
  },
  Answer: {
    Grade: '/quiz-answers/:answerId/grade',
  },
  LessonQuiz: {
    Create: '/courses/:courseId/lessons/:lessonId/quiz',
    Get: '/courses/:courseId/lessons/:lessonId/quiz',
  },
} as const;

export default QuizPaths;
