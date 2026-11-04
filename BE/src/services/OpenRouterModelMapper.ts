import { createHash } from 'node:crypto';
import { z } from 'zod';

const openRouterModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  context_length: z.number().int().nonnegative().nullish(),
  supported_parameters: z.array(z.string()).nullish(),
  architecture: z
    .object({
      input_modalities: z.array(z.string()).nullish(),
      output_modalities: z.array(z.string()).nullish(),
    })
    .nullish(),
});

export const openRouterModelsResponseSchema = z.object({
  data: z.array(openRouterModelSchema),
});

export type OpenRouterModel = z.infer<typeof openRouterModelSchema>;

export type OpenRouterSyncMetadata = {
  source: 'openrouter';
  externalId: string;
  sourceTitle: string;
  sourceDescription: string;
  lastSeenAt: string;
  missCount: number;
  contentHash: string;
  managed: true;
  sourceFields?: Record<string, unknown>;
};

export type MappedOpenRouterModel = {
  itemKey: string;
  title: string;
  websiteUrl: string;
  payload: Record<string, unknown> & { sync: OpenRouterSyncMetadata };
};

export function isEligibleFreeModel(model: OpenRouterModel): boolean {
  if (model.id === 'openrouter/free' || !model.id.endsWith(':free')) return false;
  const input = model.architecture?.input_modalities ?? ['text'];
  const output = model.architecture?.output_modalities ?? ['text'];
  return input.includes('text') && output.includes('text');
}

export function makeOpenRouterItemKey(modelId: string): string {
  const normalized = modelId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const base = `openrouter-${normalized || 'model'}`;
  if (base.length <= 100) return base;
  const hash = createHash('sha256').update(modelId).digest('hex').slice(0, 12);
  return `${base.slice(0, 87)}-${hash}`;
}

function providerName(model: OpenRouterModel): string {
  const titleProvider = model.name.split(':')[0]?.trim();
  if (titleProvider && titleProvider !== model.name) return titleProvider;
  return model.id.split('/')[0] || 'OpenRouter';
}

function buildFeatures(model: OpenRouterModel): string[] {
  const parameters = new Set(model.supported_parameters ?? []);
  const modalities = new Set(model.architecture?.input_modalities ?? []);
  const features = ['Tương thích OpenAI API', 'Model miễn phí qua OpenRouter'];
  if (parameters.has('tools') || parameters.has('tool_choice')) {
    features.push('Hỗ trợ gọi công cụ');
  }
  if (parameters.has('response_format') || parameters.has('structured_outputs')) {
    features.push('Hỗ trợ đầu ra có cấu trúc');
  }
  if (parameters.has('reasoning')) features.push('Hỗ trợ reasoning');
  if (modalities.has('image')) features.push('Hỗ trợ đầu vào hình ảnh');
  return features;
}

function sourceContentHash(model: OpenRouterModel): string {
  const sourceFields = {
    id: model.id,
    name: model.name,
    description: model.description ?? '',
    contextLength: model.context_length ?? null,
    supportedParameters: [...(model.supported_parameters ?? [])].sort(),
    inputModalities: [...(model.architecture?.input_modalities ?? [])].sort(),
    outputModalities: [...(model.architecture?.output_modalities ?? [])].sort(),
  };
  return createHash('sha256').update(JSON.stringify(sourceFields)).digest('hex');
}

export function mapOpenRouterModel(
  model: OpenRouterModel,
  seenAt: Date,
): MappedOpenRouterModel {
  const description = model.description?.trim() ?? '';
  const pythonModel = JSON.stringify(model.id);
  const jsModel = JSON.stringify(model.id);
  const shellModel = model.id.replace(/'/g, "'\\''");

  return {
    itemKey: makeOpenRouterItemKey(model.id),
    title: model.name,
    websiteUrl: `https://openrouter.ai/${model.id}`,
    payload: {
      provider: providerName(model),
      docsUrl: 'https://openrouter.ai/docs/quickstart',
      badge: 'OpenRouter Free',
      badgeColor:
        'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      image: `https://openrouter.ai/${model.id}/opengraph-image-1oizug`,
      description,
      contextWindow: model.context_length
        ? `${model.context_length.toLocaleString('en-US')} tokens`
        : 'Theo giới hạn của OpenRouter',
      installCmdPython: 'pip install openai',
      installCmdNode: 'npm install openai',
      envVar: 'OPENROUTER_API_KEY',
      features: buildFeatures(model),
      codePython: `import os\nfrom openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://openrouter.ai/api/v1",\n    api_key=os.environ["OPENROUTER_API_KEY"],\n)\nresponse = client.chat.completions.create(\n    model=${pythonModel},\n    messages=[{"role": "user", "content": "Xin chào!"}],\n)\nprint(response.choices[0].message.content)`,
      codeNode: `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://openrouter.ai/api/v1",\n  apiKey: process.env.OPENROUTER_API_KEY,\n});\nconst response = await client.chat.completions.create({\n  model: ${jsModel},\n  messages: [{ role: "user", content: "Xin chào!" }],\n});\nconsole.log(response.choices[0].message.content);`,
      codeCurl: `curl https://openrouter.ai/api/v1/chat/completions \\\n  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"${shellModel}","messages":[{"role":"user","content":"Xin chào!"}]}'`,
      sync: {
        source: 'openrouter',
        externalId: model.id,
        sourceTitle: model.name,
        sourceDescription: description,
        lastSeenAt: seenAt.toISOString(),
        missCount: 0,
        contentHash: sourceContentHash(model),
        managed: true,
      },
    },
  };
}
