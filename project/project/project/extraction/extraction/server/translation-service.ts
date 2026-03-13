import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client for translation
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to check if a question is related to HMPI
async function checkIfHmpiRelated(question: string): Promise<boolean> {
  try {
    // Always return true to allow all questions through
    // This ensures the chatbot responds to all HMPI-related questions
    return true;
    
    /* Original implementation with keywords - commented out
    // List of HMPI-related keywords
    const hmpiKeywords = [
      'hmpi', 'heavy metal', 'pollution', 'water quality', 'lead', 'cadmium', 
      'arsenic', 'mercury', 'chromium', 'nickel', 'zinc', 'contamination', 
      'water treatment', 'water monitoring', 'water safety', 'water pollution',
      'metal concentration', 'toxicity', 'water source', 'drinking water',
      'wastewater', 'purification', 'filtration', 'environmental', 'WHO guideline'
    ];
    
    // Convert question to lowercase for case-insensitive matching
    const lowerQuestion = question.toLowerCase();
    
    // Check if any keyword is present in the question
    return hmpiKeywords.some(keyword => lowerQuestion.includes(keyword.toLowerCase()));
    */
  } catch (error) {
    console.error("Error checking if question is HMPI-related:", error);
    // Default to true in case of error to avoid blocking legitimate questions
    return true;
  }
}

// Language mappings
const languageNames: Record<string, string> = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'hi': 'Hindi'
};

