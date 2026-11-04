const PROVIDER_CONFIG = {
  anthropic: { apiKeyName: 'ANTHROPIC_API_KEY', protocol: 'anthropic' },
  cerebras: { apiKeyName: 'CEREBRAS_API_KEY' },
  'cloudflare-workers-ai': { apiKeyName: 'CLOUDFLARE_API_TOKEN' },
  cohere: { apiKeyName: 'COHERE_API_KEY', protocol: 'cohere' },
  'google-gemini': { apiKeyName: 'GEMINI_API_KEY', protocol: 'gemini' },
  groq: { apiKeyName: 'GROQ_API_KEY' },
  'mistral-ai': { apiKeyName: 'MISTRAL_API_KEY' },
  openai: { apiKeyName: 'OPENAI_API_KEY' },
  openrouter: { apiKeyName: 'OPENROUTER_API_KEY' },
  'pollinations-ai': { apiKeyName: 'POLLINATIONS_KEY' },
  sambanova: { apiKeyName: 'SAMBANOVA_API_KEY' },
};

function getRequest(providerKey, endpoint, model) {
  const config = PROVIDER_CONFIG[providerKey] || { apiKeyName: 'API_KEY' };
  const baseUrl = endpoint.replace(/\/$/, '');
  const prompt = 'Xin chào, hãy giới thiệu về bạn!';

  if (config.protocol === 'anthropic') {
    return {
      ...config,
      url: `${baseUrl}/messages`,
      headers: {
        'x-api-key': { type: 'apiKey' },
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: { model, max_tokens: 1024, messages: [{ role: 'user', content: prompt }] },
      responsePath: 'content[0].text',
    };
  }

  if (config.protocol === 'gemini') {
    return {
      ...config,
      url: `${baseUrl}/models/${model}:generateContent`,
      apiKeyQuery: true,
      headers: { 'content-type': 'application/json' },
      body: { contents: [{ parts: [{ text: prompt }] }] },
      responsePath: 'candidates[0].content.parts[0].text',
    };
  }

  if (config.protocol === 'cohere') {
    return {
      ...config,
      url: `${baseUrl}/chat`,
      headers: {
        Authorization: { type: 'bearer' },
        'content-type': 'application/json',
      },
      body: { model, messages: [{ role: 'user', content: prompt }] },
      responsePath: 'message.content[0].text',
    };
  }

  return {
    ...config,
    url: `${baseUrl}/chat/completions`,
    headers: {
      Authorization: { type: 'bearer' },
      'content-type': 'application/json',
    },
    body: { model, messages: [{ role: 'user', content: prompt }] },
    responsePath: 'choices[0].message.content',
  };
}

function getCurlHeader(name, value, apiKeyName) {
  if (value?.type === 'apiKey') return `  -H "${name}: $${apiKeyName}" \\`;
  if (value?.type === 'bearer') return `  -H "${name}: Bearer $${apiKeyName}" \\`;
  return `  -H "${name}: ${value}" \\`;
}

function generateCurl(request) {
  const query = request.apiKeyQuery ? `?key=$${request.apiKeyName}` : '';
  const headers = Object.entries(request.headers)
    .map(([name, value]) => getCurlHeader(name, value, request.apiKeyName))
    .join('\n');

  return `curl -X POST "${request.url}${query}" \\
${headers}
  -d '${JSON.stringify(request.body, null, 2)}'`;
}

function getPowerShellHeader(name, value, apiKeyName) {
  if (value?.type === 'apiKey') return `  -H "${name}: $env:${apiKeyName}" \``;
  if (value?.type === 'bearer') return `  -H "${name}: Bearer $env:${apiKeyName}" \``;
  return `  -H "${name}: ${value}" \``;
}

function generatePowerShellCurl(request) {
  const query = request.apiKeyQuery ? `?key=$env:${request.apiKeyName}` : '';
  const headers = Object.entries(request.headers)
    .map(([name, value]) => getPowerShellHeader(name, value, request.apiKeyName))
    .join('\n');
  const body = JSON.stringify(request.body, null, 2);

  return `$env:${request.apiKeyName} = "YOUR_API_KEY"
$body = @'
${body}
'@
$tempFile = New-TemporaryFile

try {
  [IO.File]::WriteAllText($tempFile.FullName, $body, [Text.UTF8Encoding]::new($false))
  curl.exe -X POST "${request.url}${query}" \`
${headers}
    --data-binary "@$($tempFile.FullName)"
} finally {
  Remove-Item $tempFile.FullName -ErrorAction SilentlyContinue
}`;
}

function getPythonHeaders(headers) {
  const lines = Object.entries(headers).map(([name, value]) => {
    if (value?.type === 'apiKey') return `        "${name}": api_key`;
    if (value?.type === 'bearer') return `        "${name}": f"Bearer {api_key}"`;
    return `        "${name}": "${value}"`;
  });
  return `{\n${lines.join(',\n')}\n    }`;
}

function generatePython(request) {
  const params = request.apiKeyQuery ? ',\n    params={"key": api_key}' : '';
  return `import os
import requests

api_key = os.environ["${request.apiKeyName}"]
response = requests.post(
    "${request.url}",
    headers=${getPythonHeaders(request.headers)},
    json=${JSON.stringify(request.body, null, 4)}${params},
    timeout=60,
)
response.raise_for_status()
data = response.json()
print(data)  # Nội dung trả về: ${request.responsePath}`;
}

function getNodeHeaders(headers) {
  const lines = Object.entries(headers).map(([name, value]) => {
    if (value?.type === 'apiKey') return `    '${name}': apiKey`;
    if (value?.type === 'bearer') return `    '${name}': \`Bearer \${apiKey}\``;
    return `    '${name}': '${value}'`;
  });
  return `{\n${lines.join(',\n')}\n  }`;
}

function generateNode(request) {
  const query = request.apiKeyQuery ? '?key=${encodeURIComponent(apiKey)}' : '';
  return `const apiKey = process.env.${request.apiKeyName};
if (!apiKey) throw new Error('Thiếu biến môi trường ${request.apiKeyName}');

const response = await fetch(\`${request.url}${query}\`, {
  method: 'POST',
  headers: ${getNodeHeaders(request.headers)},
  body: JSON.stringify(${JSON.stringify(request.body, null, 2)}),
});

if (!response.ok) throw new Error(await response.text());
const data = await response.json();
console.log(data); // Nội dung trả về: ${request.responsePath}`;
}

export function generateApiCodeExample({ providerKey, endpoint, model, language, platform = 'bash' }) {
  const request = getRequest(providerKey, endpoint, model);
  if (language === 'python') return generatePython(request);
  if (language === 'node') return generateNode(request);
  if (platform === 'powershell') return generatePowerShellCurl(request);
  return generateCurl(request);
}
