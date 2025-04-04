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
