import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ScanResult } from '../types';
import { performSignatureScan } from './signatureDatabase';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const MODEL_TEXT_ADVANCED = 'gemini-3-pro-preview';
const MODEL_IMAGE_ADVANCED = 'gemini-3-pro-preview'; // User requested image analysis with this model
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

/**
 * Analyzes code or text description of a "Skill" for viruses/vulnerabilities.
 */
export const scanSkillCode = async (code: string, filename: string): Promise<ScanResult> => {
  // 1. Perform Static Signature Scan (Local Database)
  const signatureHits = performSignatureScan(code);
  const signatureSummary = signatureHits.length > 0 
    ? `CRITICAL: The static analysis engine detected the following known threat signatures: ${JSON.stringify(signatureHits)}.` 
    : "Static analysis passed with no known signatures detected.";

  // 2. Perform AI Heuristic Analysis
  const prompt = `
    You are an advanced AI Security Engine acting as a Linux Anti-Virus for AI Skills.
    
    PHASE 1 REPORT (Signature Database):
    ${signatureSummary}

    PHASE 2 INSTRUCTIONS (Heuristic Analysis):
    Analyze the provided code for a "Skill" (Agent Tool).
    If signatures were found, verify if they are malicious in this context or potential false positives.
    Even if no signatures were found, look for novel zero-day threats like:
    1. Logic Bombs.
    2. Infinite loops or resource exhaustion.
    3. Subtle prompt injection or context contamination.
    
    Code to scan:
    \`\`\`
    ${code}
    \`\`\`

    Return the result in JSON format with the following schema:
    {
      "status": "Clean" | "Infected" | "Suspicious",
      "threatLevel": number (0-100),
      "details": "Short summary of findings, referencing signature hits if valid.",
      "vulnerabilities": ["List", "of", "specific", "issues"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT_ADVANCED,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            threatLevel: { type: Type.NUMBER },
            details: { type: Type.STRING },
            vulnerabilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');

    // Force status to infected/suspicious if critical signatures exist, unless AI strongly argues otherwise
    // For this implementation, we trust the AI's synthesis of the signature data + context.
    
    return {
      id: crypto.randomUUID(),
      filename,
      timestamp: new Date(),
      status: result.status || 'Unknown',
      threatLevel: result.threatLevel || 0,
      details: result.details || 'Analysis failed',
      vulnerabilities: result.vulnerabilities || [],
      signatureMatches: signatureHits
    };
  } catch (error) {
    console.error("Scan failed:", error);
    return {
      id: crypto.randomUUID(),
      filename,
      status: 'Suspicious',
      threatLevel: 50,
      details: 'Scan engine error - manual review recommended',
      timestamp: new Date(),
      vulnerabilities: ['Scanner Error'],
      signatureMatches: signatureHits
    };
  }
};

/**
 * Chat with the security assistant.
 */
export const chatWithSecurityBot = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  try {
    const chat = ai.chats.create({
      model: MODEL_TEXT_ADVANCED,
      history: history,
      config: {
        systemInstruction: "You are SkillGuard, an elite cybersecurity AI specializing in detecting viruses in Agent Skills. Be concise, technical, and authoritative.",
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat failed:", error);
    return "Encrypted channel error. Unable to process request.";
  }
};

/**
 * Analyzes an image for security threats.
 */
export const analyzeImageThreat = async (base64Image: string, promptText: string = "Analyze this screenshot for potential security risks, hidden code, or malicious UI patterns.") => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_ADVANCED,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: promptText }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Image analysis failed:", error);
    return "Visual cortex offline. Analysis failed.";
  }
};

/**
 * Text to Speech for alerts.
 */
export const generateSpeechAlert = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep, authoritative voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext
    );
    return audioBuffer;

  } catch (error) {
    console.error("TTS generation failed:", error);
    return null;
  }
};

// Helper for Audio Decoding (from guide)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
   // Simplified decoding relying on browser implementation for standard PCM if possible,
   // but since the API returns raw PCM without headers, we might need the manual decode if the browser doesn't sniff it.
   // However, the guide provides a manual decode function. Let's use the manual PCM decode logic for safety as per guide.
   const sampleRate = 24000;
   const numChannels = 1;
   const dataInt16 = new Int16Array(data.buffer);
   const frameCount = dataInt16.length / numChannels;
   const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

   for (let channel = 0; channel < numChannels; channel++) {
     const channelData = buffer.getChannelData(channel);
     for (let i = 0; i < frameCount; i++) {
       channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
     }
   }
   return buffer;
}