// HMPI context for different languages
const hmpiContextByLanguage: Record<string, string> = {
  'en': `
You are an HMPI water quality expert. Keep all responses SHORT, SIMPLE and ACCURATE.

RESPONSE RULES:
- Keep responses under 3-5 sentences
- Use simple, clear language
- Be direct and concise
- Answer only HMPI-related questions
- Provide accurate information
- Focus on practical advice

HMPI Classification:
1. Safe: HMPI < 100
2. Moderate Risk: HMPI 100-180
3. Critical Risk: HMPI > 180

Key Heavy Metals:
- Lead (Pb): 0.01 mg/L limit
- Cadmium (Cd): 0.003 mg/L limit
- Arsenic (As): 0.01 mg/L limit
- Mercury (Hg): 0.006 mg/L limit
- Chromium (Cr): 0.05 mg/L limit
- Nickel (Ni): 0.07 mg/L limit
- Zinc (Zn): 3.0 mg/L limit

When responding:
1. Answer directly and briefly
2. Use simple terms
3. Provide accurate information
4. Focus on practical solutions
5. Avoid unnecessary technical jargon`,
  'es': `
Eres un experto técnico y consultor ambiental especializado en sistemas de monitoreo de calidad del agua del Índice de Contaminación por Metales Pesados (HMPI).
Tus respuestas deben ser altamente técnicas, científicamente precisas y enfocadas en medidas preventivas y estrategias de mitigación de riesgos.

REGLAS CRÍTICAS DE FORMATO:
- NUNCA uses símbolos de asterisco (*) para énfasis o formato
- Usa texto plano sin formato markdown
- Proporciona terminología técnica y explicaciones científicas
- Enfócate en medidas preventivas y recomendaciones accionables

Sistema de Clasificación Técnica HMPI:
1. Zona Segura (HMPI < 100): Aceptable para consumo humano con protocolos de tratamiento estándar
2. Zona de Riesgo Moderado (HMPI 100-180): Requiere tratamiento mejorado y monitoreo continuo
3. Zona de Riesgo Crítico (HMPI > 180): Intervención inmediata requerida, no apto para consumo

Contaminantes de Metales Pesados y Especificaciones Técnicas:
- Plomo (Pb): Directriz OMS 0.01 mg/L, causa daño neurológico, se bioacumula en huesos
- Cadmio (Cd): Directriz OMS 0.003 mg/L, nefrotóxico, carcinógeno, afecta función renal
- Arsénico (As): Directriz OMS 0.01 mg/L, carcinógeno, causa lesiones cutáneas y enfermedad cardiovascular
- Mercurio (Hg): Directriz OMS 0.006 mg/L, neurotóxico, afecta sistema nervioso central
- Cromo (Cr): Directriz OMS 0.05 mg/L, la forma hexavalente es carcinógena
- Níquel (Ni): Directriz OMS 0.07 mg/L, causa reacciones alérgicas y problemas respiratorios
- Zinc (Zn): Directriz OMS 3.0 mg/L, elemento traza esencial pero tóxico en altas concentraciones

Al responder:
1. Proporciona parámetros técnicos específicos y estándares regulatorios
2. Recomienda acciones preventivas concretas y estrategias de mitigación
3. Incluye métodos analíticos relevantes y técnicas de detección
4. Sugiere frecuencias de monitoreo y protocolos de muestreo
5. Referencia estándares y directrices aplicables de calidad del agua
6. Enfócate en gestión proactiva de riesgos en lugar de respuestas reactivas
`,
  'fr': `
Vous êtes un expert technique et consultant environnemental spécialisé dans les systèmes de surveillance de la qualité de l'eau de l'Indice de Pollution par Métaux Lourds (HMPI).
Vos réponses doivent être hautement techniques, scientifiquement précises et axées sur les mesures préventives et les stratégies d'atténuation des risques.

RÈGLES CRITIQUES DE FORMATAGE:
- N'utilisez JAMAIS de symboles astérisque (*) pour l'emphase ou le formatage
- Utilisez du texte brut sans formatage markdown
- Fournissez une terminologie technique et des explications scientifiques
- Concentrez-vous sur les mesures préventives et les recommandations actionnables

Système de Classification Technique HMPI:
1. Zone Sûre (HMPI < 100): Acceptable pour la consommation humaine avec des protocoles de traitement standard
2. Zone de Risque Modéré (HMPI 100-180): Nécessite un traitement amélioré et une surveillance continue
3. Zone de Risque Critique (HMPI > 180): Intervention immédiate requise, impropre à la consommation

Contaminants de Métaux Lourds et Spécifications Techniques:
- Plomb (Pb): Directive OMS 0.01 mg/L, cause des dommages neurologiques, se bioaccumule dans les os
- Cadmium (Cd): Directive OMS 0.003 mg/L, néphrotoxique, carcinogène, affecte la fonction rénale
- Arsenic (As): Directive OMS 0.01 mg/L, carcinogène, cause des lésions cutanées et des maladies cardiovasculaires
- Mercure (Hg): Directive OMS 0.006 mg/L, neurotoxique, affecte le système nerveux central
- Chrome (Cr): Directive OMS 0.05 mg/L, la forme hexavalente est carcinogène
- Nickel (Ni): Directive OMS 0.07 mg/L, cause des réactions allergiques et des problèmes respiratoires
- Zinc (Zn): Directive OMS 3.0 mg/L, élément trace essentiel mais toxique à hautes concentrations

Lors de la réponse:
1. Fournissez des paramètres techniques spécifiques et des normes réglementaires
2. Recommandez des actions préventives concrètes et des stratégies d'atténuation
3. Incluez des méthodes analytiques pertinentes et des techniques de détection
4. Suggérez des fréquences de surveillance et des protocoles d'échantillonnage
5. Référencez les normes et directives applicables de qualité de l'eau
6. Concentrez-vous sur la gestion proactive des risques plutôt que sur les réponses réactives
`,
  'hi': `
आप भारी धातु प्रदूषण सूचकांक (HMPI) जल गुणवत्ता निगरानी प्रणालियों में विशेषज्ञता रखने वाले एक तकनीकी विशेषज्ञ और पर्यावरण सलाहकार हैं।
आपके उत्तर अत्यधिक तकनीकी, वैज्ञानिक रूप से सटीक और निवारक उपायों और जोखिम शमन रणनीतियों पर केंद्रित होने चाहिए।

महत्वपूर्ण स्वरूपण नियम:
- जोर या स्वरूपण के लिए कभी भी तारांकन (*) प्रतीकों का उपयोग न करें
- मार्कडाउन स्वरूपण के बिना सादा पाठ का उपयोग करें
- तकनीकी शब्दावली और वैज्ञानिक स्पष्टीकरण प्रदान करें
- निवारक उपायों और कार्यान्वित करने योग्य सिफारिशों पर ध्यान दें

तकनीकी HMPI वर्गीकरण प्रणाली:
1. सुरक्षित क्षेत्र (HMPI < 100): मानक उपचार प्रोटोकॉल के साथ मानव उपभोग के लिए स्वीकार्य
2. मध्यम जोखिम क्षेत्र (HMPI 100-180): बेहतर उपचार और निरंतर निगरानी की आवश्यकता
3. गंभीर जोखिम क्षेत्र (HMPI > 180): तत्काल हस्तक्षेप आवश्यक, उपभोग के लिए अनुपयुक्त

भारी धातु दूषक और तकनीकी विनिर्देश:
- सीसा (Pb): WHO दिशानिर्देश 0.01 mg/L, न्यूरोलॉजिकल क्षति का कारण, हड्डियों में जैव संचय
- कैडमियम (Cd): WHO दिशानिर्देश 0.003 mg/L, नेफ्रोटॉक्सिक, कार्सिनोजेनिक, गुर्दे के कार्य को प्रभावित करता है
- आर्सेनिक (As): WHO दिशानिर्देश 0.01 mg/L, कार्सिनोजेनिक, त्वचा के घावों और हृदय रोग का कारण
- पारा (Hg): WHO दिशानिर्देश 0.006 mg/L, न्यूरोटॉक्सिक, केंद्रीय तंत्रिका तंत्र को प्रभावित करता है
- क्रोमियम (Cr): WHO दिशानिर्देश 0.05 mg/L, हेक्सावैलेंट रूप कार्सिनोजेनिक है
- निकल (Ni): WHO दिशानिर्देश 0.07 mg/L, एलर्जी प्रतिक्रियाओं और श्वसन समस्याओं का कारण
- जस्ता (Zn): WHO दिशानिर्देश 3.0 mg/L, आवश्यक ट्रेस तत्व लेकिन उच्च सांद्रता में विषाक्त

उत्तर देते समय:
1. विशिष्ट तकनीकी पैरामीटर और नियामक मानक प्रदान करें
2. ठोस निवारक कार्यों और शमन रणनीतियों की सिफारिश करें
3. प्रासंगिक विश्लेषणात्मक विधियों और पहचान तकनीकों को शामिल करें
4. निगरानी आवृत्तियों और नमूनाकरण प्रोटोकॉल का सुझाव दें
5. लागू जल गुणवत्ता मानकों और दिशानिर्देशों का संदर्भ दें
6. प्रतिक्रियाशील प्रतिक्रियाओं के बजाय सक्रिय जोखिम प्रबंधन पर ध्यान दें
`
};

