# Digital Twin

https://digital-twin-v2-chi.vercel.app/

Digital twin is a dynamic, virtual representation of a physical object, process, or system. It mirrors the real-world entity by continuously collecting data from sensors, IoT devices, and other sources. This data is then processed and analyzed to create a digital replica that accurately reflects the behavior, status, and condition of its physical counterpart. By leveraging advanced technologies such as artificial intelligence, machine learning, and predictive analytics, digital twins can simulate various scenarios and predict future outcomes. This enables stakeholders to monitor performance, diagnose issues, optimize processes, and make data-driven decisions in real-time. 

This development covers:
 
1. Cloud deployment and hosting to AWS computing services Render for  interfacing. 
2. Superbase as ORM to host connection to Database and store environmental variables.   
3. Vercel to host connection and configuration to  versioning and source control of code repository in GitHub.  
4. Updated UI to dynamically calculate the cost of Meter Reading cumulatively.    


## Frontend is hosted on Vercel
  
https://digital-twin-v2-chi.vercel.app/

## Backend is hosted on Render

https://dashboard.render.com/web/srv-csdkb5g8fa8c73f5vpg0/logs

## Code Repository: 

https://github.com/kukuu/digital-twin-v2

## Production (Hosted by Render on AWS Computing Service): 

https://digital-twin-v2-chi.vercel.app/


## Supabase

https://supabase.com/dashboard/project/wqcbpdnltpmdhztxojes/editor/35802?schema=public

## Preview: 


Manually Create the Table: Go to your Supabase project, navigate to SQL Editor, and run the following SQL to create the readings table:

```sql
 
CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  meter_id VARCHAR(255),
  reading FLOAT,
  timestamp TIMESTAMP
);

```
### Execution steps

 First open two terminals.
 Then CD into frontend and backend
 First you need to start the service by running : node server2.js
 Then start the react app by running : npm run start 

 
## AI / ML/ LLM Integration

- https://github.com/kukuu/digital-twin-v2/blob/main/AI_LLM_integration.md
- https://github.com/kukuu/AI-ML-LLM-NLP-integration


### Core Dependencies to Add

- For LLM Integration:

    - i. LLM Framework:

        - OpenAI API (GPT-4) or Llama 3 (self-hosted via Hugging Face)

        - LangChain (orchestration) for workflow automation (e.g., connecting to Supabase/Sensors).

        - Embedding Models: OpenAI’s text-embedding-3-small or BAAI/bge-small-en-v1.5 (for semantic search).

### Vector Database:

Supabase Vector (PostgreSQL PGVector extension) or Pinecone (for scalable storage of embeddings).

- Data Pipeline:

    - AWS Lambda (triggered by sensor data updates) to preprocess and feed data to the LLM.

    - Supabase Webhooks (to detect new meter readings/events).

- For Enhanced Digital Twin Features:

    - Real-time Analytics:

    - TimescaleDB (time-series extension for Supabase) to optimize sensor data storage.

- Predictive AI:

    - PyTorch/TensorFlow (custom models for anomaly detection) + LangChain Agents (for action recommendations).

### Implementation Steps

**Data Flow & LLM Integration**

- Ingest Sensor Data:

    - Use Supabase’s Realtime API to stream meter readings to the LLM pipeline.

    - Store raw data in Supabase (readings table) and embeddings in PGVector.

- LLM Contextualization:

    - LangChain Setup:
 
- Actionable Outputs:

    - Dynamic UI Updates:

    - Connect LLM outputs to your Vercel-hosted frontend via WebSockets (Supabase Realtime).

- Alerts/Simulations:

    - Use AWS EventBridge to trigger alerts or update the digital twin’s 3D visualization.


**Infrastructure Upgrades**

- AWS Services:

    - SageMaker (optional): Fine-tune domain-specific LLMs using historical sensor data.

    - EC2/ECS (if self-hosting Llama 3).

- Security:

    - Supabase Row-Level Security (RLS) for data access control.

    - AWS KMS to encrypt sensitive LLM inputs/outputs.
