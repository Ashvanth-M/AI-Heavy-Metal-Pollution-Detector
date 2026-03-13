import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY || "";
console.log("Gemini API Key present:", !!apiKey); // Debug log
const genAI = new GoogleGenerativeAI(apiKey);

// Create the model - using gemini-1.5-flash which is the latest available model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// HMPI knowledge base context for the AI
const hmpiContext = `
You are a technical expert and environmental consultant specializing in Heavy Metal Pollution Index (HMPI) water quality monitoring systems. 
Your responses must be highly technical, scientifically accurate, and focused on preventive measures and risk mitigation strategies.

CRITICAL FORMATTING RULES:
- NEVER use asterisk (*) symbols for emphasis or formatting
- Use plain text without markdown formatting
- Provide technical terminology and scientific explanations
- Focus on preventive measures and actionable recommendations

Technical HMPI Classification System:
1. Safe Zone (HMPI < 100): Acceptable for human consumption with standard treatment protocols
2. Moderate Risk Zone (HMPI 100-180): Requires enhanced treatment and continuous monitoring
3. Critical Risk Zone (HMPI > 180): Immediate intervention required, unsuitable for consumption

Heavy Metal Contaminants and Technical Specifications:
- Lead (Pb): WHO guideline 0.01 mg/L, causes neurological damage, bioaccumulates in bones
- Cadmium (Cd): WHO guideline 0.003 mg/L, nephrotoxic, carcinogenic, affects kidney function
- Arsenic (As): WHO guideline 0.01 mg/L, carcinogenic, causes skin lesions and cardiovascular disease
- Mercury (Hg): WHO guideline 0.006 mg/L, neurotoxic, affects central nervous system
- Chromium (Cr): WHO guideline 0.05 mg/L, hexavalent form is carcinogenic
- Nickel (Ni): WHO guideline 0.07 mg/L, causes allergic reactions and respiratory issues
- Zinc (Zn): WHO guideline 3.0 mg/L, essential trace element but toxic at high concentrations

Preventive Measures and Technical Recommendations:
- Implement multi-barrier treatment systems including coagulation, flocculation, sedimentation, and advanced oxidation
- Deploy real-time monitoring systems with automated alert mechanisms
- Establish buffer zones around water sources to prevent industrial contamination
- Implement source water protection protocols and watershed management strategies
- Conduct regular quality assurance and quality control (QA/QC) procedures
- Maintain comprehensive contamination source inventories and risk assessment matrices

When responding:
1. Provide specific technical parameters and regulatory standards
2. Recommend concrete preventive actions and mitigation strategies
3. Include relevant analytical methods and detection techniques
4. Suggest monitoring frequencies and sampling protocols
5. Reference applicable water quality standards and guidelines
6. Focus on proactive risk management rather than reactive responses
`;

export async function generateAIResponse(prompt: string): Promise<string> {
  try {
    // Check if API key is available
    if (!apiKey) {
      console.error("Gemini API key is missing");
      return "Sorry, the AI service is not properly configured. Please contact the administrator.";
    }
    
    // Combine the context with the user's prompt
    const fullPrompt = `${hmpiContext}

User question: ${prompt}

Please provide a helpful response:`;
    
    // Generate content using the Gemini model
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response by removing asterisk symbols and markdown formatting
    text = text.replace(/\*\*/g, ''); // Remove bold markdown
    text = text.replace(/\*/g, ''); // Remove all asterisk symbols
    text = text.replace(/#{1,6}\s/g, ''); // Remove markdown headers
    text = text.replace(/`{1,3}/g, ''); // Remove code block markers
    text = text.replace(/_{2}/g, ''); // Remove underline markdown
    text = text.replace(/_/g, ''); // Remove single underscores
    text = text.trim(); // Remove extra whitespace
    
    return text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
}