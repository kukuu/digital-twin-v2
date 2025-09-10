// backend/LLM-NLP/config/database.js
const { createClient } = require('@supabase/supabase-js');

// These environment variables should be already loaded from the main entry point
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validate that environment variables exist
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testConnection = async () => {
  try {
    // Test connection by querying the readings table
    const { data, error } = await supabase.from('readings').select('count');
    
    if (error) {
      console.error('Supabase connection error:', error.message);
      throw error;
    }
    
    console.log('✅ Supabase connected successfully');
    console.log(`📊 Readings table contains ${data.length} records`);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    throw error;
  }
};

module.exports = { testConnection, supabase };
