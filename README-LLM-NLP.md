# Documentation

## Updated server2.js with Peak Usage Simulation

Updated server2.js code that simulates UK home electricity usage patterns with peak hours (4:00 PM to 7:00 PM):

## Key Changes Made to server2.js:

- Enhanced generateReading function:

i. Added time-based consumption patterns

ii. Peak hours (4PM-7PM) increase consumption by 1.5x to 2x

iii. Overnight hours (11PM-6AM) reduce consumption to 50-70% of normal

iv. Morning and evening hours have slightly elevated consumption

- Added getCurrentConsumptionRate function:

i. Provides a textual description of the current consumption rate

ii. Helps clients understand whether it's peak, off-peak, or normal hours

- Enhanced WebSocket emissions:

i. Added consumption rate information to the data sent to clients

ii. Added timestamp for better tracking

- Improved logging:

i. Added startup message about the simulation pattern

ii. This updated code now realistically simulates UK household electricity consumption patterns with higher usage during peak evening hours and lower usage overnight, providing a more accurate representation of real-world energy usage.

## 1. The Core Building Block: Math.random()

i. First, it's crucial to understand what Math.random() does on its own.

ii. Function: Math.random() is a JavaScript function that generates a pseudo-random number.

iii. Range: It returns a floating-point (decimal) number.

Minimum: 0 (inclusive, meaning it can be 0)

Maximum: 1 (exclusive, meaning it can get very close to 1, like 0.9999, but never actually be 1)

So, every time you call Math.random(), you get a random number in the range [0, 1) (from 0 inclusive to 1 exclusive).

##  Scaling with Multiplication: Math.random() * N
Multiplying Math.random() by a number N scales its output range.

New Range: [0, N)

The result will be a random number between 0 and N, where it can include 0 but will never quite reach N.

Examples:

Math.random() * 10 produces a random number between [0, 10)

Math.random() * 100 produces a random number between [0, 100)

##  Applying this to the Code Snippet
Now, let's look at the specific lines in your code and their purpose.

a) consumptionRate *= (0.5 + Math.random() * 0.2);
This line is used for the overnight reduction.

Math.random() * 0.2: This generates a random number between [0, 0.2).

0.5 + ...: We then add this random number to 0.5. This creates a final multiplier between [0.5, 0.7).

Minimum: 0.5 + 0 = 0.5

Maximum: 0.5 + ~0.2 = ~0.7 (e.g., 0.699999)

consumptionRate *= ...: The base consumptionRate is multiplied by this random value between 0.5 and ~0.7.

Why? This simulates that overnight (11 PM - 6 AM), consumption is reduced to 50% to 70% of the normal base rate. The randomness (* 0.2) adds natural variability—some nights people use a bit more electricity (e.g., leaving a light on), some nights they use a bit less.

b) consumptionRate *= (1.5 + Math.random() * 0.5);
This line is used for the peak hour boost.

Math.random() * 0.5: This generates a random number between [0, 0.5).

1.5 + ...: We add this random number to 1.5. This creates a final multiplier between [1.5, 2.0).

Minimum: 1.5 + 0 = 1.5

Maximum: 1.5 + ~0.5 = ~2.0 (e.g., 1.999999)

consumptionRate *= ...: The base consumptionRate is multiplied by this random value between 1.5 and ~2.0.

Why? This simulates the core requirement: during peak hours (4 PM - 7 PM), consumption increases to 1.5x to 2x the normal base rate. The randomness (* 0.5) models the natural variation in household activity—some evenings are busier than others.




## Backend installation

cd backend && npm install \
  langchain @langchain/openai \
  @supabase/supabase-js \
  typescript @types/node \
  zod dotenv  # For type-safe envs



  https://chat.deepseek.com/a/chat/s/4489d71b-3ab5-4e00-90db-81ee968ec7bc

  - Open AI Secret Key: 


  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

  - Hugging Face Access Token:
   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

  - Generate JWT Secret: node -e "console.log('JWT_SECRET=', require('crypto').randomBytes(64).toString('hex'))"

  - JWT_SECRET= 5cb85cda31d53d851ad7d740e4abe0e5783c857536c0f8b119c44cbf04b54f83e535f498ee79c87a0e2f0e47f095fc91adc43a6a113e24aa9fa58fee71186d65



## Create the .env file

cd backend/LLM-NLP

touch .env

Complete .env File Content



## SERVER CONFIGURATION


PORT=5000

NODE_ENV=development

HOST=localhost

CORS_ORIGIN=http://localhost:3000


## SUPABASE CONFIGURATION (Database & Auth)

SUPABASE_URL=https://your-project-ref.supabase.co

SUPABASE_ANON_KEY=your-supabase-anon-key-here

SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

SUPABASE_JWT_SECRET=your-supabase-jwt-secret-here


## AUTHENTICATION & SECURITY

JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long

JWT_EXPIRE=24h

JWT_REFRESH_EXPIRE=7d

CLERK_SECRET_KEY=sk_test_your-clerk-secret-key

CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key


##  AI/ML API KEYS (LLM & NLP Services)

OPENAI_API_KEY=sk-your-openai-api-key-here

HUGGINGFACE_API_KEY=hf_your-huggingface-api-key-here

HUGGINGFACE_ACCESS_TOKEN=hf_your-huggingface-access-token


##  EXTERNAL SERVICES & INTEGRATIONS

APPS_SCRIPT_URL=https://script.google.com/macros/s/your-apps-script-id/exec

GOOGLE_SHEETS_ID=your-google-sheets-id-here

PAYPAL_CLIENT_ID=your-paypal-client-id

PAYPAL_CLIENT_SECRET=your-paypal-client-secret

PAYPAL_MODE=sandbox


