// backend/LLM-NLP/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
testConnection().then(() => {
  console.log('✅ Supabase connection established');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/readings', require('./routes/readings')); // New readings routes
app.use('/api/llm', require('./routes/llm')); // Your existing LLM routes

// Health check with database test
app.get('/health', async (req, res) => {
  try {
    const { supabase } = require('./config/database');
    // Test connection by querying readings table
    const { data, error } = await supabase.from('readings').select('count');
    
    if (error) {
      return res.status(500).json({ 
        status: 'ERROR', 
        database: 'Connection failed', 
        error: error.message 
      });
    }

    res.json({ 
      status: 'OK', 
      database: 'Connected', 
      timestamp: new Date().toISOString(),
      readings_count: data[0].count
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Connection failed', 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log(`📊 Readings API available at: http://localhost:${PORT}/api/readings`);
});