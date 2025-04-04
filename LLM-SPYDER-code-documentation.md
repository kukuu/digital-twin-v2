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
