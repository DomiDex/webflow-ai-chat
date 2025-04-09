import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { parseInput } from './utils/input-parser';
import { generateAIResponse } from './services/ai.service';
import { formatResponse } from './utils/response-formatter';

/**
 * Handles incoming POST requests from Webflow, parses the user message,
 * gets a response from the AI service, formats it, and returns it.
 */
const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // 1. Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { Allow: 'POST' },
    };
  }

  try {
    // 2. Parse the incoming request body
    // Use a default empty object if body is null or undefined
    const body = event.body ? JSON.parse(event.body) : {};
    const userMessage = parseInput(body);

    // 3. Validate the parsed input
    if (!userMessage) {
      console.warn('Received invalid input body:', event.body);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Invalid input: 'user-message' not found or empty in request body.data",
        }),
      };
    }

    // 4. Generate the AI response
    // Note: Context management (passing conversation history) would be added here
    const aiResponse = await generateAIResponse(userMessage);

    // 5. Format the AI response for the client
    const formattedResponse = formatResponse(aiResponse);

    // 6. Return the successful response
    return {
      statusCode: 200,
      body: JSON.stringify({ response: formattedResponse }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error: unknown) {
    // 7. Handle potential errors (parsing, AI service call, etc.)
    console.error('Error processing chat request:', error);

    // Basic error reporting, consider more detailed logging or error tracking for production
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        details: errorMessage,
      }),
    };
  }
};

export { handler };
