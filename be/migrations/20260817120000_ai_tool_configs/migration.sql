CREATE TYPE "public"."ai_tool_type" AS ENUM('prompt', 'api_model');
CREATE TABLE "ai_tool_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" "ai_tool_type" NOT NULL,
  "item_key" varchar(100) NOT NULL,
  "title" varchar(255) NOT NULL,
  "is_visible" boolean DEFAULT true NOT NULL,
  "is_paid" boolean DEFAULT false NOT NULL,
  "website_url" varchar(1000),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "idx_ai_tool_configs_type_key" ON "ai_tool_configs" USING btree ("type", "item_key");
INSERT INTO "ai_tool_configs" ("type", "item_key", "title", "is_paid") VALUES
('prompt','prompt-01','Tạo Ảnh Chân Dung Cinematic 8K',true),
('prompt','prompt-02','Chuyên Gia Copywriting Sales Page',false),
('prompt','prompt-03','Kỹ Sư AI Viết Code Python',true),
('prompt','prompt-04','Thiết Kế Logo Vector Minimalist',true),
('prompt','prompt-05','Chiến Lược Content Marketing 30 Ngày',true),
('prompt','prompt-06','Phân Tích & Tóm Tắt Tài Liệu PDF',false),
('prompt','prompt-07','Phối Cảnh Nội Thất Luxury 3D',true),
('prompt','prompt-08','Chatbot AI Tư Vấn Khách Hàng',true),
('api_model','openai','OpenAI GPT-4o & o3-mini',false),
('api_model','anthropic','Anthropic Claude 3.5 Sonnet',false),
('api_model','google-gemini','Google Gemini 1.5 Pro & 2.0 Flash',false),
('api_model','deepseek','DeepSeek R1 & V3 Reasoner',false),
('api_model','ollama-local','Ollama (Llama 3.3 & DeepSeek Local)',false),
('api_model','groq','Groq Cloud LPU Inference',false);
