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
   
  ## Explaining the Backend code 

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

```
await supabase.from("llm_queries").insert({
  meter_id: meterId,
  query: question,
  response: { answer: response },
});
```
 - Saves the query and LLM response to Supabase for:

  - Auditing (track user questions).

  - Future RAG (retrieval-augmented generation).

**Output**

Returns the LLM's response (e.g., "Meter-123 shows a 20% risk of failure next week.").

**Key Features**

- Context-Aware Responses

  - The LLM analyzes real meter data (readings) before answering.

- Semantic Search Ready

  - Embeddings enable future searches like: "Find meters with similar usage patterns to Meter-123."

- Auditability

  - All queries/responses are logged in Supabase.

- Type Safety

  - Zod ensures env vars exist, and TypeScript checks interfaces.
 
**Workflow Example**

- User asks: "Is Meter-123 at risk of failure?"

- Backend:

  - Fetches Meter-123's last 20 readings.

  - Generates embeddings for those readings.

  - Sends context + question to OpenAI.

  - Logs the query/response in Supabase.

- Response: "Based on recent data, Meter-123 has a 15% failure risk due to rising temperature trends."

**Error Handling**

- Throws errors if:

  - Environment variables are missing.

  - No meter data exists.

  - Supabase/OpenAI API calls fail.

Corporate documentation: [to be added]

## Frontend Breakdown

Here's a clear breakdown of the frontend API integration code and its role in SPYDER DigitalTwin LLM-powered app:

- This code creates an Express.js API endpoint (/llm/query) that:

**Purpose** 

This code creates an Express.js API endpoint (/llm/query) that:

- Accepts natural language questions about meter data from your frontend.

- Validates the request.

- Calls your LLM service (handleLLMQuery).

- Returns the AI's response to the frontend.

**Code Breakdown**

- A. Imports

```
import express from "express";
import { handleLLMQuery } from "../services/llmService";
import { z } from "zod";
```
  - express: Node.js framework for building APIs.
  
  - handleLLMQuery: Your LLM service (analyzes meter data + generates answers).
  
  - zod: Validates request data types.

- B. Request Validation

```
const QuerySchema = z.object({
  meterId: z.string(),
  question: z.string().min(3),
});
```
  - Defines the expected request shape:

    - meterId: Must be a string (e.g., "meter-123").
  
    - question: Must be a string with ≥3 characters (e.g., "Predict failures").

  - Throws an error if invalid (e.g., missing meterId).

- C. API Endpoint
```
router.post("/query", async (req, res) => {
  try {
    // 1. Validate request
    const validated = QuerySchema.parse(req.body);

    // 2. Call LLM service
    const answer = await handleLLMQuery(validated);

    // 3. Return response
    res.json({ answer });

  } catch (error) {
    console.error("LLM Error:", error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});
```

  - Validation: Uses QuerySchema to check req.body.

  - LLM Processing: Passes validated data to handleLLMQuery (fetches meter data → calls OpenAI).

  - Response: Sends the LLM's answer as JSON (e.g., { answer: "Risk level: 15%" }).

  - Error Handling:

    - Logs errors.

    - Returns 400 Bad Request with error details (safe for frontend display).

**How the Frontend Uses This**

React Component Example (Simplified):

```
const askAI = async (meterId: string, question: string) => {
  const response = await fetch("/api/llm/query", {
    method: "POST",
    body: JSON.stringify({ meterId, question }),
  });
  const { answer, error } = await response.json();
  if (error) alert(error);
  return answer; // "Meter-123 shows normal operation."
};

```

**Key Features**

- ✅ Type Safety

  - Zod ensures meterId and question exist and are valid.

- ✅ Structured Logging

  - Errors are logged (console.error) before being sent to the frontend.

- ✅ Secure Error Handling

  - Prevents stack traces from leaking to users.

- ✅ Scalability

  - Separates validation (QuerySchema) from business logic (handleLLMQuery).
 
**Example Workflow**

1. Frontend sends:

```
{ "meterId": "meter-123", "question": "Predict failures" }

```

2. API validates → calls handleLLMQuery → fetches meter data → queries OpenAI.

3. API responds:

```
{ "answer": "Failure risk: 12% (rising temperature trend)." }
```
4. Frontend displays the answer:

