/**
 * Formats the raw AI response string into the desired structure for the client (Webflow).
 * Currently, it just returns the text directly, assuming the client expects a simple string
 * within the JSON response object defined in `chat.ts`.
 *
 * @param aiResponse - The raw text response from the AI service.
 * @returns The formatted response (currently just the input string).
 */
function formatResponse(aiResponse: string): string {
  // Placeholder for future formatting needs.
  // For example, you might want to wrap it in specific HTML tags,
  // parse markdown, or structure it differently based on client requirements.
  // Example: return `<p>${aiResponse.replace(/\n/g, '<br>')}</p>`;

  // For now, just return the plain text response.
  // The structure `{ response: formattedResponse }` is handled in `chat.ts`.
  return aiResponse;
}

export { formatResponse };
