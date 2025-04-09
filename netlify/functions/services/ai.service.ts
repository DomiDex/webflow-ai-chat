import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google-ai/generativelanguage';

// Retrieve the API key from Netlify environment variables
const apiKey = process.env.GOOGLE_AI_API_KEY;
const modelName = 'gemini-1.5-flash'; // Or "gemini-pro", "gemini-1.5-pro-latest" etc.

// --- Debugging Start ---
console.log(
  '[AI Service] Retrieved API Key (first 5 chars):',
  apiKey?.substring(0, 5)
);
// --- Debugging End ---

if (!apiKey) {
  console.error('GOOGLE_AI_API_KEY environment variable is not set.');
  // Optionally throw an error during initialization if the key is critical
  // throw new Error("GOOGLE_AI_API_KEY is required but not set.");
}

// Initialize the Generative AI client only if the API key exists
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI
  ? genAI.getGenerativeModel({
      model: modelName,
      // Optional: Configure safety settings if needed
      // See https://ai.google.dev/docs/safety_setting_gemini
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      // Optional: Configure generation parameters
      // generationConfig: { maxOutputTokens: 200 },
    })
  : null;

// --- Debugging Start ---
console.log('[AI Service] genAI object initialized:', !!genAI); // Log true if initialized, false otherwise
console.log('[AI Service] model object initialized:', !!model); // Log true if initialized, false otherwise
// --- Debugging End ---

/**
 * Sends the user's message to the configured Google AI model and returns the response.
 *
 * @param userMessage The message input by the user.
 * @returns The text response from the AI model, or an error message.
 */
async function generateAIResponse(userMessage: string): Promise<string> {
  // Check if the model failed to initialize (e.g., missing API key)
  if (!model) {
    console.error('AI model not initialized. Check API key and configuration.');
    return 'Error: AI service is not configured or unavailable.';
  }

  console.log(
    `Sending to AI (${modelName}): "${userMessage.substring(0, 50)}..."`
  );

  try {
    // For stateless chat, we generate content directly.
    // For stateful chat, you would use `startChat()` and `sendMessage()` here,
    // managing the chat history object.
    const result = await model.generateContent(userMessage);

    // Handle potential lack of response or blocked content
    if (!result.response) {
      console.warn('AI response was empty or undefined.', result);
      return 'The AI did not provide a response. This might be due to safety settings or an internal issue.';
    }

    const responseText = result.response.text(); // Use .text() helper method

    if (!responseText) {
      console.warn('AI response content was empty.', result.response);
      // Check finish reason if available (e.g., safety)
      const finishReason = result.response.candidates?.[0]?.finishReason;
      if (finishReason && finishReason !== 'STOP') {
        return `AI response blocked due to: ${finishReason}.`;
      }
      return 'The AI provided an empty response.';
    }

    console.log(`AI Response received: "${responseText.substring(0, 50)}..."`);
    return responseText;
  } catch (error: any) {
    console.error('Error calling Google AI API:', error);

    // Provide a more user-friendly error message
    let detail = 'Failed to communicate with the AI service.';
    if (error.message) {
      detail += ` Details: ${error.message}`;
    }
    if (error.status) {
      // Some API errors might have a status
      detail += ` (Status: ${error.status})`;
    }

    return `Error: ${detail}`;
  }
}

export { generateAIResponse };
