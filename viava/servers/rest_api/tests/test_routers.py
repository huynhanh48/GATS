from contextlib import asynccontextmanager

import pytest
from fastapi.testclient import TestClient
from servers.rest_api.main import app
from servers.rest_api.dependencies import get_course_service
from servers.rest_api.services.content_resolver import ContentResolver
from servers.rest_api.services.course_service import CourseService
from servers.rest_api.services.exercise_service import ExerciseService
from servers.rest_api.services.teaching_service import TeachingService

SAMPLE_LP = {
    "course_title": "Khoa hoc mau",
    "target_level": "intermediate",
    "total_duration_minutes": 60,
    "milestones": [{
        "order": 1, "title": "Bai 1", "description": "Mo ta",
        "topics": ["CN"], "estimated_minutes": 30,
        "learning_objectives": ["MT"], "key_concepts": ["KN"],
    }],
    "domain": "",
    "track_id": None,
}

EXERCISE_URLS = {
    "mcq": "mcq", "short_answer": "short-answer", "fill_in_blank": "fill-in-blank",
    "true_false": "true-false", "matching": "matching", "ordering": "ordering",
    "coding": "coding", "flashcard": "flashcard",
}


@asynccontextmanager
async def noop_lifespan(app):
    yield


@pytest.fixture
def client(fake_generator, fake_teaching, fake_extractor, fake_transcriber):
    service = CourseService(
        resolver=ContentResolver(fake_extractor, fake_transcriber),
        exercise_svc=ExerciseService(fake_generator),
        teaching_svc=TeachingService(fake_teaching),
    )

    def override():
        return service

    app.dependency_overrides[get_course_service] = override
    old_lifespan = app.router.lifespan_context
    app.router.lifespan_context = noop_lifespan
    with TestClient(app) as c:
        yield c
    app.router.lifespan_context = old_lifespan
    app.dependency_overrides.clear()


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_get_course_info(client):
    resp = client.get("/course/info")
    assert resp.status_code == 200
    data = resp.json()
    assert "exercise_types" in data
    assert "mcq" in data["exercise_types"]
    assert "valid_levels" in data
    assert "languages" in data


def test_generate_learning_path(client):
    resp = client.post("/course/learning-path/generate", params={"text": "Noi dung", "domain": "testing"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["course_title"] == "Khoa hoc mau"
    assert len(data["milestones"]) == 2


def test_generate_learning_path_missing_domain(client):
    resp = client.post("/course/learning-path/generate", params={"text": "Noi dung"})
    assert resp.status_code == 422


@pytest.mark.parametrize("exercise_type,url_path", list(EXERCISE_URLS.items()))
def test_generate_exercise_types(client, exercise_type, url_path):
    url = f"/course/exercises/{url_path}/generate"
    body = {"learning_path": SAMPLE_LP}
    resp = client.post(url, json=body)
    assert resp.status_code == 200, f"Failed for {exercise_type}: {resp.text}"
    data = resp.json()
    assert data["exercise_type"] == exercise_type
    assert "exercises" in data


def test_generate_with_custom_lp(client):
    custom_lp = {
        "course_title": "Khoa tu chinh", "target_level": "advanced",
        "total_duration_minutes": 60,
        "milestones": [{
            "order": 1, "title": "Bai 1", "description": "Mo ta",
            "topics": ["CN"], "estimated_minutes": 30,
            "learning_objectives": ["MT"], "key_concepts": ["KN"],
        }],
        "domain": "",
        "track_id": None,
    }
    resp = client.post("/course/exercises/mcq/generate",
        json={"learning_path": custom_lp})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["course_title"] == "Khoa tu chinh"
    assert data["exercise_type"] == "mcq"
    assert len(data["exercises"]) == 1


def test_generate_exercise_with_custom_config(client):
    body = {
        "learning_path": SAMPLE_LP,
        "language": "english",
        "target_level": "advanced",
        "exercises_per_lesson": 5,
    }
    resp = client.post("/course/exercises/mcq/generate", json=body)
    assert resp.status_code == 200, resp.text


def test_generate_missing_lp_raises(client):
    resp = client.post("/course/exercises/mcq/generate")
    assert resp.status_code == 422


def test_evaluate(client):
    resp = client.post("/course/evaluate", json={"question": "Hoi?", "student_answer": "Tra loi"})
    assert resp.status_code == 200
    assert resp.json()["score"] == 80.0


def test_explain(client):
    resp = client.post("/course/explain", json={"concept": "Python"})
    assert resp.status_code == 200
    assert resp.json()["concept"] == "Python"


def test_summarize(client):
    resp = client.post("/course/summarize", json={"content": "Noi dung", "max_points": 3})
    assert resp.status_code == 200
    assert len(resp.json()["key_points"]) == 2


def test_request_id_header(client):
    resp = client.get("/health")
    assert "X-Request-ID" in resp.headers, f"Missing X-Request-ID header. Headers: {dict(resp.headers)}"
