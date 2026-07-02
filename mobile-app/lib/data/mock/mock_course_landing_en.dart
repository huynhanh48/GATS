import 'package:gats_academy/data/mock/models/course_landing_models.dart';

/// English landing content for onboarding course preview.
abstract final class MockCourseLandingEn {
  static final Map<String, CourseLandingContent> landings = {
    'course-1': const CourseLandingContent(
      courseId: 'course-1',
      subtitle: 'Hands-on AI for working professionals — from prompts to automation',
      about:
          'Learn to apply AI to everyday office work: emails, report summaries, '
          'data analysis, and time-saving workflows. Each module includes short practice tasks '
          'designed for 10–15 minutes per day.',
      learningOutcomes: [
        'Write clear prompts for emails, reports, and presentations',
        'Use ChatGPT/Claude to summarize long documents in minutes',
        'Automate Excel and Google Sheets with AI',
        'Build AI workflows for teams of 3–10 people',
        'Assess risk and security when using AI at work',
      ],
      requirements: [
        'Basic computer skills (Word, Excel, email)',
        'No programming required',
        'ChatGPT account or equivalent (free tier is fine)',
      ],
      curriculum: [
        CourseCurriculumSection(
          title: 'Week 1 · AI foundations for the office',
          lessons: [
            CourseCurriculumLesson(title: 'What is AI and how LLMs work', durationMinutes: 12, isPreview: true),
            CourseCurriculumLesson(title: 'AI toolkit for office workers', durationMinutes: 15, isPreview: true),
            CourseCurriculumLesson(title: 'Basic prompts: role + context + output', durationMinutes: 18),
            CourseCurriculumLesson(title: 'Practice: Write professional emails', durationMinutes: 20),
          ],
        ),
        CourseCurriculumSection(
          title: 'Week 2 · Content and reports',
          lessons: [
            CourseCurriculumLesson(title: 'Summarize PDFs and meeting notes', durationMinutes: 22),
            CourseCurriculumLesson(title: 'Create slides from an outline', durationMinutes: 25),
            CourseCurriculumLesson(title: 'Adjust tone: formal / friendly / persuasive', durationMinutes: 16),
            CourseCurriculumLesson(title: 'Week 2 quiz', durationMinutes: 10),
          ],
        ),
        CourseCurriculumSection(
          title: 'Week 3 · Data and automation',
          lessons: [
            CourseCurriculumLesson(title: 'Analyze spreadsheets with AI', durationMinutes: 24),
            CourseCurriculumLesson(title: 'Excel formulas + AI suggestions', durationMinutes: 28),
            CourseCurriculumLesson(title: 'Workflow: form → automated report', durationMinutes: 30),
            CourseCurriculumLesson(title: 'Final project: AI process for your team', durationMinutes: 35),
          ],
        ),
      ],
      instructorName: 'GATS Mentor',
      instructorTitle: 'Applied AI specialist · 8 years training enterprises',
      rating: 4.8,
      reviewCount: 1240,
      studentCount: 8600,
      level: 'Beginner → Intermediate',
      lastUpdated: '03/2026',
    ),
    'course-2': const CourseLandingContent(
      courseId: 'course-2',
      subtitle: 'Professional prompt writing — from basics to advanced techniques',
      about:
          'This Prompt Engineering course focuses on LLM techniques: zero-shot, few-shot, chain-of-thought, '
          'and optimizing output per use case. Ideal if you want to master AI instead of just experimenting.',
      learningOutcomes: [
        'Distinguish zero-shot, few-shot, and chain-of-thought',
        'Design structured prompts: role, task, constraints, format',
        'Debug prompts when results miss expectations',
        'Build reusable prompt templates for your team',
        'Evaluate output quality with a simple rubric',
      ],
      requirements: [
        'Have used ChatGPT or equivalent before',
        'No programming knowledge required',
      ],
      curriculum: [
        CourseCurriculumSection(
          title: 'Part 1 · Prompt foundations',
          lessons: [
            CourseCurriculumLesson(title: 'Thinking model: input → context → output', durationMinutes: 14, isPreview: true),
            CourseCurriculumLesson(title: 'Zero-shot vs few-shot', durationMinutes: 18, isPreview: true),
            CourseCurriculumLesson(title: 'Role and tone', durationMinutes: 16),
          ],
        ),
        CourseCurriculumSection(
          title: 'Part 2 · Advanced techniques',
          lessons: [
            CourseCurriculumLesson(title: 'Chain-of-thought and step-by-step', durationMinutes: 22),
            CourseCurriculumLesson(title: 'Output constraints: JSON, tables, checklists', durationMinutes: 20),
            CourseCurriculumLesson(title: 'Few-shot with effective examples', durationMinutes: 24),
          ],
        ),
        CourseCurriculumSection(
          title: 'Part 3 · Real-world practice',
          lessons: [
            CourseCurriculumLesson(title: 'Prompts for marketing and sales', durationMinutes: 26),
            CourseCurriculumLesson(title: 'Prompts for analysis and decisions', durationMinutes: 28),
            CourseCurriculumLesson(title: 'Final assessment', durationMinutes: 15),
          ],
        ),
      ],
      instructorName: 'GATS Mentor',
      instructorTitle: 'Prompt engineer · AI consultant for startups',
      rating: 4.9,
      reviewCount: 890,
      studentCount: 5200,
      level: 'Intermediate',
      lastUpdated: '02/2026',
    ),
    'course-3': const CourseLandingContent(
      courseId: 'course-3',
      subtitle: 'Workflows and AI agents for small teams',
      about:
          'Learn to design automation flows: trigger → AI processing → approval → delivery. '
          'Ideal for freelancers and teams scaling repetitive work.',
      learningOutcomes: [
        'Map AI workflows before implementation',
        'Connect no-code tools with LLM APIs',
        'Design simple agents with short-term memory',
        'Monitor errors and fallback when AI output is wrong',
      ],
      requirements: [
        'Completed basic Prompt course or equivalent',
        'Use Gmail/Notion/Sheets in daily work',
      ],
      curriculum: [
        CourseCurriculumSection(
          title: 'Module 1 · Workflow fundamentals',
          lessons: [
            CourseCurriculumLesson(title: 'Trigger, action, condition', durationMinutes: 20),
            CourseCurriculumLesson(title: 'Demo: Email → AI → Slack', durationMinutes: 25),
          ],
        ),
        CourseCurriculumSection(
          title: 'Module 2 · Agents and scale',
          lessons: [
            CourseCurriculumLesson(title: 'Single-role agent vs multi-agent', durationMinutes: 30),
            CourseCurriculumLesson(title: 'Project: Automated weekly report', durationMinutes: 40),
          ],
        ),
      ],
      instructorName: 'GATS Mentor',
      instructorTitle: 'Automation consultant',
      rating: 4.7,
      reviewCount: 320,
      studentCount: 1800,
      level: 'Advanced',
      lastUpdated: '01/2026',
    ),
  };
}