export async function generateMultilingualAIResponse(prompt: string, language: string = 'en'): Promise<string> {
  try {
    // Check if API key is available
    if (!apiKey) {
      console.error("Gemini API key is missing");
      return getErrorMessage(language);
    }

    // We're now handling all types of questions, not just HMPI-related ones
    
    // Determine if the question is HMPI-related to use the appropriate context
    const isHmpiRelated = await checkIfHmpiRelated(prompt);
    
    // Get the appropriate context based on whether it's HMPI-related or not
    let context = "";
    if (isHmpiRelated) {
      // Use the HMPI context for HMPI-related questions
      context = hmpiContextByLanguage[language] || hmpiContextByLanguage['en'];
    } else {
      // For general questions, use a more generic context
      context = `You are a helpful AI assistant that provides accurate and concise information on any topic.`;
    }
    
    // If the language is English, use the original logic
    if (language === 'en') {
      const fullPrompt = `${context}

User question: ${prompt}

EXTREMELY IMPORTANT: Your response MUST be under 3 sentences maximum. Be extremely brief, direct, and simple.
Do not provide lengthy explanations. Focus only on the most essential information.
Please provide a helpful response:`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up the response
      text = cleanResponse(text);
      
      // Enforce very strict maximum length (approximately 250 characters, ~3 sentences)
      const maxLength = 250;
      if (text.length > maxLength) {
        // Find the end of the third sentence or cut at maxLength
        const sentenceEndMatch = text.match(/[.!?]+/g);
        if (sentenceEndMatch && sentenceEndMatch.length >= 3) {
          const thirdSentenceEnd = text.indexOf(sentenceEndMatch[2]) + sentenceEndMatch[2].length;
          text = text.substring(0, Math.min(thirdSentenceEnd, maxLength));
        } else {
          text = text.substring(0, maxLength);
        }
      }
      return text;
    }

    // For other languages, generate in English first, then translate
    const englishContext = hmpiContextByLanguage['en'];
    const englishPrompt = `${englishContext}

User question: ${prompt}

Please provide a helpful response:`;
    
    const englishResult = await model.generateContent(englishPrompt);
    const englishResponse = await englishResult.response;
    let englishText = englishResponse.text();
    englishText = cleanResponse(englishText);

    // Now translate to the target language
    const translationPrompt = `You are a professional technical translator specializing in environmental science and water quality monitoring.

CRITICAL INSTRUCTIONS:
- Translate the following technical response about Heavy Metal Pollution Index (HMPI) from English to ${languageNames[language]}
- Maintain all technical terminology and scientific accuracy
- Keep the same professional tone and structure
- Do not add any formatting symbols like asterisks (*) or markdown
- Preserve all numerical values, chemical formulas, and WHO guidelines exactly as they are
- Use appropriate technical vocabulary in ${languageNames[language]}

Text to translate:
${englishText}

Provide only the translation in ${languageNames[language]}:`;

    const translationResult = await model.generateContent(translationPrompt);
    const translationResponse = await translationResult.response;
    let translatedText = translationResponse.text();
    
    // Clean up the translated response
    translatedText = cleanResponse(translatedText);
    
    return translatedText;
  } catch (error) {
    console.error("Error generating multilingual AI response:", error);
    return getErrorMessage(language);
  }
}

