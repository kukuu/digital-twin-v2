# Digital Twin

Digital twin is a dynamic, virtual representation of a physical object, process, or system. It mirrors the real-world entity by continuously collecting data from sensors, IoT devices, and other sources. This data is then processed and analyzed to create a digital replica that accurately reflects the behavior, status, and condition of its physical counterpart. By leveraging advanced technologies such as artificial intelligence, machine learning, and predictive analytics, digital twins can simulate various scenarios and predict future outcomes. This enables stakeholders to monitor performance, diagnose issues, optimize processes, and make data-driven decisions in real-time. 

This development covers:

1. Cloud deployment and hosting to AWS computing services Render for  interfacing.
2. Superbase as ORM to host connection to Database and store environmental variables.
3. Vercel to host connection and configuration to  versioning and source control of code repository in GitHub. 
4. Updated UI to dynamically calculate the cost of Meter Reading cumulatively.    


## Frontend is hosted on Vercel
 
https://digital-twin-v2-chi.vercel.app/

## Backend is histed on Render

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

 
## AI / LLM Integration

https://github.com/kukuu/digital-twin-v2/blob/main/AI_LLM_integration.md

