
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODEL_NAME } from '../../../constants';
import { ChatTurn } from '../../../types';

let ai: GoogleGenAI | null = null;
let apiKeyAvailable = false; // Tracks if API key was provided, even if initialization failed
let apiKeyMissing = false; // Specifically tracks if API_KEY was not in process.env

if (process.env.API_KEY && process.env.API_KEY !== '') {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    apiKeyAvailable = true;
    console.log("Gemini AI SDK initialized in frontend.");
  } catch (e: any) {
    apiKeyAvailable = true; // Key was present, but init failed
    ai = null; // Ensure ai is null if init fails
    console.error("Failed to initialize GoogleGenAI in frontend. API_KEY might be invalid:", e.message);
  }
} else {
  apiKeyMissing = true;
  apiKeyAvailable = false; // Explicitly false if missing
  console.warn("API_KEY is not defined in process.env or is empty. AI features will be unavailable. Please set API_KEY in your build environment.");
}

const UNAVAILABLE_MESSAGE_HTML = `<p class="text-gray-400 dark:text-gray-500 italic">คุณสมบัติ AI ไม่พร้อมใช้งานในขณะนี้ หากคุณใช้งานเวอร์ชันที่ Build เอง กรุณาตรวจสอบว่า API_KEY ถูกตั้งค่าอย่างถูกต้อง</p>`;
const KEY_INIT_FAILED_MESSAGE_HTML = `<p class="text-red-400 italic">การเริ่มต้น AI ล้มเหลว อาจเป็นเพราะ API Key ไม่ถูกต้อง กรุณาตรวจสอบ API Key ที่ใช้ในการ Build</p>`;

const handleGeminiError = (error: any, operationName: string): string => {
    console.error(`[Gemini SDK Error - ${operationName}]`, error);
    let message = "เกิดข้อผิดพลาดในการติดต่อกับ Gemini API";
    if (error && typeof error === 'object') {
        if (error.message) {
            message = error.message;
        }
        if (message.toLowerCase().includes("api key not valid") || message.toLowerCase().includes("permission_denied") || message.toLowerCase().includes("api_key_invalid")) {
            return `AI Error: API Key ไม่ถูกต้องหรือไม่มีสิทธิ์การเข้าถึง กรุณาตรวจสอบ API Key ที่ใช้ในการ Build (${MODEL_NAME})`;
        }
        if (message.toLowerCase().includes("quota")) {
            return `AI Error: โควต้าการใช้งาน Gemini API อาจเกินกำหนดแล้ว`;
        }
        if (message.toLowerCase().includes("model_not_found")) {
            return `AI Error: ไม่พบโมเดล AI ที่ระบุ (${MODEL_NAME})`;
        }
         if (message.toLowerCase().includes("bad request") || (error.toString && error.toString().toLowerCase().includes("bad request"))) {
            return `AI Error: คำขอไปยัง AI ไม่ถูกต้อง อาจมีปัญหาเกี่ยวกับพารามิเตอร์ (${message})`;
        }
    }
    return `AI Error: ${message}`;
};