![image](https://github.com/kukuu/digital-twin-v2/blob/main/llm-fe-ans.png)

[TO BE COVERED] 

Authentication (e.g., JWT checks), Rate limiting, Streaming responses

## Breakdown of the React TypeScript component for SPYDER Digital Twin app's LLM interface:

**1. Component Purpose**

- This LLMInterface component provides a user-friendly way to:

  - Ask natural language questions about specific meters (e.g., "Predict failures for Meter-123")

  - Display the LLM's responses

- Handle loading/error states

**2. Code Structure**

- A. Props & State

```
interface LLMInterfaceProps {
  meterId: string;  // Required prop: ID of the meter to query
}

const [query, setQuery] = useState<string>("");        // User's question
const [answer, setAnswer] = useState<string>("");      // LLM's response
const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
```
  - Type Safety: Explicitly defines meterId as a required string prop.

  - State Management:

    - query: Tracks the input field value.

    - answer: Stores the LLM's response.

    - isLoading: Manages UI during API calls.


- B. Core Function: handleSubmit

```
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
```

  - Sets loading state (isLoading = true) → shows spinner/disabled button.

    - Calls Supabase Function:

      - Invokes your backend endpoint (llm/query).

      - Sends { meterId, question } as JSON.

  - Handles Response:

    - Success: Updates answer with LLM response.

    - Error: Displays user-friendly error message.

  - Resets loading state (in finally block).

- C. UI Rendering

```
return (
  <div className="p-4 border rounded-lg">
    {/* Input Field */}
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}  // Updates `query` state
      placeholder="Ask about this meter..."
      className="w-full p-2 mb-2 border rounded"  // Tailwind CSS classes
    />

    {/* Submit Button */}
    <button
      onClick={handleSubmit}
      disabled={isLoading}
      className={`px-4 py-2 rounded ${
        isLoading ? "bg-gray-400" : "bg-blue-600 text-white"
      }`}
    >
      {isLoading ? "Processing..." : "Ask AI"}
    </button>

    {/* Response Display */}
    {answer && (
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <strong>Response:</strong> {answer}
      </div>
    )}
  </div>
);
```
  - Input Field: Binds to query state, updates on keystrokes.

  - Button:

    - Disables during loading.

    - Changes appearance based on state.

  - Response Area:

    - Only shows when answer exists.

Formats errors with "Error:" prefix.

**3. Key Features**

- ✅ Type Safety

    - Props and state are strictly typed (string, boolean).

- ✅ User Experience

  - Loading state prevents duplicate submissions.
  
  - Clear error messages.

- ✅ Styling

    - Uses Tailwind CSS for responsive design.

- ✅ Integration

    - Connects to your Supabase Function (llm/query).

**4. Workflow Example**

  - User types: "Is Meter-123 overheating?"
  
  - Clicks "Ask AI":
  
  - Button disables → shows "Processing..."
  
  - API call to Supabase Function.
  
  - On Success:
  
    - Displays: "Response: Meter-123 shows a 5% temperature anomaly."
  
  - On Error:
  
    - Displays: "Error: Failed to fetch meter data."
   
      ![image](https://github.com/kukuu/digital-twin-v2/blob/main/llm-fe-ans.png)

 **5. Integration with Backend**
```
// Expected API response shape
interface APIResponse {
  answer: string;
  error?: string;
}

```
  - Suggested Improvements
    - Debounce Input: Prevent rapid API calls.

    - Markdown Support: Format LLM responses with bold/line breaks.

    - Retry Logic: Add a "Retry" button for errors.

## CI/CD & Deployment of env variales to Render and Vercel 

In here we cover step-by-step guide to securely deploying your environment variables (SUPABASE_URL, SUPABASE_KEY, OPENAI_KEY) to Render (backend) and Vercel (frontend) for SPYDER Digital Twin app:

![image](https://github.com/kukuu/digital-twin-v2/blob/main/env-vars-overvue.png)

- Deployment to Render (Backend)

  - A. Method 1: Render Dashboard
    - Go to your Render dashboard → Select your backend service.
    - Navigate to Environment → Environment Variables.
    - Add each variable:
```
SUPABASE_URL = https://your-project-ref.supabase.co
SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_KEY = sk-your-openai-key
```
  - Click Save. Render automatically restarts your service.
