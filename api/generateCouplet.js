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
        content: 'You are an expert on Mirza Ghalib\'s poetry and classical Urdu literature. When given a scenario, respond with a JSON object containing "hindi", "transliteration", "translation", and "theme". 

PRIORITY ORDER:
1. FIRST: Use an authentic, well-known couplet by Mirza Ghalib that matches the emotional context
2. SECOND: If no authentic Ghalib couplet fits perfectly, use a lesser-known but genuine Ghalib couplet
3. THIRD: Only if no authentic Ghalib couplet exists for the scenario, create a couplet in Ghalib\'s distinctive style and language

REQUIREMENTS:
- The "hindi" should be the original couplet in Devanagari (Hindi) script
- The "transliteration" should be a Latin transcription
- The "translation" should be a poetic English translation
- The "theme" should be a concise theme description
- Maintain Ghalib\'s characteristic use of Persian vocabulary, philosophical depth, and emotional nuance
- If generating (not using original), ensure it follows Ghalib\'s poetic conventions and linguistic style
- Ensure the Hindi script is accurate and properly formatted

AUTHENTICITY NOTE: Always prefer genuine Ghalib couplets over generated ones. Only create new couplets when absolutely necessary.'
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