/**
 * Serverless function that generates a Mirza Ghalib couplet using a free
 * Groq language model. When deployed on Vercel this function can be
 * accessed at `/api/generateCouplet`. It expects a JSON payload with a
 * `scenario` property describing the user's situation or feeling.
 *
 * The function calls Groq's OpenAI‑compatible chat completions endpoint
 * using the API key defined in the `GROQ_API_KEY` environment variable.
 * It instructs the model to return a JSON object containing the Urdu
 * couplet, its transliteration, an English translation and a theme.
 * If the model or key is unavailable or the request fails the
 * function will propagate an error response.
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Parse the incoming JSON body
  let scenario;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    scenario = body && body.scenario;
  } catch (err) {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  if (!scenario || typeof scenario !== 'string') {
    res.status(400).json({ error: 'Missing scenario' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY environment variable is not set' });
    return;
  }

  // Build the payload for the Groq API call
  // Try multiple models in case one is not available
  const models = ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile'];
  const model = models[0]; // Start with the cheaper model
  
  const payload = {
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a renowned expert on Mirza Ghalib\'s poetry and classical Urdu literature. You have access to a comprehensive database of 100+ ORIGINAL Ghalib shers. Your task is to provide ONLY AUTHENTIC, ORIGINAL SHAYRIS from this verified collection for any given scenario. You must respond with a valid JSON object containing the required fields. ABSOLUTE REQUIREMENTS: 1. ONLY return ORIGINAL Ghalib shayris from the provided database of 100+ authentic shers. 2. NEVER create, generate, compose, or write any new content. 3. NEVER paraphrase or modify existing Ghalib shayris. 4. Select the most thematically appropriate ORIGINAL Ghalib shayri from the database for the given scenario. 5. ALWAYS return 2-4 lines of ORIGINAL poetry (shers/shayris/couplets) - minimum 2 lines, maximum 6 lines if very necessary. 6. EVERY response must be a genuine shayri from the provided database. SAMPLE ORIGINAL GHALIB SHAYRIS FROM THE DATABASE: 1. "Hazaaron khwahishein aisi ki har khwahish pe dam nikle\\nBahut nikle mere armaan lekin phir bhi kam nikle" 2. "Dil-e-nadaan tujhe hua kya hai? Aakhir is dard ki dawa kya hai?" 3. "Ishq ne \'Ghalib\' nikamma kar diya\\nWarna hum bhi aadmi the kaam ke" 4. "Ragon mein daudte phirne ke hum nahi qa\'il\\nJab aankh hi se na tapka to phir lahoo kya hai?" 5. "Na tha kuch to Khuda tha, kuch na hota to Khuda hota\\nDuboya mujh ko hone ne, na hota main to kya hota" 6. "Bas-ki dushvaar hai har kaam ka aasaan hona\\nAadmi ko bhi mayassar nahin insaan hona" 7. "Imaan mujhe roke hai jo khinche hai mujhe kufr\\nKaaba mere peeche hai kaleesa mere aage" 8. "Har ek baat pe kehte ho tum ke tu kya hai\\nTumhi kaho ke yeh andaaz-e-guftagu kya hai" REQUIREMENTS: - The "hindi" should be the ORIGINAL shayri in Devanagari (Hindi) script with 2-6 lines, using proper line breaks (use \\n for new lines). - The "transliteration" should be a Latin transcription of the ORIGINAL with 2-6 lines and proper line breaks. - The "translation" should be a poetic English translation of the ORIGINAL with 2-6 lines and proper line breaks. - The "theme" should be a concise theme description. - ONLY use ORIGINAL Ghalib shayris from the provided database - never create new content. - Use classical Urdu vocabulary with Persian and Arabic words typical of Ghalib\'s era. - Maintain Ghalib\'s characteristic philosophical depth, emotional nuance, and classical Urdu expressions. - Ensure proper poetic formatting with line breaks for couplets. - ALWAYS ensure the response contains 2-6 lines of ORIGINAL poetry in each field (hindi, transliteration, translation). - Return your response as a valid JSON object with these exact keys: hindi, transliteration, translation, theme. AUTHENTICITY FOCUS: Your primary goal is to select the most appropriate ORIGINAL Mirza Ghalib shayri from the provided database that captures the essence of the user\'s emotional state. Examples of authentic Ghalib themes: love, separation, divine love, philosophy of existence, worldly affairs, beauty, pain, joy, hope, despair, etc. REMEMBER: You are a curator of Ghalib\'s original works from the provided database. Only select from the 100+ authentic shers available. Never create new content.'
      },
      {
        role: 'user',
        content: scenario
      }
    ],
    temperature: 0.7,
    // Request JSON output. If the model doesn’t support structured outputs
    // it may still return a JSON string because of the prompt.
    response_format: { type: 'json_object' }
  };

  // Try each model until one works
  let lastError = null;
  for (const currentModel of models) {
    try {
      const currentPayload = { ...payload, model: currentModel };
      
      // Use the global fetch API. Node 18+ provides it natively.
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(currentPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq API error with model ${currentModel}:`, response.status, errorText);
        
        // If this is a model decommissioned/not found error, try the next model
        if (errorText.includes('decommissioned') || errorText.includes('not supported') || 
            errorText.includes('does not exist') || errorText.includes('model_not_found')) {
          lastError = new Error(`Model ${currentModel} is not available: ${errorText}`);
          continue; // Try next model
        }
        
        // For other errors, fail immediately
        res.status(502).json({ error: 'Failed to fetch completion from Groq', details: errorText });
        return;
      }

      const data = await response.json();
      const choice = data.choices && data.choices[0];
      const content = choice && choice.message && choice.message.content;

      if (!content) {
        lastError = new Error('Invalid response from Groq');
        continue; // Try next model
      }

      let result;
      try {
        // The model should return a JSON object. Attempt to parse it.
        result = JSON.parse(content);
      } catch (err) {
      // If parsing fails, attempt to coerce newline‑separated values.
      // Expected order: hindi, transliteration, translation, theme
      const lines = content.split(/\r?\n/).filter(Boolean);
      result = {
        hindi: lines[0] || '',
        transliteration: lines[1] || '',
        translation: lines[2] || '',
        theme: lines[3] || ''
      };
      }

      // If we get here, we have a successful result
      res.status(200).json(result);
      return;
      
    } catch (error) {
      console.error(`Error with model ${currentModel}:`, error);
      lastError = error;
      continue; // Try next model
    }
  }
  
  // If we get here, all models failed
  console.error('All models failed:', lastError);
  res.status(500).json({ 
    error: 'All Groq models are currently unavailable', 
    details: lastError?.message || 'Unknown error'
  });
}