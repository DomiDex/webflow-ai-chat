// Defines the expected structure of the incoming request body
// from a Webflow form submission, assuming it sends JSON.
interface WebflowRequestBody {
  // The 'data' object is typical for Webflow form submissions
  data?: {
    // Expecting a field named 'user-message' containing the user's input
    'user-message'?: string;
    // Allow other potential form fields, but ignore them
    [key: string]: any;
  };
  // Allow other top-level properties if the structure varies
  [key: string]: any;
}

/**
 * Parses the incoming request body to extract the user's message.
 * It specifically looks for `body.data['user-message']`.
 *
 * @param body - The parsed JSON request body (or an empty object if parsing failed).
 * @returns The user's message string if found and valid, otherwise null.
 */
function parseInput(body: WebflowRequestBody | any): string | null {
  // Basic validation: Check if body and body.data exist
  if (
    !body ||
    typeof body !== 'object' ||
    !body.data ||
    typeof body.data !== 'object'
  ) {
    console.error(
      "Input body is missing or not an object, or missing 'data' field:",
      body
    );
    return null;
  }

  // Extract the message, ensuring it's a non-empty string
  const userMessage = body.data['user-message'];
  if (typeof userMessage === 'string' && userMessage.trim() !== '') {
    // Return the trimmed message to remove leading/trailing whitespace
    return userMessage.trim();
  }

  // Log if the message is missing or not a valid string
  console.error(
    "Could not find a valid 'user-message' string in body.data:",
    body.data
  );
  return null;
}

export { parseInput };
