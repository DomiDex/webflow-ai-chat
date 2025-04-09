# Documentation: Webflow AI Chat (Netlify Function Backend) - Cursor IDE

## 1. Overview

This project provides the backend logic for a real-time chat interface intended for a Webflow site. It uses a Netlify Function written in TypeScript to receive user messages (submitted via a Webflow form), forward them to the Google AI (Gemini) API, and return the AI's response.

This documentation focuses on the setup, structure, and execution of the backend function within the Cursor IDE.

## 2. Project Structure

webflow-ai-chat/
├── .env.local # Local environment variables (API Key - DO NOT COMMIT)
├── .gitignore # Specifies intentionally untracked files by Git
├── netlify/
│ └── functions/ # Contains Netlify Function source code
│ ├── services/ # Modules for interacting with external APIs
│ │ └── ai.service.ts # Handles communication with Google AI API
│ ├── utils/ # Helper modules for specific tasks
│ │ └── input-parser.ts # Parses incoming request data
│ │ └── response-formatter.ts # Formats AI response for the client
│ ├── chat.ts # Main Netlify Function handler (entry point)
│ └── tsconfig.json # TypeScript configuration for functions
├── netlify.toml # Netlify configuration (build, functions, dev server)
├── package-lock.json # Records exact dependency versions
├── package.json # Project metadata and dependencies
└── README.md # (Optional) General project

## 3. Key Files & Configuration

- **`netlify.toml`**:
  - `[functions]` block: Specifies `directory = "netlify/functions"` and `node_bundler = "esbuild"` (telling Netlify how to find and build the TypeScript functions).
  - `[dev]` block: Configures the local development server (`netlify dev`) via `npm run dev`, setting the port (`port = 8888`).
- **`package.json`**:
  - `dependencies`: Lists runtime dependencies like `@google-ai/generativelanguage` (for Google AI SDK) and `@netlify/functions` (for function types/helpers).
  - `devDependencies`: Lists development dependencies like `typescript` and `@types/node`.
  - `scripts`: Defines runnable commands, notably `"dev": "netlify dev"` for local development.
- **`.env.local`**:
  - Contains the `GOOGLE_AI_API_KEY` needed for local development.
  - **Crucially**, this file _must_ be listed in `.gitignore` to prevent committing your secret API key.
- **`netlify/functions/tsconfig.json`**:
  - Configures how TypeScript files in the `functions` directory are compiled.
  - `rootDir: "."`: Source files are in the current directory (`netlify/functions`).
  - `outDir: "dist"`: Compiled JavaScript output goes into `netlify/functions/dist/` (this `dist` folder should also be in `.gitignore`).
- **`netlify/functions/chat.ts`**:
  - The main serverless function handler.
  - Receives POST requests (expects JSON body).
  - Uses `input-parser.ts` to extract the user message.
  - Calls `ai.service.ts` to get the AI response.
  - Uses `response-formatter.ts` to prepare the response structure.
  - Returns a JSON object (`{ response: "AI message..." }`) or an error.
- **`netlify/functions/services/ai.service.ts`**:
  - Handles all interaction with the Google AI API.
  - Reads the `GOOGLE_AI_API_KEY` from environment variables (`process.env`).
  - Initializes the `GoogleGenerativeAI` client.
  - Calls the `generateContent` method of the chosen model (`gemini-1.5-flash`).
  - Includes basic error handling for the API call.
  - **Note:** You might currently see persistent TypeScript errors in Cursor regarding imports in this file. These seem related to the local type-checking environment and may not reflect issues in Netlify's build environment. Focus on whether deployment succeeds.

## 4. Setup & Running Locally (within Cursor)

1.  **Prerequisites:** Ensure you have Node.js and npm installed on your system (Cursor often uses the system's installation).
2.  **Open Project:** Open the `webflow-ai-chat` folder in Cursor.
3.  **API Key:**
    - Create a file named `.env.local` in the project root.
    - Add the line: `GOOGLE_AI_API_KEY="YOUR_ACTUAL_API_KEY"` (replace with your real key).
    - Ensure `.env.local` is listed in your `.gitignore` file.
4.  **Install Dependencies:**
    - Open Cursor's integrated terminal (View -> Terminal, or `Ctrl+~` / `Cmd+~`).
    - Run the command: `npm install`
    - This installs all packages from `package.json` into a `node_modules` folder.
5.  **Run Local Dev Server:**
    - In the Cursor terminal, run: `npm run dev`
    - This executes `netlify dev`, which builds your TypeScript function and starts a local server.
    - Look for output indicating the server is running, usually showing:
      - Main local site URL: `http://localhost:8888` (will show 404 - this is expected).
      - Function endpoint URL: `http://localhost:8888/.netlify/functions/chat`
6.  **Test the Function:**
    - You can test the function directly from Cursor's terminal using `curl`:
      ```bash
      curl -X POST http://localhost:8888/.netlify/functions/chat \
           -H "Content-Type: application/json" \
           -d '{"data": {"user-message": "Explain what a Netlify function is in simple terms."}}'
      ```
    - You should see a JSON response like `{"response":"A Netlify function is..."}`.

## 5. Deployment to Netlify

1.  **Set Environment Variable in Netlify:**
    - Log in to `app.netlify.com`.
    - Go to your site (`webflow-ai-chat`) -> `Site configuration` -> `Build & deploy` -> `Environment`.
    - Add an environment variable:
      - **Key:** `GOOGLE_AI_API_KEY`
      - **Value:** Your actual Google AI API key (paste the key value directly, no quotes).
    - Save. This is essential for the _deployed_ function to work.
2.  **Deploy:**
    - **Method 1 (Recommended): Git Push:** If you connected your Git repository (GitHub, GitLab etc.) to Netlify, simply `git push` your committed changes to the main branch. Netlify will automatically build and deploy.
    - **Method 2 (CLI):**
      - Open Cursor's terminal in the project root.
      - Run: `netlify deploy --prod` (or `npx netlify deploy --prod` if `netlify` command is not found globally).
      - **Important:** Ensure your "Publish directory" in Netlify's build settings (see Step 1 UI location) is set correctly (e.g., `/`, blank, or base directory, **not** an incorrect path like a Git URL). If you previously deployed with an incorrect path, fix it in the UI first.
3.  **Deployed Endpoint:** Your live function will be available at `https://webflow-ai-chat.netlify.app/.netlify/functions/chat`.

## 6. Important Considerations

- **API Key Security:** Never commit your `.env.local` file or hardcode API keys directly in your source code. Use environment variables set in the Netlify UI for deployment.
- **Error Handling:** The current error handling is basic. For production, consider more robust logging and error reporting.
- **Context Management:** This setup is currently stateless. Each request to the AI is independent. For a true conversational experience, you would need to implement logic to manage and send conversation history with each request (likely requiring modifications to `chat.ts` and `ai.service.ts`, and potentially storing history).
- **Webflow Integration:** This backend needs to be called from your Webflow site. You'll need to write custom JavaScript in Webflow to:
  - Capture form input.
  - Send a POST request (using `fetch`) to the deployed function URL.
  - Handle the JSON response and display it in your chat UI.
