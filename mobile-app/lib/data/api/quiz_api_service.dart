import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/quiz_api_paths.dart';

class QuizAnswerOption {
  const QuizAnswerOption({required this.id, required this.answer});

  final String id;
  final String answer;

  factory QuizAnswerOption.fromJson(Map<String, dynamic> json) {
    return QuizAnswerOption(
      id: json['id']?.toString() ?? '',
      answer: json['answer']?.toString() ?? '',
    );
  }
}

class QuizTakeQuestion {
  const QuizTakeQuestion({
    required this.id,
    required this.type,
    required this.question,
    required this.points,
    this.description,
    this.answers = const [],
  });

  final String id;
  final String type;
  final String question;
  final String? description;
  final int points;
  final List<QuizAnswerOption> answers;

  bool get isChoice =>
      type == 'single_choice' || type == 'multiple_choice';

  factory QuizTakeQuestion.fromJson(Map<String, dynamic> json) {
    final rawAnswers = json['answers'];
    return QuizTakeQuestion(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'single_choice',
      question: json['question']?.toString() ?? '',
      description: json['description']?.toString(),
      points: (json['points'] as num?)?.toInt() ?? 1,
      answers: rawAnswers is List
          ? rawAnswers
              .whereType<Map>()
              .map((e) => QuizAnswerOption.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : const [],
    );
  }
}

class QuizTakePayload {
  const QuizTakePayload({
    required this.id,
    required this.questions,
    this.title,
    this.description,
  });

  final String id;
  final String? title;
  final String? description;
  final List<QuizTakeQuestion> questions;

  factory QuizTakePayload.fromJson(Map<String, dynamic> json) {
    final rawQs = json['questions'];
    return QuizTakePayload(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString(),
      description: json['description']?.toString(),
      questions: rawQs is List
          ? rawQs
              .whereType<Map>()
              .map((e) => QuizTakeQuestion.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : const [],
    );
  }
}

class QuizSubmitAnswer {
  const QuizSubmitAnswer({
    required this.questionId,
    this.selectedAnswerId,
    this.textAnswer,
  });

  final String questionId;
  final String? selectedAnswerId;
  final String? textAnswer;

  Map<String, dynamic> toJson() => {
        'questionId': questionId,
        if (selectedAnswerId != null) 'selectedAnswerId': selectedAnswerId,
        if (textAnswer != null) 'textAnswer': textAnswer,
      };
}

class QuizSubmitResult {
  const QuizSubmitResult({
    required this.score,
    required this.maxScore,
    required this.percentage,
    required this.correctCount,
    required this.totalQuestions,
    this.passed,
  });

  final num score;
  final num maxScore;
  final num percentage;
  final int correctCount;
  final int totalQuestions;
  final bool? passed;

  factory QuizSubmitResult.fromJson(Map<String, dynamic> json) {
    return QuizSubmitResult(
      score: (json['score'] as num?) ?? 0,
      maxScore: (json['maxScore'] as num?) ?? 0,
      percentage: (json['percentage'] as num?) ?? 0,
      correctCount: (json['correctCount'] as num?)?.toInt() ?? 0,
      totalQuestions: (json['totalQuestions'] as num?)?.toInt() ?? 0,
      passed: json['passed'] as bool?,
    );
  }
}

abstract final class QuizApiService {
  static Map<String, dynamic>? _asMap(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    return null;
  }

  static Future<QuizTakePayload> take({
    required String quizId,
    required String token,
  }) async {
    final json = await ApiClient.get(QuizApiPaths.take(quizId), token: token);
    final data = _asMap(json['data']);
    if (data == null) {
      throw StateError('Quiz payload trống');
    }
    return QuizTakePayload.fromJson(data);
  }

  static Future<QuizTakePayload> byLesson({
    required String courseId,
    required String lessonId,
    required String token,
  }) async {
    final json = await ApiClient.get(
      QuizApiPaths.byLesson(courseId, lessonId),
      token: token,
    );
    final data = _asMap(json['data']);
    if (data == null) {
      throw StateError('Lesson quiz trống');
    }
    return QuizTakePayload.fromJson(data);
  }

  static Future<QuizSubmitResult> submit({
    required String quizId,
    required String token,
    required List<QuizSubmitAnswer> answers,
  }) async {
    final idempotencyKey =
        'quiz-submit-$quizId-${answers.length}-${answers.fold<int>(0, (s, a) => s ^ a.hashCode)}';
    final json = await ApiClient.post(
      QuizApiPaths.submit(quizId),
      token: token,
      body: {'answers': answers.map((a) => a.toJson()).toList()},
      headers: {'Idempotency-Key': idempotencyKey},
    );
    final data = _asMap(json['data']);
    if (data == null) {
      return const QuizSubmitResult(
        score: 0,
        maxScore: 0,
        percentage: 0,
        correctCount: 0,
        totalQuestions: 0,
      );
    }
    return QuizSubmitResult.fromJson(data);
  }
}
