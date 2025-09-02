#  Nut Cracker 

### Digital Twin (V4)

The primary objective of **Nut Cracker** is to leverage emerging, cutting-edge technologies, including Artificial Intelligence (AI) and Machine Learning (ML), to streamline the transaction process involving data generation, processing, and transformation - ETL. This process focuses on real-time data sourced from distributed and disparate networks and systems. 

Key functionalities include:

**Predictive Analysis**: Utilizing AI to identify patterns, trends, and anomalies such as spikes, valleys, and boundaries, enabling predictive maintenance and detecting outliers or tampered data.

**Visualization and Reporting**: Generating comprehensive visualization reports, graphs, and documentation to review real-time system performance. These tools aid in forecasting and enhancing productivity by providing actionable insights, real-time monitoring, optimisation, improving efficiency, reducing costs, and enhancing decision-making.
  

Nut Cracker aims to integrate advanced technologies to optimize data workflows, deliver predictive insights, and provide robust visualization tools for performance monitoring and future planning. As a  high-volume throughput system, it exemplifies real-time asynchronous data processing capability ensuring scalability, reliability, flexibility, observability, security and  addresses challenges like schema evolution and fault tolerance.

Python is core in this innovation.

# Content of the Repository

Contains the routes for apis to be used by main.py
Following are the apis:
1. routes_data.py - latest data fetching, historical data fetching, archival of data
2. routes_generator.py - generate one data record
3. routes_inference.py - forecast prediction

### core:
Contains config file

### models:
schema.py file for validating the input paramtere data type for the data fetching apis

### services:
These services are used in apis for performing particular actions.
Following are the services:
1. archive.py - function to archive given data dictionary
2. generator.py - generate one data record at a time
3. preprocess.py - perform basic preprocessing on the data

### trained_models:
Contains forecasting model's weights, configuration, and scalar to be used in routes_inference.py file for api to perform inference(prediction).

### main.py
A file which is the entry point of the application to access all apis.
To access the apis, run this file with following command
`uvicorn main:app --reload`

## notebooks
### energy_generation_synthetic_data.ipynb
This file contains function to generate synthetic data for electricity consumption based on manually introduced conditions that are set in order to mimic real-life patterns of electricity usage. Any time period can be defined and the data will be generated with fluctuations to a base reading based on following conditions:

- Higher level readings on weekends
- High usage on time between 10am to 9pm
- lower or closer to base reading at migdnight
- 0.1% chance of recording an outlier
- 5% chance of a null value
- 0.1% chance of system shutdown and tempered meter readings

### Data_processing.ipynb
Code in this file is designed to detect the Null values, duplicate values and outliers. After detection these values are replaced using KNN(K-Nearest Neighbours) Imputer.
The KNN imputer is a technique used to fill missing data by using the values of the nearest neighbors in the dataset. It works by identifying the 'K' most similar data points (neighbors) to the missing data point based on distance metrics, and then imputing the missing value as the average (or weighted average) of those neighbors. This approach assumes that similar data points have similar values.

### Data_archival.ipynb
Code in this notebook is designed to store generated data in a archived folder. It is stored in following structure:

 - data
     - Archive
         - Year
             - Month(number)
                 - week.csv

### LLM_integration.ipynb
Experimention for utilizing a LLM model(Mistral) using huggingface for genrating SQL queries and after parsing, running it in supabase.

### timeseries_forecasting.ipynb
Code for SARIMA and LSTM model using pytorch.

## Note - For running pytorch on GPU
If you have NVIDIA compatible GPU on your system, check with following,
`nvidia-smi` on command prompt.
Make sure your python verison is below 3.12
If you don't have CUDA, please install from https://developer.nvidia.com/cuda-toolkit-archive.
Additionally, download cuDNN library from https://developer.nvidia.com/cudnn.
Further, install CUDA compatible pytorch version. Go to https://pytorch.org/get-started/locally/ and select your preferences to get the pip/conda command to install compatible pytorch.

# Additional Files
## cumulative_readings_data.csv
This csv file is the output of synthetic data generation methods from data-generation branch

## requirements.txt
This file contains python packages to install at once using `pip install -r requirements.txt`

## runbook.md
Instructions to setup python.

# TASK
https://github.com/kukuu/digital-twin-PV4-/blob/main/README.md

# Solution Specifications

https://github.com/kukuu/digital-twin-PV4-/tree/main

# Repository
https://github.com/kukuu/digital-twin-PV4-/blob/digi-twin-PV4-v1-data-generation/energy_consumption_synthetic_data.ipynb

# Further reading..

- https://github.com/kukuu/digital-twin-v2/blob/main/AI_LLM_integration.md
- https://github.com/kukuu/digital-twin-v2/blob/main/nodejs-LLM-implementation.md
- https://github.com/kukuu/digital-twin-v2/blob/main/LLM-SPYDER-code-documentation.md
- https://github.com/kukuu/digital-twin-v2/blob/main/LLM-table-model.png
- https://github.com/kukuu/digital-twin-v2/blob/main/LLM%3ANLP-%20troubleshooting.png
- https://github.com/kukuu/digital-twin-v2/blob/main/MLL-installations.png
- https://github.com/kukuu/digital-twin-v2/blob/main/MLL-types.png
- https://github.com/kukuu/digital-twin-v2/blob/main/env-vars-overvue.png
- https://github.com/kukuu/digital-twin-v2/blob/main/llm-fe-ans.png

