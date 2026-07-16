"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { coursesClient, type CourseCurriculumSection } from "@/services/courses.client";
import { quizClient } from "@/services/quiz.client";
import type {
  CoursePublic,
  CourseDetailLesson,
  Quiz,
} from "@/lib/api/types";
import { QuizBuilder } from "../../[id]/_components/quiz-builder";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

type QuizLesson = CourseDetailLesson & { sectionTitle: string };

export function CourseQuizManager() {
  const [courses, setCourses] = useState<CoursePublic[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState<CoursePublic | null>(null);
  const [sections, setSections] = useState<CourseCurriculumSection[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  const [selectedLesson, setSelectedLesson] = useState<QuizLesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizNoData, setQuizNoData] = useState(false);

  // 1. Fetch courses on mount
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoadingCourses(true);
        const res = await coursesClient.list({ take: 100 });
        if (res.data) {
          setCourses(res.data.data);
        } else if (res.error) {
          toast.error(res.error.message);
        }
      } catch {
        toast.error("Lỗi khi tải danh sách khóa học");
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, []);

  // 2. Fetch curriculum when a course is selected
  useEffect(() => {
    async function fetchCurriculum() {
      if (!selectedCourse) {
        setSections([]);
        setSelectedLesson(null);
        setQuiz(null);
        return;
      }
      try {
        setLoadingCurriculum(true);
        const res = await coursesClient.getCurriculum(selectedCourse.id);
        if (res.data) {
          setSections(res.data.data);
          setSelectedLesson(null);
          setQuiz(null);
        } else if (res.error) {
          toast.error(res.error.message);
        }
      } catch {
        toast.error("Lỗi khi tải chương trình học");
      } finally {
        setLoadingCurriculum(false);
      }
    }
    fetchCurriculum();
  }, [selectedCourse]);

  // 3. Fetch quiz when a lesson is selected
  useEffect(() => {
    async function fetchQuiz() {
      if (!selectedCourse || !selectedLesson) {
        setQuiz(null);
        setQuizNoData(false);
        return;
      }
      try {
        setLoadingQuiz(true);
        const res = await quizClient.getQuizByLessonAdmin(selectedCourse.id, selectedLesson.id);
        setQuiz(res.data?.data ?? null);
        setQuizNoData(!!res.error);
      } catch {
        toast.error("Lỗi khi tải dữ liệu quiz");
        setQuizNoData(true);
      } finally {
        setLoadingQuiz(false);
      }
    }
    fetchQuiz();
  }, [selectedCourse, selectedLesson]);

  // Flatten lessons that are type "quiz"
  const quizLessons = useMemo(() => {
    const lessons: QuizLesson[] = [];
    for (const sec of sections) {
      for (const les of sec.lessons) {
        if (les.type === "quiz") {
          lessons.push({ ...les, sectionTitle: sec.title });
        }
      }
    }
    return lessons;
  }, [sections]);

  const handleQuizCreated = (lessonId: string, newQuiz: Quiz) => {
    setQuiz(newQuiz);
    setQuizNoData(false);
    toast.success("Quiz đã sẵn sàng!");
  };

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Course Combobox */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Khóa học
            </label>
            <Combobox
              items={courses}
              value={selectedCourse}
              onValueChange={(val) => setSelectedCourse(val as CoursePublic | null)}
              itemToStringLabel={(c: CoursePublic) => c.title}
              isItemEqualToValue={(a: CoursePublic, b: CoursePublic) => a.id === b.id}
              disabled={loadingCourses}
            >
              <ComboboxInput
                placeholder={loadingCourses ? "Đang tải..." : "Tìm khóa học..."}
              />
              <ComboboxContent>
                <ComboboxEmpty>Không tìm thấy khóa học nào.</ComboboxEmpty>
                <ComboboxList>
                  {(item: CoursePublic) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.title}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {/* Lesson Combobox */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Bài học (Quiz)
            </label>
            <Combobox
              items={quizLessons}
              value={selectedLesson}
              onValueChange={(val) => setSelectedLesson(val as QuizLesson | null)}
              itemToStringLabel={(l: QuizLesson) => `${l.sectionTitle} - ${l.title}`}
              isItemEqualToValue={(a: QuizLesson, b: QuizLesson) => a.id === b.id}
              disabled={!selectedCourse || loadingCurriculum}
            >
              <ComboboxInput
                placeholder={
                  !selectedCourse
                    ? "Chọn khóa học trước"
                    : loadingCurriculum
                    ? "Đang tải..."
                    : "Tìm bài học Quiz..."
                }
              />
              <ComboboxContent>
                <ComboboxEmpty>Không có bài học loại Quiz.</ComboboxEmpty>
                <ComboboxList>
                  {(item: QuizLesson) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.sectionTitle} - {item.title}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {!loadingCurriculum && selectedCourse && quizLessons.length === 0 && (
              <p className="mt-1 text-xs text-orange-500">
                Khóa học này chưa có bài học loại Quiz.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Builder Area */}
      {selectedCourse && selectedLesson && (
        <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <h3 className="mb-4 text-title-sm font-bold text-dark dark:text-white">
            Nội dung Quiz
          </h3>

          {loadingQuiz ? (
            <p className="text-sm text-dark-4 dark:text-dark-6">Đang tải dữ liệu quiz...</p>
          ) : quizNoData ? (
            <QuizBuilder
              courseId={selectedCourse.id}
              lessonId={selectedLesson.id}
              onCreated={(q) => handleQuizCreated(selectedLesson.id, q)}
            />
          ) : (
            <QuizBuilder
              courseId={selectedCourse.id}
              lessonId={selectedLesson.id}
              existingQuiz={quiz}
              onCreated={(q) => handleQuizCreated(selectedLesson.id, q)}
            />
          )}
        </div>
      )}
    </div>
  );
}
