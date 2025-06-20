
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { HealthRecord, AiSummaries } from '../types';
import { GEMINI_MODEL_TEXT } from '../constants';

// Ensure API_KEY is set in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variables. Summarization will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Non-null assertion as we check above, but for runtime it might still be an issue if not set.

export const generateAllSummaries = async (healthRecord: HealthRecord): Promise<AiSummaries> => {
  if (!API_KEY) {
    // This is a fallback if the API key is not available at runtime.
    // Ideally, the app should prevent calling this if API_KEY is missing.
    console.warn("Gemini API key not configured. Returning placeholder summaries.");
    return {
      doctorSummary: "Doctor summary generation unavailable (API key missing).",
      patientSummary: "Patient summary generation unavailable (API key missing).",
      alerts: ["Alert generation unavailable (API key missing)."],
    };
  }
  
  const prompt = `
    Given the following patient health record:
    \`\`\`json
    ${JSON.stringify(healthRecord, null, 2)}
    \`\`\`

    Generate the following as a single, well-formed JSON object:
    1.  "doctorSummary": A concise clinical summary in SOAP format (Subjective, Objective, Assessment, Plan). Ensure each section (Subjective, Objective, Assessment, Plan) is clearly delineated, perhaps using markdown bold for the titles.
    2.  "patientSummary": An easy-to-understand summary for the patient in plain language. Use bullet points and short sentences where appropriate.
    3.  "alerts": An array of strings detailing critical alerts, potential medication conflicts, or significant abnormal values. If no critical alerts are found, the array should contain a single string: "No critical alerts identified."

    The JSON output must have exactly these three keys: "doctorSummary" (string), "patientSummary" (string), and "alerts" (array of strings).
    Do not include any other text outside the JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.3, // Lower temperature for more factual summaries
        }
    });

    let jsonStr = response.text.trim();
    // Remove potential markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    // Validate that the response is parseable JSON
    let parsedData: any;
    try {
        parsedData = JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", e);
        console.error("Received text:", jsonStr);
        throw new Error(`Failed to parse AI response. Raw response: ${jsonStr.substring(0,500)}...`);
    }

    // Validate the structure of the parsed JSON
    if (
        typeof parsedData.doctorSummary === 'string' &&
        typeof parsedData.patientSummary === 'string' &&
        Array.isArray(parsedData.alerts) &&
        parsedData.alerts.every((alert: any) => typeof alert === 'string')
    ) {
        return {
            doctorSummary: parsedData.doctorSummary,
            patientSummary: parsedData.patientSummary,
            alerts: parsedData.alerts,
        };
    } else {
        console.error("Unexpected JSON structure from Gemini:", parsedData);
        throw new Error("AI response did not match expected structure.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("Invalid API Key for Gemini. Please check your configuration.");
    }
    throw new Error(`Failed to generate summaries: ${error instanceof Error ? error.message : String(error)}`);
  }
};
