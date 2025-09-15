// backend/LLM-NLP/src/llm/service.js
require('dotenv').config();
const { OpenAI } = require("@langchain/openai");
const { ChatOpenAI } = require("@langchain/openai");
const { createClient } = require("@supabase/supabase-js");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

// Initialize Supabase client with SERVICE ROLE KEY for backend operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // CHANGED from SUPABASE_KEY
const openAIApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables. Check your .env file for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Energy analysis schema for structured output
const EnergyAnalysisSchema = z.object({
  insights: z.string().describe("Detailed energy consumption insights and patterns"),
  recommendations: z.string().describe("Actionable energy efficiency recommendations"),
  estimatedSavings: z.string().describe("Potential cost or energy savings estimates"),
  riskFactors: z.string().describe("Any identified risks or anomalies in consumption"),
  trend: z.string().describe("Current consumption trend (increasing, decreasing, stable)")
});

// Structured output LLM
const structuredLLM = new ChatOpenAI({
  openAIApiKey: openAIApiKey,
  temperature: 0.1,
  modelName: "gpt-3.5-turbo",
}).withStructuredOutput(EnergyAnalysisSchema);

// Regular LLM for fallback
const fallbackLLM = new OpenAI({
  openAIApiKey: openAIApiKey,
  temperature: 0.1,
  modelName: "gpt-3.5-turbo",
});

const handleLLMQuery = async (query) => {
  try {
    const { meterId, question, timeframe = "30d" } = query;

    // Get meter metadata first
    const { data: meterMeta, error: metaError } = await supabase
      .from('meters')
      .select('*')
      .eq('meter_id', meterId)
      .single();

    if (metaError) {
      console.error("Meter metadata error:", metaError);
      throw new Error(`Meter ${meterId} not found in database`);
    }

    // Get recent meter readings with SERVICE ROLE privileges
    const { data: meterData, error: readingsError } = await supabase
      .from('readings')
      .select('*')
      .eq('meter_id', meterId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (readingsError) {
      console.error("Database readings error:", readingsError);
      throw readingsError;
    }

    if (!meterData || meterData.length === 0) {
      throw new Error(`No consumption data found for meter ${meterId}`);
    }

    // Calculate energy metrics
    const consumption = meterData.map(r => r.reading);
    const timestamps = meterData.map(r => new Date(r.timestamp));
    const avgConsumption = consumption.reduce((a, b) => a + b, 0) / consumption.length;
    const maxConsumption = Math.max(...consumption);
    const minConsumption = Math.min(...consumption);

    // Create detailed energy context
    const energyContext = `
METER ANALYSIS CONTEXT:
- Meter ID: ${meterId}
- Meter Type: ${meterMeta.meter_type || 'Unknown'}
- Location: ${meterMeta.location || 'Unknown'}
- Total Readings: ${consumption.length}
- Time Range: ${timestamps[timestamps.length - 1].toLocaleDateString()} to ${timestamps[0].toLocaleDateString()}
- Average Consumption: ${avgConsumption.toFixed(2)} kWh
- Peak Consumption: ${maxConsumption.toFixed(2)} kWh
- Minimum Consumption: ${minConsumption.toFixed(2)} kWh
- Consumption Range: ${(maxConsumption - minConsumption).toFixed(2)} kWh
`;

    try {
      // Use structured LLM for detailed analysis
      const analysis = await structuredLLM.invoke(
        `As an expert energy analyst for EnergyTariffsCheck.com, analyze this energy query.

USER QUERY: "${question}"

${energyContext}

Provide comprehensive energy insights focusing on patterns, efficiency opportunities, and actionable recommendations for this specific meter.`
      );

      // Store the structured analysis in Supabase
      const { data: analysisRecord, error: analysisError } = await supabase
        .from('energy_analyses')
        .insert([
          {
            meter_id: meterId,
            question: question,
            response: JSON.stringify(analysis),
            insights: analysis.insights,
            recommendations: analysis.recommendations,
            estimated_savings: analysis.estimatedSavings,
            risk_factors: analysis.riskFactors,
            trend: analysis.trend,
            average_consumption: avgConsumption,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (analysisError) {
        console.error("Failed to store analysis:", analysisError);
      }

      return {
        success: true,
        analysis: analysis,
        meterData: {
          meterId: meterId,
          meterType: meterMeta.meter_type,
          location: meterMeta.location,
          averageConsumption: avgConsumption.toFixed(2),
          peakConsumption: maxConsumption.toFixed(2),
          readingsCount: consumption.length
        },
        analysisId: analysisRecord?.[0]?.id,
        timestamp: new Date().toISOString()
      };

    } catch (structuredError) {
      console.warn("Structured LLM failed, falling back to basic LLM:", structuredError);
      
      // Fallback to basic LLM
      const fallbackResponse = await fallbackLLM.invoke(
        `As an energy analyst for EnergyTariffsCheck.com, provide insights for this query: ${question}\n\nContext: ${energyContext}\n\nProvide helpful energy analysis:`
      );

      // Store fallback analysis
      const { data: analysisRecord, error: analysisError } = await supabase
        .from('energy_analyses')
        .insert([
          {
            meter_id: meterId,
            question: question,
            response: fallbackResponse,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      return {
        success: true,
        analysis: { insights: fallbackResponse },
        meterData: {
          meterId: meterId,
          averageConsumption: avgConsumption.toFixed(2)
        },
        analysisId: analysisRecord?.[0]?.id,
        timestamp: new Date().toISOString(),
        mode: "fallback"
      };
    }

  } catch (error) {
    console.error("LLM Service Error:", error);
    
    return {
      success: false,
      error: error.message,
      answer: `I encountered an error while analyzing energy data for meter ${query.meterId}. Your question: "${query.question}" - Please try again later.`,
      meterId: query.meterId,
      question: query.question,
      timestamp: new Date().toISOString(),
      mode: "error"
    };
  }
};

// Additional helper function for batch analysis
const analyzeMultipleMeters = async (meterIds, analysisType = "general") => {
  try {
    const analyses = [];
    
    for (const meterId of meterIds) {
      const analysis = await handleLLMQuery({
        meterId: meterId,
        question: `Provide a ${analysisType} energy consumption analysis for this meter`
      });
      analyses.push(analysis);
    }
    
    return analyses;
  } catch (error) {
    console.error("Batch analysis error:", error);
    throw error;
  }
};

module.exports = { 
  handleLLMQuery, 
  analyzeMultipleMeters,
  EnergyAnalysisSchema 
};
