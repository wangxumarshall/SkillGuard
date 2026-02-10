import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class LLMClient:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not found in environment variables. Using Mock Mode.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            # Use Gemini Pro model
            self.model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze_text(self, prompt: str) -> str:
        """
        Sends a prompt to the LLM and returns the text response.
        """
        if not self.api_key:
            # Mock response for testing without API key

            # Extract user content part to avoid false positives from system prompt
            content_to_scan = prompt
            if "Content to Analyze:" in prompt:
                content_to_scan = prompt.split("Content to Analyze:")[-1]
            elif "User Prompt to Analyze:" in prompt:
                content_to_scan = prompt.split("User Prompt to Analyze:")[-1]

            prompt_lower = content_to_scan.lower()

            # Malicious patterns
            is_malicious = False
            threat_type = "None"
            reasoning = "The content appears safe."

            # Specific triggers for testing
            if "ignore all previous instructions" in prompt_lower or "drop table" in prompt_lower:
                is_malicious = True
                threat_type = "Prompt Injection"
                reasoning = "The user is attempting to override system instructions."
            elif "curl | bash" in prompt_lower or "os.system" in prompt_lower or "eval(" in prompt_lower:
                is_malicious = True
                threat_type = "Remote Execution"
                reasoning = "Suspicious system command execution detected (curl | bash, os.system, or eval)."
            elif "base64" in prompt_lower and len(prompt) > 200: # Simple heuristic for potential obfuscation
                 is_malicious = True
                 threat_type = "Obfuscation"
                 reasoning = "Potential obfuscated payload detected."

            if is_malicious:
                 return f"""
                {{
                    "is_malicious": true,
                    "risk_level": "High",
                    "threat_type": "{threat_type}",
                    "reasoning": "{reasoning}"
                }}
                """
            else:
                return """
                {
                    "is_malicious": false,
                    "risk_level": "Safe",
                    "threat_type": "None",
                    "reasoning": "The content appears to be a standard file or query."
                }
                """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error calling LLM: {str(e)}"