##  DATABASE & STORAGE

DATABASE_URL=postgresql://username:password@localhost:5432/digital_twin_db

REDIS_URL=redis://localhost:6379

UPLOAD_PATH=./uploads

MAX_FILE_SIZE=10485760


##  APPLICATION SPECIFIC SETTINGS

SOCKET_PORT=5001

SESSION_SECRET=your-session-secret-key-here

ENCRYPTION_KEY=your-32-character-encryption-key-here

AFFILIATE_TRACKING_ID=SPYDER-AFFILIATE


## RATE LIMITING & SECURITY

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100

API_TIMEOUT=30000

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000


## LOGGING & MONITORING

LOG_LEVEL=info

SENTRY_DSN=your-sentry-dsn-if-used

- How to Get Each Value:
1. Supabase Values (Get from your Supabase dashboard):

Go to your Supabase project → Settings → API

SUPABASE_URL = URL under "Config" → "URL"

SUPABASE_ANON_KEY = "anon" public key

SUPABASE_SERVICE_ROLE_KEY = "service_role" key (keep this secret!)

SUPABASE_JWT_SECRET = Project Settings → API → JWT Settings → JWT Secret

2. OpenAI API Key:

Visit https://platform.openai.com/api-keys

Create a new secret key

3. HuggingFace API Key:

Visit https://huggingface.co/settings/tokens

Create a new access token

4. JWT Secret (Generate a secure one):

# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

5. Clerk Keys (If using Clerk authentication):

Visit https://dashboard.clerk.com

Create a new application and get the keys

6. Google Apps Script URL:

This is the URL you deploy from your Google Apps Script

Format: https://script.google.com/macros/s/SCRIPT_ID/exec

Quick Setup Script
Create a setup script to generate the .env file:


# create-env.sh
#!/bin/bash

```
echo "Creating .env file for Digital Twin Backend..."

echo "# =============================================" > .env

echo "# SERVER CONFIGURATION" >> .env

echo "# =============================================" >> .env

echo "PORT=5000" >> .env

echo "NODE_ENV=development" >> .env

echo "HOST=localhost" >> .env

echo "CORS_ORIGIN=http://localhost:3000" >> .env

echo "" >> .env

echo "# =============================================" >> .env

echo "# SUPABASE CONFIGURATION" >> .env

echo "# =============================================" >> .env

echo "SUPABASE_URL=https://your-project-ref.supabase.co" >> .env

echo "SUPABASE_ANON_KEY=your-supabase-anon-key-here" >> .env

echo "SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here" >> .env

echo "SUPABASE_JWT_SECRET=your-supabase-jwt-secret-here" >> .env

echo "" >> .env

echo "# =============================================" >> .env

echo "# AI/ML API KEYS" >> .env

echo "# =============================================" >> .env

echo "OPENAI_API_KEY=sk-your-openai-api-key-here" >> .env

echo "HUGGINGFACE_API_KEY=hf_your-huggingface-api-key-here" >> .env

echo "" >> .env

echo "# =============================================" >> .env

echo "# AUTHENTICATION" >> .env

echo "# =============================================" >> .env

echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" >> .env

echo "JWT_EXPIRE=24h" >> .env

echo "JWT_REFRESH_EXPIRE=7d" >> .env

echo "" >> .env

echo "# =============================================" >> .env

echo "# EXTERNAL SERVICES" >> .env

echo "# =============================================" >> .env

echo "APPS_SCRIPT_URL=https://script.google.com/macros/s/your-apps-script-id/exec" >> .env

echo "" >> .env

echo "✅ .env file created! Please update the placeholder values with your actual API keys."

```

- Make it executable and run:

```
chmod +x create-env.sh
./create-env.sh
```

- Environment Validation Script

Create a script to validate your environment:

javascript

```
// validate-env.js
require('dotenv').config();

const requiredEnvVars = [
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET'
];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'HUGGINGFACE_API_KEY',
  'CLERK_SECRET_KEY'
];

console.log('🔍 Validating environment variables...\n');

let allRequiredPresent = true;

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    allRequiredPresent = false;
  } else {
    console.log(`✅ ${envVar}: Present`);
  }
});

console.log('\n📋 Optional environment variables:');
optionalEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.log(`⚠️  ${envVar}: Not set (optional)`);
  } else {
    console.log(`✅ ${envVar}: Present`);
  }
});

if (allRequiredPresent) {
  console.log('\n🎉 All required environment variables are set!');
  console.log('🚀 You can now start the application with: npm run dev');
} else {
  console.log('\n❌ Please set the missing required environment variables.');
  process.exit(1);
}
```

```
node validate-env.js
```

## Key Dependencies Included:

- Core Backend Dependencies:

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

## Installation Instructions:
```
cd backend/LLM-NLP
npm install
```

- Environment Setup:
Create a .env file with:

# Server Configuration
PORT=5000

NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url

SUPABASE_ANON_KEY=your-supabase-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Authentication
JWT_SECRET=your-jwt-secret-key-here

CLERK_SECRET_KEY=your-clerk-secret-key

# API Keys
OPENAI_API_KEY=your-openai-api-key

HUGGINGFACE_API_KEY=your-huggingface-api-key

# Payment Integration
PAYPAL_CLIENT_ID=your-paypal-client-id

PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Email/Apps Script
APPS_SCRIPT_URL=your-google-apps-script-url

- Scripts Available:
```
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run lint       # Check code quality
npm run lint:fix   # Fix code style issues
npm run setup      # Full setup with environment creation
```

#  Quick Start Commands

1. Backend Setup & Run

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

2. Frontend Setup & Run

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

3. Run Both Together (Different Terminals)

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

## 📊 Verification Commands
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

# Run validation script

```

npm run validate

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
