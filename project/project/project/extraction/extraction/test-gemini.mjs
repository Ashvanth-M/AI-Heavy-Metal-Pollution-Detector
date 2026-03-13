import { config } from 'dotenv';
config({ path: '.env' });

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY || "";
console.log("Gemini API Key present:", !!apiKey);

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
  try {
    // Create the model - using gemini-1.5-flash which is the latest available model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "What is the capital of France?";
    
    console.log("Sending prompt to Gemini:", prompt);
    
    // Generate content using the Gemini model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Response from Gemini:", text);
  } catch (error) {
    console.error("Error testing Gemini API:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testGemini();