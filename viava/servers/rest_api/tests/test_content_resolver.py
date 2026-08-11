import pytest
from servers.rest_api.exceptions import AppError
from servers.rest_api.schemas.common import CourseGenerateRequest
from servers.rest_api.services.content_resolver import ContentResolver


@pytest.fixture
def resolver(fake_extractor, fake_transcriber):
    return ContentResolver(fake_extractor, fake_transcriber)


@pytest.mark.asyncio
async def test_resolve_text_direct(resolver):
    req = CourseGenerateRequest(text="Noi dung truc tiep", domain="testing")
    doc = await resolver.resolve(req)
    assert doc.contents == "Noi dung truc tiep"
    assert doc.domain == "testing"


@pytest.mark.asyncio
async def test_resolve_empty_raises(resolver):
    req = CourseGenerateRequest.model_construct(text=" ", domain="testing")
    with pytest.raises(AppError, match="CONTENT_EMPTY"):
        await resolver.resolve(req)


@pytest.mark.asyncio
async def test_resolve_too_long_raises(resolver):
    req = CourseGenerateRequest(text="x" * 100_001, domain="testing")
    with pytest.raises(AppError, match="CONTENT_TOO_LONG"):
        await resolver.resolve(req)


@pytest.mark.asyncio
async def test_resolve_missing_all_input_raises():
    with pytest.raises(ValueError):
        CourseGenerateRequest(domain="testing")
