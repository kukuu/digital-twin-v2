const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file

const { createClient } = require("@supabase/supabase-js"); // Supabase import

const app = express();
const server = http.createServer(app);

// Determine the origin for CORS based on environment
const ORIGIN =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_FRONTEND_URL_PROD // Use env var for production frontend URL
    : "http://localhost:3000"; // Your local React frontend URL

const io = new Server(server, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Supabase Client Initialization
// Ensure SUPABASE_URL and SUPABASE_KEY are set in your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key is missing. Please set SUPABASE_URL and SUPABASE_KEY in your .env file.");
  process.exit(1); // Exit if credentials are not set
}
const supabase = createClient(supabaseUrl, supabaseKey);


// The URL of your FastAPI generate endpoint
const FASTAPI_GENERATE_URL = "http://localhost:8000/api/generate";

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  let isReadingStopped = false; // Track if readings have been stopped for this specific socket
  let emitInterval; // This variable is scoped to each client connection
  let readingsBuffer = []; // Buffer to store readings before batch insertion
  const BATCH_SIZE = 24; // Number of records to batch before inserting into Supabase

  // Function to flush the readings buffer to Supabase
  const flushBufferToDb = async () => {
    if (readingsBuffer.length === 0) {
      console.log(`Buffer for socket ${socket.id} is empty, no data to flush.`);
      return;
    }

    const dataToInsert = [...readingsBuffer]; // Copy buffer content
    readingsBuffer = []; // Clear the buffer immediately

    console.log(`Flushing ${dataToInsert.length} records to Supabase for socket ${socket.id}...`);
    try {
      // Supabase table is named 'meter_readings'
      // And it has columns like: timestamp (timestamptz), meter_id (text), reading (numeric)
      const { data, error } = await supabase.from("meter_readings").insert(dataToInsert);

      if (error) {
        console.error(`Error inserting batch for socket ${socket.id}:`, error.message);
      } else {
        console.log(`Successfully inserted ${dataToInsert.length} records for socket ${socket.id}.`);
      }
    } catch (err) {
      console.error(`Unexpected error during Supabase flush for socket ${socket.id}:`, err);
    }
  };

  // Function to stop emitting readings (clears the interval, flushes buffer, and sets flag)
  const stopEmittingReadings = async () => { // Made async to await flushBufferToDb
    if (emitInterval) {
      clearInterval(emitInterval);
      console.log(`Stopped emitting for socket: ${socket.id}. Interval ID: ${emitInterval}`);
      emitInterval = null; // Clear the reference
    }
    isReadingStopped = true;
    // IMPORTANT: Flush any remaining data in the buffer immediately
    await flushBufferToDb();
  };

  // Function to start emitting readings fetched from FastAPI
  const startEmittingReadings = () => {
    // IMPORTANT: Clear any existing interval before starting a new one for this socket
    stopEmittingReadings(); // Call the stop function to ensure clean slate

    isReadingStopped = false; // Ensure flag is false when starting

    emitInterval = setInterval(async () => {
      if (isReadingStopped) {
        console.log(`Skipping API fetch for socket ${socket.id}: Readings are stopped.`);
        return;
      }

      try {
        console.log(`Fetching data from FastAPI for socket ${socket.id}...`);
        const res = await fetch(FASTAPI_GENERATE_URL);
        const data = await res.json();

        //Add buffer to supabase
        readingsBuffer.push(data)

        // Prepare data for Supabase insertion and frontend emission
        const readingsToProcess = [
          { meter_id: data.MeterA_ID, reading: data.MeterA_reading },
          { meter_id: data.MeterB_ID, reading: data.MeterB_reading },
          { meter_id: data.MeterC_ID, reading: data.MeterC_reading },
        ];

        for (const { meter_id, reading } of readingsToProcess) {

          // Emit to frontend immediately (no change here)
          socket.emit("newReading", { meter_id, reading: reading });
          // console.log(`Emitting to client ${socket.id}: ${meter_id}: ${reading}`); // For debugging
        }

        // Check if buffer is full and flush
        if (readingsBuffer.length >= BATCH_SIZE) {
          console.log(`Buffer full (${readingsBuffer.length} records), initiating flush for socket ${socket.id}.`);
          await flushBufferToDb();
        }

      } catch (err) {
        console.error(`Error fetching readings from FastAPI or processing for socket ${socket.id}:`, err);
        // IMPORTANT: If API fails, flush any existing data to prevent loss
        await flushBufferToDb(); // Flush buffer on API error
      }
    }, 2000); // Emit every 2 seconds

    console.log(`Started emitting for socket: ${socket.id}. New Interval ID: ${emitInterval}`);
  };

  // Start emitting when the client connects
  startEmittingReadings();

  // Handle 'stopReading' event from the client
  socket.on("stopReading", async () => { // Made async to await stopEmittingReadings
    console.log(`Meter Readings Stopped by client: ${socket.id}`);
    await stopEmittingReadings(); // Use the dedicated stop function
  });

  // Handle 'startReading' event from the client to resume
  socket.on("startReading", () => {
    if (isReadingStopped) { // Only resume if it was previously stopped
      console.log(`Meter Readings Resumed by client: ${socket.id}`);
      startEmittingReadings(); // Restart the interval
    } else {
      console.log(`Start reading requested for socket ${socket.id}, but already active.`);
    }
  });

  // Clean up on socket disconnect
  socket.on("disconnect", async () => { // Made async to await stopEmittingReadings
    console.log(`User disconnected from WebSocket: ${socket.id}`);
    await stopEmittingReadings(); // Ensure interval is cleared and buffer flushed on disconnect
  });
});

// Start the Node.js server (this server will primarily host the WebSocket)
const PORT = process.env.PORT || 3001; // Use port 3001, as per your original setup
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
  console.log(`Fetching data from FastAPI at: ${FASTAPI_GENERATE_URL}`);
});
