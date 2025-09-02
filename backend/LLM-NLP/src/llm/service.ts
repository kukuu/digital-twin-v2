{/*TypeScript Backend Service*/}

import { OpenAI } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Document } from "langchain/document";
import { z } from "zod";

// Type-safe envs. SCHEMA VALIDATION
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