export const generateAiContent = async (
  systemInstruction: string,
  userPrompt: string,
  chatHistory?: ChatTurn[]
): Promise<string> => {
  if (apiKeyMissing) { // API_KEY was never provided
    console.warn("[geminiService] generateAiContent: AI features unavailable because API_KEY is missing.");
    return UNAVAILABLE_MESSAGE_HTML;
  }
  if (!ai && apiKeyAvailable) { // API_KEY was provided, but AI client failed to initialize
    console.error("[geminiService] generateAiContent: AI client failed to initialize despite API_KEY being present.");
    return KEY_INIT_FAILED_MESSAGE_HTML;
  }
  if (!ai) { // General fallback, should be covered by above
     console.error("[geminiService] generateAiContent: AI service is not available for an unknown reason.");
     return UNAVAILABLE_MESSAGE_HTML;
  }


  try {
    const geminiContents: { role: string; parts: { text: string }[] }[] = [];

    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(turn => {
        if ((turn.role === 'user' || turn.role === 'model') && turn.text) {
          geminiContents.push({ role: turn.role, parts: [{ text: turn.text }] });
        }
      });
    }
    geminiContents.push({ role: 'user', parts: [{ text: userPrompt }] });
    
    const genAiConfig: any = {};
    if (systemInstruction && systemInstruction.trim() !== '') {
        genAiConfig.systemInstruction = systemInstruction;
    }

    console.log("[geminiService] Calling Gemini generateContent with model:", MODEL_NAME, "Config:", genAiConfig, "Contents preview:", geminiContents[geminiContents.length-1].parts[0].text.substring(0,100));
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: geminiContents,
      config: genAiConfig
    });
    
    let text = response.text;

    if (typeof text !== 'string') {
      console.warn(`AI response text is not a string:`, text);
      text = ''; 
    } else {
      // JSON responses from Gemini might be wrapped in markdown fences
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = text.match(fenceRegex);
      if (match && match[2]) {
        text = match[2].trim();
      }
    }
    // If text is empty after processing, return a gentle message
    if (text.trim() === '') {
        return `<p class="text-gray-400 dark:text-gray-500 italic">AI ไม่ได้ส่งข้อความตอบกลับ หรือส่งข้อความว่างเปล่า</p>`;
    }
    return text;

  } catch (error: any) {
    // Instead of throwing, we return the error message formatted as HTML to be displayed directly.
    // NoteTaskApp's handleSubmitAi will set this directly into aiResponse state.
    // This prevents setErrorAi from being set, thus not showing the red error banner for API issues.
    const formattedError = handleGeminiError(error, 'generateAiContent');
    return `<p class="text-red-400 font-semibold">${formattedError}</p>`;
  }
};

export const generateSubtasksForTask = async (taskTitle: string, taskCategory: string): Promise<string[]> => {
  if (apiKeyMissing) {
    console.warn("[geminiService] generateSubtasksForTask: AI features unavailable because API_KEY is missing.");
    return []; // Return empty array, no error thrown to UI
  }
  if (!ai && apiKeyAvailable) {
    console.error("[geminiService] generateSubtasksForTask: AI client failed to initialize despite API_KEY being present.");
    // Optionally, you could throw an error here that AiSubtaskSuggestionModal can specifically catch and display
    // For now, returning empty array for consistency with missing key.
    return [];
  }
   if (!ai) {
     console.error("[geminiService] generateSubtasksForTask: AI service is not available for an unknown reason.");
     return [];
  }

  try {
    const systemInstruction = "คุณคือ AI ผู้ช่วยในการจัดการงานที่มีประสิทธิภาพ หน้าที่ของคุณคือช่วยผู้ใช้แบ่งงานหลักออกเป็นงานย่อยๆ ที่สามารถดำเนินการได้ เมื่อได้รับชื่อของงานหลักและประเภทของงาน โปรดสร้างรายการงานย่อย 3-5 รายการที่ชัดเจนและกระชับ แต่ละงานย่อยควรเป็นขั้นตอนที่นำไปสู่การทำงานหลักให้สำเร็จลุล่วง ตอบกลับเป็น JSON array ของสตริงเท่านั้น โดยแต่ละสตริงคืองานย่อยหนึ่งรายการ อย่าใส่คำอธิบายใดๆ นอกเหนือจาก JSON array และไม่ต้องมี Markdown code fences (```json ... ```)";
    const userPrompt = `ชื่องานหลัก: "${taskTitle}"\nประเภท: "${taskCategory || 'ทั่วไป'}"\n\nกรุณาสร้างงานย่อยเป็น JSON array ของสตริง`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{text: userPrompt}]}], 
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    let subtasks;
    try {
      subtasks = JSON.parse(jsonStr);
      if (!Array.isArray(subtasks) || !subtasks.every(s => typeof s === 'string')) {
        console.error("AI response for subtasks was not a valid JSON array of strings. Parsed:", subtasks, "Original:", response.text);
        // Instead of throwing, return empty or a special signal if needed
        return []; 
      }
    } catch (e: any) {
      console.error("Failed to parse JSON subtasks from AI. Raw:", response.text, "Attempted to parse:", jsonStr, "Error:", e);
      // Instead of throwing, return empty or a special signal
      return []; 
    }
    
    return subtasks;

  } catch (error: any) {
    // Log the error but return an empty array to prevent breaking the UI flow.
    // The calling component (AiSubtaskSuggestionModal) will show "no suggestions".
    console.error(handleGeminiError(error, 'generateSubtasksForTask'));
    return []; 
  }
};
