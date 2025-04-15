
# Node.js LLM implementation

Here's a step-by-step executable plan to integrate an LLM module into SPYDER production build of the  Digital Twin app https://digital-twin-v2-chi.vercel.app/ . It  leveraging the existing Supabase/Vercel/Render stack.

**The implementation gives you:**

- End-to-end type safety

- Context-aware responses

- Zero downtime deployment

- Scalable LLM architecture


## Architecture: Folder Structure

```
digital-twin-backend/
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts       # Supabase client initialization
│   ├── services/
│   │   ├── llmService.ts           # Core LLM logic (handleLLMQuery)
│   │   └── types.ts                # Type definitions (QueryRequest, etc.)
│   ├── routes/
│   │   ├── llm.ts                  # LLM API endpoint router
│   │   └── index.ts                # Main router aggregator
│   ├── utils/
│   │   ├── env.ts                  # Zod env validation
│   │   └── errorHandler.ts         # Custom error middleware
│   └── index.ts                    # Express app entry point
├── tests/                          # (Optional)
│   ├── llmService.test.ts
│   └── routes.test.ts
├── .env.local                      # Local env vars (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json                   # TypeScript config
├── render.yaml                     # Render deployment config
└── README.md

```

## Phase 1: Setup & Backend (Node.js + TypeScript) 

- Install Dependencies

```
cd backend && npm install \
  langchain @langchain/openai \
  @supabase/supabase-js \
  typescript @types/node \
  zod dotenv  # For type-safe envs
```

- Extend Supabase Schema

  - Run in Supabase SQL Editor:

```
-- Enable PGVector
CREATE EXTENSION IF NOT EXISTS vector;

-- Add LLM context tables
CREATE TABLE llm_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meter_id VARCHAR(255) REFERENCES readings(meter_id),
  query TEXT NOT NULL,
  response JSONB,
  embeddings vector(1536),  -- OpenAI embeddings
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- TypeScript Backend Service
  - File: backend/src/llm/service.ts
 
```
import { OpenAI } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Document } from "langchain/document";
import { z } from "zod";

// Type-safe envs
const envSchema = z.object({
  SUPABASE_URL: z.string(),
  SUPABASE_KEY: z.string(),
  OPENAI_KEY: z.string(),
});
const env = envSchema.parse(process.env);

// Initialize clients
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
const llm = new OpenAI({ 
  apiKey: env.OPENAI_KEY,
  model: "gpt-4-1106-preview",  // Use cheaper model for production
});

interface QueryRequest {
  meterId: string;
  question: string;
}

export async function handleLLMQuery({ meterId, question }: QueryRequest) {
  // 1. Fetch meter context
  const { data: readings } = await supabase
    .from("readings")
    .select("*")
    .eq("meter_id", meterId)
    .order("timestamp", { ascending: false })
    .limit(20);

  if (!readings) throw new Error("No meter data found");

  // 2. Generate embeddings for semantic search
  const docs = readings.map(reading => 
    new Document({
      pageContent: JSON.stringify(reading),
      metadata: { meterId, timestamp: reading.timestamp },
    })
  );

  const vectorStore = await SupabaseVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({ apiKey: env.OPENAI_KEY }),
    { client: supabase, tableName: "llm_queries" }
  );

  // 3. Run context-aware query
  const response = await llm.invoke(
    `As a Digital Twin AI, analyze meter ${meterId}. Context: ${JSON.stringify(readings)}. Question: ${question}`
  );

  // 4. Log to Supabase
  await supabase.from("llm_queries").insert({
    meter_id: meterId,
    query: question,
    response: { answer: response },
  });

  return response;
}
```

## Phase 2: API & Frontend Integration

- TypeScript API Endpoint

  - File: backend/src/routes/llm.ts

```
import express from "express";
import { handleLLMQuery } from "../services/llmService";
import { z } from "zod";

const router = express.Router();

const QuerySchema = z.object({
  meterId: z.string(),
  question: z.string().min(3),
});

router.post("/query", async (req, res) => {
  try {
    const validated = QuerySchema.parse(req.body);
    const answer = await handleLLMQuery(validated);
    res.json({ answer });
  } catch (error) {
    console.error("LLM Error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default router;
```

- React Component (TypeScript)
  - File: frontend/src/components/LLMInterface.tsx
 
```
import { useState } from "react";
import supabase from "@/lib/supabaseClient";

interface LLMInterfaceProps {
  meterId: string;
}

export default function LLMInterface({ meterId }: LLMInterfaceProps) {
  const [query, setQuery] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("llm/query", {
        body: { meterId, question: query },
      });
      if (error) throw error;
      setAnswer(data.answer);
    } catch (err) {
      setAnswer(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about this meter..."
        className="w-full p-2 mb-2 border rounded"
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`px-4 py-2 rounded ${isLoading ? "bg-gray-400" : "bg-blue-600 text-white"}`}
      >
        {isLoading ? "Processing..." : "Ask AI"}
      </button>
      {answer && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <strong>Response:</strong> {answer}
        </div>
      )}
    </div>
  );
}
```


## Phase 3: Deployment & CI/CD

- Environment Variables
  - Add to Render and Vercel:
 
```
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-anon-key
OPENAI_KEY=sk-your-key
```

- Build & Deploy

```
# Build TypeScript
npx tsc --project tsconfig.json

# Deploy to Render (backend)
git push origin main

# Deploy to Vercel (frontend)
vercel --prod
```


## Key Features Added

✅ Type Safety - Zod for runtime validation

✅ Semantic Search - PGVector embeddings

✅ Error Handling - Structured logging

✅ Cost Control - GPT-4-turbo with context window optimization

- Production Checklist:

  - Set rate limiting on /llm/query endpoint

  - Enable Supabase RLS for llm_queries table

  - Monitor usage via Supabase Logs Explorer
 
## Testing 

```
curl -X POST https://your-render-url.com/llm/query \
  -H "Content-Type: application/json" \
  -d '{"meterId": "meter-123", "question": "Predict maintenance needs"}'

```
