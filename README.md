# Digital Twin

https://www.energytariffscheck.com/

Digital twin is a dynamic, virtual representation of a physical object, process, or system. It mirrors the real-world entity by continuously collecting data from sensors, IoT devices, and other sources. This data is then processed and analyzed to create a digital replica that accurately reflects the behavior, status, and condition of its physical counterpart. By leveraging advanced technologies such as artificial intelligence, machine learning, and predictive analytics, digital twins can simulate various scenarios and predict future outcomes. This enables stakeholders to monitor performance, diagnose issues, optimize processes, and make data-driven decisions in real-time.  
 
This development covers: 
 
1. Cloud deployment and hosting to AWS computing services Render for  interfacing. 
2. Superbase as ORM to host connection to Database and store environmental variables.   
3. Vercel to host connection and configuration to  versioning and source control of code repository in GitHub.  
4. Updated UI to dynamically calculate the cost of Meter Reading cumulatively.

## SPYDER
SPYDER, an AI-driven platform for the energy sector. It was designed to ingest, process, and make sense of complex energy tariff data to provide actionable insights - a similar challenge to making sense of contract and generation data for policy compliance and reporting.

It is a Net Zero initiative platform built to empower businesses and consumers with actionable insights for reducing carbon emissions and transitioning to sustainable energy. The platform, accessible at EnergyTariffsCheck.com ( https://www.energytariffscheck.com/ ), combines data analytics with user-friendly tools to compare energy tariffs, track consumption patterns, and recommend cost-effective renewable energy solutions. Its core purpose is to bridge the gap between sustainability goals and practical implementation, making it easier for organisations and individuals to contribute to a carbon-neutral future.

To develop SPYDER, I have led a cross-functional team in integrating real-time energy data, AI-driven recommendations, and policy compliance frameworks into a scalable web platform.

Key features include dynamic carbon footprint tracking, personalised energy-saving strategies, and partnerships with green energy providers. By simplifying complex energy decisions, SPYDER - https://www.energytariffscheck.com/  has helped users reduce costs while accelerating their Net Zero journeys - proving that technology can be a catalyst for both environmental and economic impact.   


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
 First you need to start the service by running : 
 
 ```
node server2.js
```
 
 Then start the react app by running : 

```

npm run start

```

 
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

    - Supabase Row-Level Security (RLS) for data access control preferably where ANOn  access is defined else use Service Key.

    - AWS KMS to encrypt sensitive LLM inputs/outputs.
 


## Core Backend Dependencies:

Express.js - Web server framework

Socket.IO - Real-time communication

Supabase JS - Database and authentication

OpenAI - LLM integration

HuggingFace Inference - NLP capabilities

- Security & Authentication:

Clerk SDK - User authentication

JWT - Token handling

Helmet - Security headers

bcryptjs - Password hashing

CORS - Cross-origin requests

- Data Processing & Utilities:

Natural - Natural language processing

Chart.js & React-Chartjs-2 - Data visualization

Moment.js - Date handling

UUID - Unique identifiers

File & Data Handling:
Multer - File uploads

Body-parser - Request body parsing

Compression - Response compression

## Development Tools:

Nodemon - Development server

Jest - Testing framework

ESLint & Prettier - Code formatting

TypeScript - Type definitions

## Security & Authentication:

Clerk SDK - User authentication

JWT - Token handling

Helmet - Security headers

bcryptjs - Password hashing

CORS - Cross-origin requests

## Data Processing & Utilities:

Natural - Natural language processing

Chart.js & React-Chartjs-2 - Data visualization

Moment.js - Date handling

UUID - Unique identifiers

File & Data Handling:
Multer - File uploads

Body-parser - Request body parsing

Compression - Response compression

## Scripts Available:
```
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run lint       # Check code quality
npm run lint:fix   # Fix code style issues
npm run setup      # Full setup with environment creation
```

##  LLM-NLP Quick Start Commands

-  Backend Setup & Run

```
# Navigate to backend directory
cd backend/LLM-NLP

# Install dependencies
npm install

# Create environment file (if not exists)
cp .env.example .env

# Edit environment variables (use your preferred editor)
nano .env  # or code .env or vim .env

# Validate environment configuration
npm run validate

# Start development server
npm run dev

# Or start production server
npm start

```

- Frontend Setup & Run

```
# Navigate to frontend directory  
cd frontend/LLM-NLP

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env  # or code .env or vim .env

# Start development server
npm start

# Build for production
npm run build
```

- Run Both Together (Different Terminals)

# Terminal 1 - Backend
cd backend/LLM-NLP && npm run dev

# Terminal 2 - Frontend  
cd frontend/LLM-NLP && npm start

## Package.json Scripts Reference

```
# Development
npm run dev          # Start with nodemon (auto-restart)

# Production
npm start            # Start production server

# Validation & Setup
npm run validate     # Check environment variables
npm run setup        # Full setup (install + env creation)

# Testing
npm test             # Run Jest tests
npm run lint         # Check code quality
npm run lint:fix     # Fix code style issues

```

## Frontend Scripts (frontend/LLM-NLP/package.json):

```
# Development
npm start            # Start React dev server (port 3000)

# Build & Test
npm run build        # Create production build
npm test             # Run tests
npm run eject        # Eject from Create React App

# Additional (if configured)
npm run validate     # Validate environment
```

## 🔧 Environment Setup Commands

# Terminal 1 - Start Backend
cd backend/LLM-NLP
npm run dev

# Terminal 2 - Start Frontend  
cd frontend/LLM-NLP
npm start

# Terminal 3 - Run tests (optional)

``` 

cd backend/LLM-NLP

npm test

```

## 🐛 Troubleshooting Commands
If you encounter issues:

```

# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 14+ (16+ recommended)

# Validate environment
npm run validate

# Check if ports are available
lsof -ti:3000  # Frontend port
lsof -ti:5000  # Backend port

# Kill processes on occupied ports
kill -9 $(lsof -ti:3000)  # Be careful with this!
kill -9 $(lsof -ti:5000)

```

- 📊 Verification Commands
Check if servers are running:

# Backend health check
curl http://localhost:5000/health

# Frontend check (in browser)
open http://localhost:3000

# Check Supabase connection
curl http://localhost:5000/api/test-db

## Environment validation:

# Manual environment check

```
cd backend/LLM-NLP
node -e "console.log('Node version:', process.version)"
node -e "console.log('PORT:', process.env.PORT || 'Not set')"
```


## 🎯 Quick Reference Cheat Sheet

```
# 🏃‍♂️ Quick Start
cd backend/LLM-NLP && npm run dev
cd frontend/LLM-NLP && npm start

# 🛠️ Setup
npm install              # Install dependencies
cp .env.example .env     # Create env file
nano .env                # Configure environment

# ✅ Validation  
npm run validate         # Check environment
node scripts/validate-env.js  # Manual validation

# 🐛 Troubleshooting
npm cache clean --force  # Clear cache
rm -rf node_modules      # Remove dependencies
npm install              # Reinstall

```

## ⚡ One-Liner to Start Everything (Using concurrently):

```
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend/LLM-NLP && npm run dev",
    "dev:frontend": "cd frontend/LLM-NLP && npm start"
  }
}
```

Then install concurrently and run:

```
npm install -g concurrently
npm run dev
```

- The application will be available at:

i. Frontend: http://localhost:3000

ii. Backend API: http://localhost:5000

iii. Health Check: http://localhost:5000/health
```
