
import { ChatTurn } from '../../../types';

const UNAVAILABLE_MESSAGE_HTML_FRONTEND = `<p class="text-gray-400 dark:text-gray-500 italic">คุณสมบัติ AI ไม่พร้อมใช้งาน กรุณาตรวจสอบว่า Backend Server ทำงานอยู่หรือไม่</p>`;
const STREAM_ERROR_MARKER_FRONTEND = "[[STREAM_ERROR]]"; // Must match backend's stream error marker
// This will be '/api' when built for production and deployed to Firebase Hosting
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5001/ashval-assistent/asia-southeast1/api'; 
// The localhost URL is an example if you are testing with emulators and want to be explicit, 
// but for deployed app, '/api' with rewrites is simpler.
// For emulator, ensure your project ID and region match. Default for functions is often us-central1.

export async function* generateAiContentStream(
  systemInstruction: string,
  userPrompt: string,
  chatHistory?: ChatTurn[],
  customApiKey_DEPRECATED?: string, // No longer used, API key is on backend
  selectedModel?: string
): AsyncGenerator<string, void, undefined> {
  
  const requestBody = {
    systemInstruction,
    userPrompt,
    chatHistory,
    selectedModel
  };

  try {
    // When deployed to Firebase Hosting, '/api/ai/generate-stream' will be rewritten to the function.
    // When using emulators, this path will also work if emulators are configured correctly (hosting + functions)
    // or you might need to use the full emulator URL for the function endpoint if not using hosting emulator with rewrites.
    const response = await fetch(`${BACKEND_API_URL}/ai/generate-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend AI stream error:", response.status, errorText);
      yield `${STREAM_ERROR_MARKER_FRONTEND}<p class="text-red-400 font-semibold">เกิดข้อผิดพลาดจาก Backend (${response.status}): ${errorText || 'ไม่สามารถเชื่อมต่อกับ AI service'}</p>`;
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield `${STREAM_ERROR_MARKER_FRONTEND}<p class="text-red-400 font-semibold">ไม่สามารถอ่าน Stream จาก Backend ได้</p>`;
      return;
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunkText = decoder.decode(value, { stream: true });
      yield chunkText;
    }
  } catch (error: any) {
    console.error("Error calling backend AI stream service:", error);
    yield `${STREAM_ERROR_MARKER_FRONTEND}<p class="text-red-400 font-semibold">เกิดข้อผิดพลาดในการเชื่อมต่อกับ Backend AI Service: ${error.message}</p>`;
  }
}

export const generateSubtasksForTask = async (
    taskTitle: string, 
    taskCategory: string,
    customApiKey_DEPRECATED?: string, // No longer used
    selectedModel?: string
): Promise<string[]> => {
  
  const requestBody = {
    taskTitle,
    taskCategory,
    selectedModel
  };

  try {
    const response = await fetch(`${BACKEND_API_URL}/api/ai/generate-subtasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Backend error ${response.status}`, details: "Unknown error" }));
      console.error("Backend AI subtask error:", response.status, errorData);
      alert(`ไม่สามารถสร้างงานย่อยได้: ${errorData.error || 'ข้อผิดพลาดจาก Backend'}`);
      return [];
    }

    const subtasks = await response.json();
    if (!Array.isArray(subtasks) || !subtasks.every(s => typeof s === 'string')) {
      console.error("Invalid subtask format from backend:", subtasks);
      alert("AI ส่งผลลัพธ์งานย่อยในรูปแบบที่ไม่ถูกต้อง");
      return [];
    }
    return subtasks;

  } catch (error: any) {
    console.error("Error calling backend AI subtask service:", error);
    alert(`เกิดข้อผิดพลาดในการเชื่อมต่อ Backend เพื่อสร้างงานย่อย: ${error.message}`);
    return [];
  }
};
    