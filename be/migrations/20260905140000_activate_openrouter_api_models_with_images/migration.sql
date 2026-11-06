UPDATE "ai_tool_configs"
SET "is_visible" = false, "updated_at" = now()
WHERE "type" = 'api_model' AND "item_key" IN ('openai', 'anthropic', 'google-gemini', 'deepseek', 'ollama-local', 'groq');

UPDATE "ai_tool_configs"
SET "is_visible" = true,
    "payload" = jsonb_set(
      COALESCE("payload", '{}'::jsonb),
      '{image}',
      to_jsonb(
        'https://openrouter.ai/' || COALESCE(
          NULLIF("payload"->'sync'->>'externalId', ''),
          NULLIF(replace(replace("website_url", 'https://openrouter.ai/', ''), 'https://openrouter.ai', ''), ''),
          replace(replace("item_key", 'openrouter-', ''), '-free', ':free')
        ) || '/opengraph-image-1oizug'
      ),
      true
    ),
    "updated_at" = now()
WHERE "type" = 'api_model'
  AND "item_key" NOT IN ('openai', 'anthropic', 'google-gemini', 'deepseek', 'ollama-local', 'groq');
