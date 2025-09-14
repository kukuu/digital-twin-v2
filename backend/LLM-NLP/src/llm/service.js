// backend/LLM-NLP/src/llm/service.js
const { OpenAI } = require("@langchain/openai");
const { createClient } = require("@supabase/supabase-js");
const { z } = require("zod");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const openAIApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const handleLLMQuery = async (query) => {
  try {
    const { meterId, question } = query;

    // Initialize OpenAI model
    const model = new OpenAI({
      openAIApiKey: openAIApiKey,
      temperature: 0.1,
      modelName: "gpt-3.5-turbo",
    });

    // Get recent meter readings for context
    const { data: meterData, error } = await supabase
      .from('readings')
      .select('*')
      .eq('meter_id', meterId)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // Create energy context from readings
    const consumption = meterData.map(r => r.reading);
    const avgConsumption = consumption.reduce((a, b) => a + b, 0) / consumption.length;
    
    const energyContext = `Meter ${meterId} shows average consumption of ${avgConsumption.toFixed(2)} kWh based on recent readings.`;

    // Generate AI response
    const response = await model.invoke(
      `As an energy analyst for EnergyTariffsCheck.com, analyze this query: ${question}\n\nContext: ${energyContext}\n\nProvide detailed energy insights:`
    );

    // Store analysis in Supabase
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('energy_analyses')
      .insert([
        {
          meter_id: meterId,
          question: question,
          response: response,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (analysisError) {
      console.error("Failed to store analysis:", analysisError);
    }

    return {
      answer: response,
      meterId: meterId,
      question: question,
      analysisId: analysisRecord?.[0]?.id,
      timestamp: new Date().toISOString(),
      averageConsumption: avgConsumption.toFixed(2)
    };

  } catch (error) {
    console.error("LLM Service Error:", error);
    
    // Fallback response
    return {
      answer: `I'm analyzing energy data for meter ${query.meterId}. Your question: "${query.question}" - Please try again if this fails.`,
      meterId: query.meterId,
      question: query.question,
      timestamp: new Date().toISOString(),
      mode: "fallback"
    };
  }
};

module.exports = { handleLLMQuery };
