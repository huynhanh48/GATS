from core.llm import BaseLLM, LLMInput, LLMMessage
from core.sql_generator import SqlGenerator, SqlOutput
from core.user import User
from harness_agents.prompt.sql import SqlPrompt


class AzureOpenAISqlGenerator(SqlGenerator):
    def __init__(self, llm: BaseLLM):
        self._llm = llm

    async def generate(
        self,
        question: str,
        tables: list[str],
        additional_context: list[str],
        question_sql_pairs: list[dict],
    ) -> SqlOutput:
        sql_prompt = SqlPrompt(name="sql")
        prompt = await sql_prompt.render(
            question=question,
            ddl=tables,
            docs=additional_context,
            examples=question_sql_pairs,
        )
        llm_input = LLMInput(
            messages=[LLMMessage(role="user", content=prompt)],
            tools=None,
            user=User(id="sql_gen", username="sql_gen", email="sql_gen@agent"),
            temperature=0.1,
        )
        response = await self._llm.chat(llm_input)
        content = response.content or ""
        return SqlOutput(sql=content, explanation=content)
