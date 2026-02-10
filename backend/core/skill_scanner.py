from .llm_client import LLMClient
import json
import base64
import re

class SkillScanner:
    def __init__(self):
        self.llm_client = LLMClient()
        self.system_prompt = """
        You are an advanced AI Security Analyst. Your task is to analyze the following code or configuration file (Skill/Plugin) for any malicious intent.

        Look for:
        1. Obfuscated code (Base64, hex, etc.) that might hide payloads.
        2. Suspicious network calls (curl, wget, reverse shells, unknown IPs).
        3. System command execution (os.system, subprocess, exec, eval).
        4. Data exfiltration attempts.
        5. attempts to modify system configurations.

        Analyze the content and return a JSON object with the following structure:
        {
            "is_malicious": boolean,
            "risk_level": "High" | "Medium" | "Low" | "Safe",
            "threat_type": "Remote Execution" | "Data Exfiltration" | "Obfuscation" | "None" | "Other",
            "reasoning": "Brief explanation of why this is considered malicious or safe."
        }

        Only return the JSON object. Do not add any markdown formatting like ```json or ```.
        """

    def scan(self, file_content: str, filename: str = "unknown") -> dict:
        if not file_content:
             return {
                "is_malicious": False,
                "risk_level": "Safe",
                "threat_type": "None",
                "reasoning": "Empty file content."
            }

        # Basic heuristic pre-check (optional optimization)
        # if "curl" in file_content and "|" in file_content:
        #    ...

        full_prompt = f"{self.system_prompt}\n\nFile Name: {filename}\nContent to Analyze:\n{file_content}"

        try:
            response_text = self.llm_client.analyze_text(full_prompt)
            # Clean up potential markdown formatting
            cleaned_response = response_text.replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned_response)
            return result
        except json.JSONDecodeError:
            return {
                "is_malicious": True, # Fail safe
                "risk_level": "Medium",
                "threat_type": "Parsing Error",
                "reasoning": "Failed to parse LLM response."
            }
        except Exception as e:
            return {
                "is_malicious": True,
                "risk_level": "Medium",
                "threat_type": "System Error",
                "reasoning": f"Error during scanning: {str(e)}"
            }
