# Nut Cracker:  Mission

Aims to optimise https://digital-twin-v2-chi.vercel.app/ by building a real-time, AI-powered digital twin system for electric meters by managing high-throughput data pipelines involving data generation, transformation (ETL), analysis, and storage. Its mission is to:
- Streamline real-time data flow.
- Enable predictive analytics, anomaly detection, and outlier identification using AI/ML.
- Provide comprehensive dashboards and visualizations for system performance and forecasting.
- Build a scalable and secure architecture for data integration and transformation.
- Support LLM and RAG-based insights through interactive queries using Python-based FastAPI backend, connected to a React frontend.

## Technologies and Libraries 
_Programming Languages_:

- Python, Node.js
- Databases and Storage
- Supabase (PostgreSQL)
- Vector DBs (Pinecone/Chroma/FAISS)(Planned)
- Data Streaming and Processing(Planned)
- Apache Kafka, RabbitMQ
- Apache Flink, Spark
- ML & Forecasting
- ARIMA, SARIMA, LSTM (TensorFlow / PyTorch)
- Scikit-learn, Pandas, NumPy
- LangChain, OpenAI APIs, open-source APIs (LLMs, RAG)
- Visualization & Monitoring
- Plotly, Matplotlib(On-going)
- Web Frameworks
- FastAPI, Express (Used)
- Django (possible future integration)

_Frontend_:
- React, NextJS, Tailwind CSS
- WebSockets for real-time updates

## Challenges:
The biggest challenge developing this initial stage of development was mostly experimentation with AI models for forecasting and LLM exploration. 
Since the data is generated randomly even though with some conditions, it is difficult for the model to account for that randomness.

Secondly, for integrating LLM with the meter readings database we are exploring direct approaches as well as efficient approaches. For direct approaches we are planning to add the entire database in vectordb so that model can work with the entire database. On the other hand, we want to experiment with agents who can do LLM based tasks more efficiently on their own without having to add the entire data(updating live) in vectordb which will not be memory efficient. These agents will fetch and process the data by understanding the user’s query. They have this ability to navigate steps to take on their own.

## Summary of current work

- Synthetic data generation: Created a class called “EnergyDataGenerator” to provide one row of data at a time which can be used with FastAPI to display data on react frontend.

- Data processing and Archival: Dealing with Null values, outliers, duplicate values as well as storing data in archival folders based on weeks.

- Forecasting – Developing time series forecasting model with SARIMA and LSTM. Planned to integrate this model with FastAPI to be used on frontend.
API integration – To be used for adding generated data, fetching data from supabase, adding forecasting model
