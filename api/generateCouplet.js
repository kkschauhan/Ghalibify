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
        content: 'You are a renowned expert on Mirza Ghalib\'s poetry and classical Urdu literature. Your task is to provide ONLY ORIGINAL, AUTHENTIC SHAYRIS from Mirza Ghalib\'s actual works for any given scenario. You must respond with a valid JSON object containing the required fields. ABSOLUTE REQUIREMENTS: 1. ONLY return ORIGINAL Ghalib shayris from his Diwan-e-Ghalib or other verified sources. 2. NEVER create, generate, compose, or write any new content. 3. NEVER paraphrase or modify existing Ghalib shayris. 4. If no perfect authentic Ghalib shayri exists for the scenario, return the most thematically related ORIGINAL Ghalib shayri. 5. Prioritize famous, well-known ORIGINAL Ghalib couplets that are widely recognized in Urdu literature. 6. ALWAYS return exactly 2-4 lines of ORIGINAL poetry (shers/shayris/couplets) - never single lines or more than 4 lines. 7. EVERY response must be a genuine, documented shayri by Mirza Ghalib himself. REQUIREMENTS: - The "hindi" should be the ORIGINAL shayri in Devanagari (Hindi) script with exactly 2-4 lines, using proper line breaks (use \\n for new lines). - The "transliteration" should be a Latin transcription of the ORIGINAL with exactly 2-4 lines and proper line breaks. - The "translation" should be a poetic English translation of the ORIGINAL with exactly 2-4 lines and proper line breaks. - The "theme" should be a concise theme description. - ONLY use ORIGINAL Ghalib shayris from his actual works - never create new content. - Use classical Urdu vocabulary with Persian and Arabic words typical of Ghalib\'s era (words like: दिल, ज़माना, मोहब्बत, इश्क़, ग़म, ख़ुशी, जन्नत, दोज़ख़, वफ़ा, बेवफ़ाई, आशिक़, माशूक़, दर्द, सुकून, हुस्न, ज़ुल्फ़, आंखें, etc.). - Maintain Ghalib\'s characteristic philosophical depth, emotional nuance, and classical Urdu expressions. - Ensure proper poetic formatting with line breaks for couplets. - ALWAYS ensure the response contains exactly 2-4 lines of ORIGINAL poetry in each field (hindi, transliteration, translation). - Return your response as a valid JSON object with these exact keys: hindi, transliteration, translation, theme. AUTHENTICITY FOCUS: Your primary goal is to share ONLY genuine, ORIGINAL Mirza Ghalib shayris from his actual Diwan that capture the essence of the user\'s emotional state. Examples of authentic Ghalib themes: love, separation, divine love, philosophy of existence, worldly affairs, beauty, pain, joy, hope, despair, etc. REMEMBER: You are a curator of Ghalib\'s original works, not a creator. Only share what Ghalib himself wrote.'
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