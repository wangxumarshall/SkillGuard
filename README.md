<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LLM Guard - Personal Edition

This is the personal edition of LLM Guard, designed to protect your AI workflow from malicious skills and prompt injections.

## Architecture

*   **Frontend**: React (Vite)
*   **Backend**: Python (FastAPI)
*   **AI Engine**: Google Gemini

## Prerequisites

*   Node.js
*   Python 3.10+
*   Google Gemini API Key

## Setup & Run

### 1. Environment Variables

Create a `.env` file in the root directory (or ensure environment variables are set):

```env
GEMINI_API_KEY=your_api_key_here
```

### 2. Backend

The backend handles the core detection logic using Gemini.

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run the server
uvicorn backend.main:app --reload
```
The backend runs on `http://localhost:8000`.

### 3. Frontend

The frontend provides the user interface.

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```
The frontend runs on `http://localhost:3000` and proxies API requests to the backend.

## Features

*   **Prompt Injection Scanner**: Detects malicious prompts designed to override system instructions.
*   **Skill Scanner**: Analyzes skill/plugin code (Python, YAML, etc.) for malicious patterns like remote execution and obfuscation.
*   **Dashboard**: Overview of scan results and threat levels.

## MVP Scope

This MVP focuses on the Core Detection Module. Future updates will include real-time interception and local sandboxing.