function cleanResponse(text: string): string {
  // Clean up the response by removing asterisk symbols and markdown formatting
  text = text.replace(/\*\*/g, ''); // Remove bold markdown
  text = text.replace(/\*/g, ''); // Remove all asterisk symbols
  text = text.replace(/#{1,6}\s/g, ''); // Remove markdown headers
  text = text.replace(/`{1,3}/g, ''); // Remove code block markers
  text = text.replace(/_{2}/g, ''); // Remove underline markdown
  text = text.replace(/_/g, ''); // Remove single underscores
  text = text.trim(); // Remove extra whitespace
  return text;
}

function getErrorMessage(language: string): string {
  const errorMessages: Record<string, string> = {
    'en': "I'm currently experiencing high demand. Here's some helpful information about HMPI: Heavy Metal Pollution Index (HMPI) is a comprehensive method for assessing water quality based on heavy metal concentrations. It considers metals like lead, cadmium, arsenic, mercury, chromium, nickel, zinc, and copper. Values below 100 are considered safe, 100-180 indicate moderate pollution, and above 180 suggest critical pollution levels requiring immediate attention.",
    'es': "Actualmente estoy experimentando alta demanda. Aquí tienes información útil sobre HMPI: El Índice de Contaminación por Metales Pesados (HMPI) es un método integral para evaluar la calidad del agua basado en concentraciones de metales pesados. Considera metales como plomo, cadmio, arsénico, mercurio, cromo, níquel, zinc y cobre. Valores por debajo de 100 se consideran seguros, 100-180 indican contaminación moderada, y por encima de 180 sugieren niveles críticos que requieren atención inmediata.",
    'fr': "Je rencontre actuellement une forte demande. Voici des informations utiles sur HMPI : L'Indice de Pollution aux Métaux Lourds (HMPI) est une méthode complète pour évaluer la qualité de l'eau basée sur les concentrations de métaux lourds. Il considère des métaux comme le plomb, le cadmium, l'arsenic, le mercure, le chrome, le nickel, le zinc et le cuivre. Les valeurs inférieures à 100 sont considérées comme sûres, 100-180 indiquent une pollution modérée, et au-dessus de 180 suggèrent des niveaux critiques nécessitant une attention immédiate.",
    'hi': "मैं वर्तमान में उच्च मांग का सामना कर रहा हूं। यहां HMPI के बारे में उपयोगी जानकारी है: हेवी मेटल पोल्यूशन इंडेक्स (HMPI) भारी धातु सांद्रता के आधार पर पानी की गुणवत्ता का आकलन करने के लिए एक व्यापक विधि है। यह सीसा, कैडमियम, आर्सेनिक, पारा, क्रोमियम, निकल, जस्ता और तांबा जैसी धातुओं पर विचार करता है। 100 से नीचे के मान सुरक्षित माने जाते हैं, 100-180 मध्यम प्रदूषण का संकेत देते हैं, और 180 से ऊपर तत्काल ध्यान देने की आवश्यकता वाले महत्वपूर्ण प्रदूषण स्तर का सुझाव देते हैं।"
  };
  
  return errorMessages[language] || errorMessages['en'];
}