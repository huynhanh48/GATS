DELETE FROM "ai_tool_configs"
WHERE "type" = 'api_model'
  AND "item_key" LIKE 'openrouter-%';
