from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent / "viava-harness"))

import pytest

from capabilities.course_exercises import BaseCourseExercises
from capabilities.course_exercises.models import (
    BlankItem,
    CodingExercise,
    CourseGenConfig,
    ExerciseMetadata,
    FillInBlankExercise,
    FlashcardEntity,
    LearningMilestone,
    LearningPath,
    MCQExercise,
    MCQOption,
    MatchingExercise,
    MatchingPair,
    OrderingExercise,
    OrderingStep,
    ShortAnswerExercise,
    TrueFalseExercise,
)
from capabilities.retrieval_augmented_generation.models import DocInsert
from capabilities.teaching import TeachingAgentBase
from capabilities.teaching.models import (
    Evaluation,
    Explanation,
    Summary,
)
from core.file_extractor import FileExtractorBase, ExtractedFile
from core.speech_to_text import SpeechToTextBase, TranscriptResult


class FakeCourseExercises(BaseCourseExercises):
    async def generate_learning_path(self, doc: DocInsert, config: CourseGenConfig) -> LearningPath:
        return LearningPath(
            course_title="Khoa hoc mau",
            target_level=config.target_level,
            total_duration_minutes=60,
            milestones=[
                LearningMilestone(order=1, title="Bai 1", description="Mo ta bai 1",
                    topics=["Chu de 1"], estimated_minutes=30,
                    learning_objectives=["Muc tieu 1"], key_concepts=["Khac niem 1"]),
                LearningMilestone(order=2, title="Bai 2", description="Mo ta bai 2",
                    topics=["Chu de 2"], estimated_minutes=30,
                    learning_objectives=["Muc tieu 2"], key_concepts=["Khac niem 2"]),
            ],
        )

    async def generate_exercises_by_type(
        self, learning_path: LearningPath, config: CourseGenConfig,
        exercise_type: str, retrieval_param=None,
    ) -> list:
        meta = ExerciseMetadata(exercise_id="ex-0001", lesson_index=0)
        if exercise_type == "mcq":
            return [MCQExercise(metadata=meta, question="Cau hoi?",
                options=[MCQOption(key="A", text="A", is_correct=True, rationale="Dung"),
                         MCQOption(key="B", text="B", is_correct=False, rationale="Sai"),
                         MCQOption(key="C", text="C", is_correct=False, rationale="Sai"),
                         MCQOption(key="D", text="D", is_correct=False, rationale="Sai")],
                correct_answer="A", explanation_correct="A dung")]
        elif exercise_type == "short_answer":
            return [ShortAnswerExercise(metadata=meta, question="Hoi?", model_answer="Tra loi", keywords=["key"])]
        elif exercise_type == "fill_in_blank":
            return [FillInBlankExercise(metadata=meta, text="Doan ___ van", blanks=[BlankItem(index=0, correct_answer="van")])]
        elif exercise_type == "true_false":
            return [TrueFalseExercise(metadata=meta, statement="Phat bieu", is_true=True, explanation="Dung")]
        elif exercise_type == "matching":
            return [MatchingExercise(metadata=meta, instruction="Noi cot", pairs=[MatchingPair(id="1", left="A", right="B")])]
        elif exercise_type == "ordering":
            return [OrderingExercise(metadata=meta, instruction="Sap xep", steps=[OrderingStep(order=1, text="Buoc 1")])]
        elif exercise_type == "coding":
            return [CodingExercise(metadata=meta, problem="Bai toan", language="python", solution_code="print()")]
        elif exercise_type == "flashcard":
            return [FlashcardEntity(card_id="card-0001", front_side_prompt="Hoi?", back_side_answer="Dap", mnemonics_hint="Goi y")]
        return []

    async def aretrieve_course_context(self, learning_path, retrieval_param=None):
        from capabilities.retrieval_augmented_generation.models import RetrievalContext
        return RetrievalContext()


class FakeTeaching(TeachingAgentBase):
    async def assess_level(self, topic: str, responses: list[dict]):
        from capabilities.teaching.models import LevelAssessment
        return LevelAssessment(topic=topic, current_level="intermediate")

    async def generate_lesson(self, topic: str, level: str, style: str = "explanatory"):
        from capabilities.teaching.models import Lesson
        return Lesson(title=topic, topic=topic, level=level, style=style)

    async def generate_exercise(self, content: str, exercise_type: str = "practice"):
        from capabilities.teaching.models import PracticalExercise
        return PracticalExercise(exercise_id="ex-001", instruction_prompt=content)

    async def evaluate_answer(self, question: str, student_answer: str, reference_answer: str | None = None) -> Evaluation:
        return Evaluation(score=80.0, max_score=100.0, is_correct=True,
            feedback="Tot", suggestions=["Can them chi tiet"], follow_up_questions=["Giai thich them?"])

    async def explain_concept(self, concept: str, student_level: str, max_words: int = 300) -> Explanation:
        return Explanation(concept=concept, student_level=student_level,
            explanation_text=f"Giai thich ve {concept}", analogies=["Giong nhu..."],
            examples=["Vi du..."], related_concepts=["Lien quan"])

    async def summarize_topic(self, content: str, level: str, max_points: int = 5) -> Summary:
        return Summary(topic="Chu de", level=level, key_points=["Diem 1", "Diem 2"], summary_text="Tom tat")

    async def recommend_resources(self, topic: str, level: str, count: int = 5):
        from capabilities.teaching.models import ResourceList
        return ResourceList(topic=topic, level=level)


class FakeFileExtractor(FileExtractorBase):
    @property
    def supported_formats(self) -> list[str]:
        return ["txt", "md", "pdf", "docx", "html"]

    async def extract(self, source) -> list[ExtractedFile]:
        return [ExtractedFile(content="Noi dung file gia lap", metadata={}, source=str(source), format="txt", filename="test.txt")]


class FakeTranscriber(SpeechToTextBase):
    @property
    def supported_formats(self) -> list[str]:
        return ["mp3", "wav", "flac", "m4a", "ogg", "wma"]

    async def transcribe(self, source) -> TranscriptResult:
        return TranscriptResult(text="Noi dung audio gia lap")

    async def transcribe_bytes(self, audio_bytes: bytes, format: str) -> TranscriptResult:
        return TranscriptResult(text="Noi dung audio gia lap")


@pytest.fixture
def fake_generator():
    return FakeCourseExercises()


@pytest.fixture
def fake_teaching():
    return FakeTeaching()


@pytest.fixture
def fake_extractor():
    return FakeFileExtractor()


@pytest.fixture
def fake_transcriber():
    return FakeTranscriber()
