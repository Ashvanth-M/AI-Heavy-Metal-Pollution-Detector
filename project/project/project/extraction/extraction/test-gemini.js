const { GoogleGenerativeAI } = require("@google/generative-ai");

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
    // Create the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
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