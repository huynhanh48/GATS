from __future__ import annotations

from capabilities.web_search import WebSearchBase
from capabilities.web_fetch import WebFetchBase
from capabilities.file_system import FileSystem
from capabilities.agent_memory import AgentMemory
from capabilities.mcp.manager import MCPManager
from capabilities.weather import WeatherBase
from capabilities.current_time import CurrentTimeBase
from capabilities.sql_runner import SQLRunner
from capabilities.text_to_sql import TextToSQLGenerator
from core.sql_knowledge_base import SqlKnowledgeBase
# from capabilities.teaching import TeachingAgentBase

from tools.registry import registry
from tools.web.web_search import WebSearchTool
from tools.web.web_fetch import WebFetchTool
from tools.file.read_file import ReadFileTool
from tools.file.write_file import WriteFileTool
from tools.file.edit_file import EditFileTool
from tools.file.list_files import ListFilesTool
from tools.file.search_files import SearchFilesTool
from tools.file.bash import BashTool
from tools.memory.save_tool_usage import SaveToolUsageTool
from tools.memory.search_tool_usage import SearchToolUsageTool
from tools.memory.save_text import SaveTextMemoryTool
from tools.mcp.list_resources import ListMcpResourcesTool
from tools.mcp.read_resource import ReadMcpResourceTool
from tools.sql.run_sql import RunSQLTool
from tools.sql.text_to_sql import TextToSQLTool
from tools.sql.schema_train import SchemaTrainTool
from tools.agent.sub_agent import SubAgentTaskTool
from tools.time.current_time import CurrentTimeTool
from tools.weather.weather import WeatherTool
# from tools.teaching.generate_quiz import GenerateQuizTool
# from tools.teaching.generate_flashcard import GenerateFlashcardTool
# from tools.teaching.generate_exercise import GenerateExerciseTool


def create_and_register_all_tools(
    web_search: WebSearchBase | None = None,
    web_fetch: WebFetchBase | None = None,
    file_system: FileSystem | None = None,
    agent_memory: AgentMemory | None = None,
    mcp_manager: MCPManager | None = None,
    weather: WeatherBase | None = None,
    time_service: CurrentTimeBase | None = None,
    sql_runner: SQLRunner | None = None,
    sql_kb: SqlKnowledgeBase | None = None,
    sql_generator: TextToSQLGenerator | None = None,
    # teaching: TeachingAgentBase | None = None,
) -> None:
    if web_search is not None:
        registry.register(WebSearchTool(web_search))
    if web_fetch is not None:
        registry.register(WebFetchTool(web_fetch))
    if file_system is not None:
        registry.register(ReadFileTool(file_system))
        registry.register(WriteFileTool(file_system))
        registry.register(EditFileTool(file_system))
        registry.register(ListFilesTool(file_system))
        registry.register(SearchFilesTool(file_system))
        registry.register(BashTool(file_system))
    if agent_memory is not None:
        registry.register(SaveToolUsageTool(agent_memory))
        registry.register(SearchToolUsageTool(agent_memory))
        registry.register(SaveTextMemoryTool(agent_memory))
    if mcp_manager is not None:
        registry.register(ListMcpResourcesTool(mcp_manager))
        registry.register(ReadMcpResourceTool(mcp_manager))
    if weather is not None:
        registry.register(WeatherTool(weather))
    if time_service is not None:
        registry.register(CurrentTimeTool(time_service))
    if sql_runner is not None:
        registry.register(RunSQLTool(sql_runner))
    if sql_kb is not None and sql_generator is not None:
        registry.register(TextToSQLTool(sql_kb, sql_generator))
        registry.register(SchemaTrainTool(sql_kb))

    # if teaching is not None:
    #     registry.register(GenerateQuizTool(teaching))
    #     registry.register(GenerateFlashcardTool(teaching))
    #     registry.register(GenerateExerciseTool(teaching))

    registry.register(SubAgentTaskTool())
