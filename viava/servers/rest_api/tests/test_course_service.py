import pytest
from capabilities.course_exercises import CourseGenConfig
from capabilities.course_exercises.models import LearningMilestone, LearningPath
from servers.rest_api.schemas.common import CourseGenerateRequest
from servers.rest_api.schemas.teaching import EvaluateRequest, ExplainRequest, SummarizeRequest
from servers.rest_api.services.content_resolver import ContentResolver
from servers.rest_api.services.course_service import CourseService
from servers.rest_api.services.exercise_service import ExerciseService
from servers.rest_api.services.teaching_service import TeachingService

SAMPLE_LP = LearningPath(
    course_title="Khoa hoc mau", target_level="intermediate",
    total_duration_minutes=60,
    milestones=[
        LearningMilestone(order=1, title="Bai 1", description="Mo ta",
            topics=["CN"], estimated_minutes=30,
            learning_objectives=["MT"], key_concepts=["KN"]),
        LearningMilestone(order=2, title="Bai 2", description="Mo ta",
            topics=["CN"], estimated_minutes=30,
            learning_objectives=["MT"], key_concepts=["KN"]),
    ],
)


@pytest.fixture
def service(fake_generator, fake_teaching, fake_extractor, fake_transcriber):
    return CourseService(
        resolver=ContentResolver(fake_extractor, fake_transcriber),
        exercise_svc=ExerciseService(fake_generator),
        teaching_svc=TeachingService(fake_teaching),
    )


@pytest.mark.asyncio
async def test_generate_learning_path(service):
    req = CourseGenerateRequest(text="Noi dung", domain="testing")
    result = await service.generate_learning_path(req)
    assert result.course_title == "Khoa hoc mau"
    assert len(result.milestones) == 2


@pytest.mark.asyncio
async def test_generate_exercise_mcq(service):
    config = CourseGenConfig(language="vi", target_level="intermediate",
        detail_level="standard", exercises_per_lesson=3)
    exercises = await service.generate_exercise(SAMPLE_LP, config, "mcq")
    assert len(exercises) == 1
    assert exercises[0].type == "mcq"


@pytest.mark.asyncio
async def test_generate_exercise_with_custom_lp(service):
    custom_lp = LearningPath(
        course_title="Khoa hoc tu chinh", target_level="advanced",
        total_duration_minutes=120,
        milestones=[
            LearningMilestone(order=1, title="Bai tuy chinh", description="Tu soan",
                topics=["TC"], estimated_minutes=60,
                learning_objectives=["MT"], key_concepts=["KN"]),
        ],
    )
    config = CourseGenConfig()
    exercises = await service.generate_exercise(custom_lp, config, "mcq")
    assert len(exercises) == 1


@pytest.mark.asyncio
async def test_generate_exercise_invalid_type(service):
    from servers.rest_api.exceptions import AppError
    config = CourseGenConfig()
    with pytest.raises(AppError, match="VALIDATION_ERROR"):
        await service.generate_exercise(SAMPLE_LP, config, "invalid_type")


@pytest.mark.asyncio
async def test_all_exercise_types(service):
    types = ["mcq", "short_answer", "fill_in_blank", "true_false", "matching", "ordering", "coding", "flashcard"]
    for et in types:
        config = CourseGenConfig()
        exercises = await service.generate_exercise(SAMPLE_LP, config, et)
        assert len(exercises) >= 1


@pytest.mark.asyncio
async def test_evaluate(service):
    req = EvaluateRequest(question="Cau hoi", student_answer="Tra loi")
    result = await service.evaluate(req)
    assert result.score == 80.0
    assert result.is_correct is True


@pytest.mark.asyncio
async def test_explain(service):
    req = ExplainRequest(concept="Python", level="intermediate")
    result = await service.explain(req)
    assert result.concept == "Python"


@pytest.mark.asyncio
async def test_summarize(service):
    req = SummarizeRequest(content="Noi dung", max_points=3)
    result = await service.summarize(req)
    assert len(result.key_points) == 2
