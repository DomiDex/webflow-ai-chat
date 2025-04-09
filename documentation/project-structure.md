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

## 5. Deployment & Configuration

This section covers preparing your code, deploying it to Netlify, configuring environment variables, and testing the live function.

### 5.1 Git Preparation (Steps 46-50)

1.  **Stage Changes:** Add all your local changes to Git's staging area.
    ```bash
    git add .
    ```
2.  **Commit Changes:** Save your staged changes with a descriptive message.
    ```bash
    git commit -m "feat: Add chat function and related services"
    ```
    _(Adjust the commit message as needed)_
3.  **Create Remote Repository (Step 48):**
    - Go to your Git hosting provider (GitHub, GitLab, Bitbucket).
    - Create a new repository (e.g., `webflow-ai-chat`).
    - **Do not** initialize it with a README, .gitignore, or license (you have these locally).
    - Copy the repository URL (e.g., `https://github.com/your-username/your-repo-name.git`).
4.  **Add Remote Origin (Step 49):** Link your local repository to the remote one. Replace `<your_repo_url>` with the URL copied above.
    ```bash
    git remote add origin <your_repo_url>
    ```
5.  **Push to Remote (Step 50):** Upload your local commits to the remote repository. The `-u` flag sets up tracking for future pushes/pulls.
    ```bash
    git push -u origin main
    ```
    _(Use `master` if that's your default branch name)_

### 5.2 Netlify Site Setup (Steps 51-55)

1.  **Log in to Netlify:** Go to [app.netlify.com](https://app.netlify.com/).
2.  **Add New Site:** Click "Add new site" -> "Import an existing project".
3.  **Select Git Provider & Repo:** Choose your provider (GitHub, etc.), authorize Netlify, and select the repository you just pushed to.
4.  **Configure Build Settings:**
    - Netlify usually auto-detects settings.
    - **Crucially, verify the "Functions directory"**. It should be `netlify/functions`.
    - The "Build command" can often be left blank if you only have functions.
    - The "Publish directory" should typically be the project root (`.`) or empty.
5.  **Deploy Site:** Click "Deploy site". Netlify will fetch your code, build the function (using `esbuild` as per `netlify.toml`), and deploy.
6.  **Wait for Deployment:** Monitor the deployment progress in the Netlify dashboard ("Deploys" tab).

### 5.3 Environment Variables Configuration (Steps 56-61)

1.  **Navigate to Environment Variables:** In your deployed site's dashboard on Netlify, go to `Site configuration` -> `Build & deploy` -> `Environment variables`.
2.  **Add API Key:**
    - Click "Add variable".
    - **Key:** `GOOGLE_AI_API_KEY`
    - **Value:** Your actual Google AI API key (paste the key value directly, no quotes).
    - **Scope:** Ensure the scope includes "Functions" (this is usually the default and necessary for the deployed function to access the key).
    - Click "Save".
3.  **Verify Variable:** Check the list to ensure `GOOGLE_AI_API_KEY` is listed correctly.
4.  **Trigger Redeploy:** Go to the "Deploys" tab and trigger a new deployment (e.g., "Trigger deploy" -> "Deploy site"). This ensures the function runs with the newly added environment variable.
5.  **Wait for Redeployment:** Monitor the deployment status until it's successful.

### 5.4 Testing the Deployed Function (Steps 62-64)

1.  **Find Function URL:**
    - Go to the "Functions" tab in your Netlify site dashboard.
    - Click on your function name (e.g., `chat`).
    - Copy the "Function URL" (e.g., `https://your-site-name.netlify.app/.netlify/functions/chat`).
2.  **Test with `curl` or Postman:** Send a POST request to the live function URL.

    ```bash
    # Replace with your actual function URL
    FUNCTION_URL="https://your-site-name.netlify.app/.netlify/functions/chat"

    curl -X POST "$FUNCTION_URL" \
         -H "Content-Type: application/json" \
         -d '{"data": {"user-message": "Test message to deployed function."}}'
    ```

    - Check if you receive the expected JSON response (e.g., `{"response":"AI response..."}`).

3.  **Check Function Logs:**
    - In the Netlify dashboard, go to the "Functions" tab and click your function name.
    - Review the logs for any errors or console output (including the `console.log` statements from `ai.service.ts`). This is crucial for debugging, especially API key issues.

## 6. Important Considerations

- **API Key Security:** Never commit your `.env.local` file or hardcode API keys directly in your source code. Use environment variables set in the Netlify UI for deployment.
- **Error Handling:** The current error handling in `chat.ts` and `ai.service.ts` is basic. For production, consider more robust logging (e.g., using a logging service) and error reporting.
- **Context Management:** This setup is currently stateless. Each request to the AI is independent. For a true conversational experience, you would need to implement logic to manage and send conversation history with each request (likely requiring modifications to `chat.ts` and `ai.service.ts`, and potentially storing history).
- **Webflow Integration:** This backend needs to be called from your Webflow site. You'll need to write custom JavaScript in Webflow to:
  - Capture user input from a form.
  - Send a POST request (using `fetch`) to your deployed function URL (found in step 5.4.1).
  - Handle the JSON response (the `response` field) and display the AI's message in your chat UI.
- **CORS:** The `Access-Control-Allow-Origin: '*'` header in `chat.ts` is permissive. For production, restrict this to your specific Webflow domain (e.g., `Access-Control-Allow-Origin: 'https://your-site.webflow.io'`).
