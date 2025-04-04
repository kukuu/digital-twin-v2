# LLM Integration Documentation for Digital Twin App - SPYDER

The command sequence are installing Node.js dependencies for the backend to integrate an LLM (Large Language Model) with SPYDER Digital Twin app. 

## Here's a breakdown of what each part does:

-  cd backend

Purpose: Navigates into the backend directory of your project (where your Node.js/TypeScript backend code lives).

- Installation of modules in the Backend
```
npm install langchain @langchain/openai @supabase/supabase-js typescript zod dotenv

```

Installs production dependencies:ependencies:

![image](https://github.com/kukuu/digital-twin-v2/blob/main/MLL-installations.png)


- Installs development-only type definitions:

```

npm install --save-dev @types/node

```

![image](https://github.com/kukuu/digital-twin-v2/blob/main/MLL-types.png) 


## What the packages do

- LangChain + OpenAI: To process natural language queries (e.g., "Predict meter failures").

- Supabase JS: To fetch/store meter data from your existing database.

- TypeScript + Zod: To ensure type safety and prevent runtime errors.

- dotenv: To securely manage API keys (Supabase/OpenAI credentials).

## What the commands yields from above

- After running these commands:

  - A node_modules folder is created (stores all dependencies).

  - Your package.json is updated with the new dependencies.

- You can now:

  - Call OpenAI from your backend (@langchain/openai).

  - Query Supabase (@supabase/supabase-js).

  - Validate data with Zod (e.g., check if meterId is a string).
 
  Example:

```
import { OpenAI } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

const llm = new OpenAI({ apiKey: process.env.OPENAI_KEY }); // Uses dotenv
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

```
## Setting up Supabase database 

This SQL code is setting up your Supabase database to store and manage LLM (Large Language Model) interactions for SPYDER Digital Twin app. Here's exactly what it does: 

```
CREATE EXTENSION IF NOT EXISTS vector;

```

- Purpose: Enables the PGVector extension in PostgreSQL (Supabase uses PostgreSQL under the hood).


  - **PGVector adds support for storing vector embeddings (numeric representations of text/data).**

  - **Critical for semantic search (e.g., finding similar meter readings using AI).**

  - Uses the vector(**1536**) data type later in the llm_queries table.

- CREATE TABLE for LLM Queries

```
CREATE TABLE llm_queries (...)
```

![image](https://github.com/kukuu/digital-twin-v2/blob/main/LLM-table-model.png)



    - Key Features Enabled

      - Audit Trail

      - Every LLM query/responses is logged with timestamps and linked to a specific meter.

      - Example: Track how often users ask about "failure predictions."

  - Semantic Search Ready

    - The embeddings column lets you:

    - Compare past queries for similarity (e.g., cluster FAQs).

    - Improve future responses using retrieval-augmented generation (RAG).

  - Data Integrity

    - REFERENCES readings(meter_id) ensures meter_id values exist in your main readings table.

    - JSONB allows flexible storage of structured LLM outputs (e.g., { "answer": "...", "confidence": 0.95 }).
 
  - Example Workflow

    - A user asks: "Is meter-123 at risk of failure?"

    - Your backend:

      - Logs the query in llm_queries.

      - Stores the OpenAI embedding of the question in embeddings.

      - Saves the LLM’s response in response.

  - Later, you can:

    - Search for similar queries using vector math (<=> operator in PostgreSQL).

    - Analyze trends with:
 
  - Why This Matters

    - Scalability: Supports future AI features (e.g., auto-suggesting queries).

    - Debugging: Audit logs help troubleshoot incorrect LLM responses.

    - Performance: PGVector enables fast similarity searches (e.g., for RAG pipelines).
   
  ## Explainint the Backend code 

  Here's a breakdown of what this backend code does, section by section:

- Imports & Setup

```
import { OpenAI } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Document } from "langchain/document";
import { z } from "zod";
```
  - OpenAI: LangChain's wrapper for OpenAI's LLMs (like GPT-4).

  - SupabaseVectorStore: Stores/retrieves vector embeddings (for semantic search) in Supabase.
  
  - createClient: Supabase's JS client for database operations.
  
  - Document: LangChain's class for structuring data (text + metadata).
  
  - zod: Library for type-safe environment variable validation.

- Environment Validation
```
const envSchema = z.object({
  SUPABASE_URL: z.string(),
  SUPABASE_KEY: z.string(),
  OPENAI_KEY: z.string(),
});
const env = envSchema.parse(process.env);
```
  - Validates that these environment variables exist:

    - SUPABASE_URL: Your Supabase project URL.

    - SUPABASE_KEY: Supabase API key.

    - OPENAI_KEY: OpenAI API key.

  - Throws an error if any are missing (fail-fast approach).

- Client Initialization

```

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
const llm = new OpenAI({ 
  apiKey: env.OPENAI_KEY,
  model: "gpt-4-1106-preview",  // Explicitly uses GPT-4-turbo
});

```
  - supabase: Configures the Supabase client for database queries.

  - llm: Sets up the OpenAI LLM with your API key and model choice.

- Core Function: handleLLMQuery

  - Input
    - Takes a meterId (to fetch specific meter data) and a question (user query).
```
interface QueryRequest {
  meterId: string;
  question: string;
}

```

    
  
  - Step 1: Fetch Meter Data
```
const { data: readings } = await supabase
  .from("readings")
  .select("*")
  .eq("meter_id", meterId)
  .order("timestamp", { ascending: false })
  .limit(20);
```
    i. Queries Supabase for the 20 most recent readings from the specified meter.
  
    ii. Throws an error if no data exists.

- Step 2: Generate Embeddings
```
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

```
i. Converts meter readings into LangChain Document objects (text + metadata).

ii. Generates OpenAI embeddings (vector representations) for each reading and stores them in Supabase's llm_queries table (via SupabaseVectorStore).

- Step 3: Run LLM Query

  - Sends a prompt to OpenAI with:

  - Context: The last 20 meter readings.

  - Question: The user's query (e.g., "Predict failures").

  - The LLM returns a natural language response.

```
const response = await llm.invoke(
  `As a Digital Twin AI, analyze meter ${meterId}. Context: ${JSON.stringify(readings)}. Question: ${question}`
);
```


- Step 4: Log to Supabase
