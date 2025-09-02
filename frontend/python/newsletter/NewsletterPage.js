"use client";

import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import "./Newsletter.css"; // Assuming you still have some basic CSS

// Register Chart.js components
Chart.register(...registerables);

// Define socket connection based on environment
const socket = io(
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_BACKEND_URL_PROD
    : process.env.REACT_APP_BACKEND_URL_DEV
);

// IMPORTANT: Updated meterData keys to match FastAPI/Node.js output
// This is the primary fix for the issues you're experiencing.
const meterData = {
  "SMR89133A": { // Matches MeterA_ID from FastAPI
    supplier: "Octopus Energy",
    cost: 23.28, // Cost in pence per kWh
    tariff: "Fixed",
    contact: "0808 164 1088",
    target: "https://octopus.energy/"
  },
  "SMR89133B": { // Matches MeterB_ID from FastAPI
    supplier: "EDF Energy",
    cost: 23.28,
    tariff: "Fixed",
    contact: "0333 200 5100",
    target: "https://www.edfenergy.com/"
  },
  "SMR89133C": { // Matches MeterC_ID from FastAPI
    supplier: "E.ON Next",
    cost: 25.69,
    tariff: "Standard",
    contact: "0808 501 5200",
    target: "https://www.eonnext.com/"
  }
};

// Initialize readings state based on the correct meterData structure
const getInitialReadingsState = () => {
  return Object.entries(meterData).reduce((acc, [id, info]) => {
    acc[id] = {
      ...info,
      reading: 0, // Initial reading can be 0 or some default
      total: 0,   // Initial total cost
    };
    return acc;
  }, {});
};

export default function EnergyMeter() {
  const [readings, setReadings] = useState(getInitialReadingsState);
  const [historicalData, setHistoricalData] = useState({});
  const [isReadingActive, setIsReadingActive] = useState(true);

  // Effect to handle WebSocket communication
  useEffect(() => {
    const updateReading = ({ meter_id, reading }) => {
      setReadings((prevReadings) => {
        // Now meterData[meter_id] will correctly find the meter's info
        const currentMeterInfo = meterData[meter_id];
        if (!currentMeterInfo) {
          console.warn(`Meter ID ${meter_id} not found in meterData. Check your IDs.`);
          return prevReadings; // Don't update if meter ID is unknown
        }

        const newReadingData = {
          ...currentMeterInfo,
          reading: reading.toFixed(2), // Format the reading
          total: ((reading * currentMeterInfo.cost) / 100).toFixed(2), // Calculate total cost
        };

        return {
          ...prevReadings,
          [meter_id]: newReadingData,
        };
      });

      // Update historical data for the chart, keeping only the last 20 readings
      setHistoricalData(prev => ({
        ...prev,
        [meter_id]: [
          ...(prev[meter_id] || []),
          { reading, timestamp: new Date().toLocaleTimeString() }
        ].slice(-20) // Keep only the last 20 data points for performance/display
      }));
    };

    socket.on("newReading", updateReading);

    // Clean up the event listener when the component unmounts
    return () => socket.off("newReading", updateReading);
  }, []); // Empty dependency array means this effect runs once on mount

  // Functions to control reading emission from the backend
  const stopReading = () => {
    socket.emit("stopReading");
    setIsReadingActive(false);
  };

  const startReading = () => {
    socket.emit("startReading");
    setIsReadingActive(true);
  };

  // Component for displaying a single meter row and its chart
  const MeterRow = ({ meterId, data }) => {
    const chartData = {
      labels: historicalData[meterId]?.map(entry => entry.timestamp) || [],
      datasets: [{
        label: 'Energy Usage (kWh)',
        data: historicalData[meterId]?.map(entry => entry.reading) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: false
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: `Usage for ${meterId}`
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time'
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Reading (kWh)'
          }
        }
      },
      // FIX: Disable all chart animations
      animation: false // This line is added/modified
    };

    return (
      <div className="meter-row-wrapper">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              {`Meter ${meterId}`}
              <span className="status-indicator">
                <span className={`ping ${isReadingActive ? "active" : "stopped"}`}></span>
                <span className={`dot ${isReadingActive ? "active" : "stopped"}`}></span>
              </span>
            </div>
          </div>
          <div className="card-content">
            <div className="reading-display">
              <span>{data.reading}</span>
              <span className="unit">kWh</span>
            </div>
            <div className="other-display">
              <span className="unit2">Supplier:</span>
              <span>{data.supplier}</span>
            </div>
            <div className="other-display">
              <span className="unit2">Tariff:</span>
              <span>{data.tariff}</span>
            </div>
            <div className="other-display">
              <span className="unit2">Cost per kWh:</span>
              <span>{data.cost}p</span>
            </div>
            <div className="other-display">
              <span className="unit2">Total Cost:</span>
              <span>£{data.total}</span>
            </div>
            <div>Contact: {data.contact}</div>
            {data.target && (
              <div className="target-link">
                <a href={data.target} target="_blank" rel="noopener noreferrer">
                  Find out more!
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="meter-graph">
          <Line
            data={chartData}
            options={chartOptions}
          />
        </div>
      </div>
    );
  };


  // Component to render all meter rows in a grid
  const MeterGrid = () => (
    <div className="meter-grid">
      {Object.keys(readings).length === 0 ? (
        <p>Initializing meter readings...</p> // More descriptive loading state
      ) : (
        Object.entries(readings).map(([meterId, data]) => (
          <MeterRow
            key={meterId} // Key is stable and unique for each meterId
            meterId={meterId}
            data={data}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2 style={{ fontWeight: "bold", color: "green" }}>SPYDER</h2>
        </div>
      </nav>

      <div className="container">
        <h3 className="title">Smart Energy Meter Reader</h3>
        <p className="app-description">
          The **SPYDER** Digital Twin Smart Energy Meter Reader displays real-time energy consumption from your smart meters.
        </p>

        <MeterGrid />

        <div className="button-container">
          {isReadingActive ? (
            <button onClick={stopReading} className="stop-button">
              Stop Readings
            </button>
          ) : (
            <button onClick={startReading} className="start-button">
              Start Readings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}