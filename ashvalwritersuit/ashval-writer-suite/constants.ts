
import { OperationMode, NoteTemplate, ExportTemplate } from './types';
import { Palette, Edit3, MessageSquare, Zap, FileEdit, FileSignature, GitFork, Cpu, Layers, Aperture, Users } from 'lucide-react';

export const OPERATION_MODES: OperationMode[] = [
  { value: 'chat', label: 'แชททั่วไป', systemInstruction: 'You are a helpful assistant.', icon: MessageSquare },
  { value: 'brainstorm', label: 'ระดมสมอง', systemInstruction: 'You are a creative partner for brainstorming ideas. Provide diverse and imaginative suggestions.', icon: Zap },
  { value: 'summarize', label: 'สรุปเนื้อหา', systemInstruction: 'Summarize the provided text concisely and accurately, highlighting key points.', icon: FileSignature },
  { value: 'critique', label: 'วิจารณ์/ให้คำแนะนำ', systemInstruction: 'Provide constructive criticism and feedback on the provided text. Focus on clarity, coherence, and impact.', icon: FileEdit}, // Changed Drama to FileEdit
  { value: 'custom', label: 'กำหนดเอง', systemInstruction: 'You will follow my custom instructions precisely.', icon: Edit3 },
  { value: 'plot_dev', label: 'พัฒนาโครงเรื่อง', systemInstruction: 'You are an expert screenwriter and novelist. Help develop plot points, character arcs, and story structure. Ask clarifying questions to understand the user\'s vision.', icon: GitFork },
  { value: 'character_dev', label: 'พัฒนาตัวละคร', systemInstruction: 'You are a character development specialist. Help create deep, believable characters with clear motivations, flaws, and backstories. Explore different archetypes and personality traits.', icon: Users },
  { value: 'world_building', label: 'สร้างโลก/ฉาก', systemInstruction: 'You are a world-building expert. Help create rich and immersive settings, cultures, histories, and rules for fictional worlds.', icon: Aperture },
  { value: 'dialogue_writer', label: 'เขียนบทสนทนา', systemInstruction: 'You are a master of dialogue. Write engaging, natural-sounding conversations that reveal character and advance the plot. Pay attention to subtext and pacing.', icon: MessageSquare },
  { value: 'prose_enhancer', label: 'ปรับปรุงสำนวน', systemInstruction: 'Analyze the provided text and suggest improvements to prose, style, word choice, and flow. Aim for vivid imagery and engaging language.', icon: Palette },
  { value: 'lore_generator', label: 'สร้างข้อมูล Lore', systemInstruction: 'Generate detailed lore entries for characters, locations, items, or events based on provided themes or concepts. Ensure consistency with existing lore if provided.', icon: Layers },
];

export const INITIAL_AI_RESPONSE_MESSAGE = "สวัสดีครับ! มีอะไรให้ช่วยในการเขียนของคุณวันนี้ครับ?";
export const PROCESSING_AI_RESPONSE_MESSAGE = "กำลังประมวลผลคำขอของคุณสักครู่นะครับ...";
export const AI_MAX_INPUT_CHARS = 15000; // Increased limit slightly
export const MAX_CHAT_EXCHANGES = 20; // Increased chat history
export const PROJECT_CONTEXT_MAX_NOTE_CHARS = 2000;
export const PROJECT_CONTEXT_MAX_LORE_CHARS = 2000;
export const MAX_PROJECT_NOTES_IN_CONTEXT = 5;
export const MAX_PROJECT_LORE_IN_CONTEXT = 5;

export const MODEL_NAME = "gemini-2.5-flash-preview-04-17"; 
export const AVAILABLE_AI_MODELS = [
    { id: "gemini-2.5-flash-preview-04-17", name: "Gemini 2.5 Flash (Preview)" },
    // { id: "gemini-1.5-pro-preview-0409", name: "Gemini 1.5 Pro (Preview)" } 
];


export const NOTE_TEMPLATES: NoteTemplate[] = [
  { name: 'บันทึกทั่วไป', content: '# General Note\n\nStart your note here...', icon: 'StickyNote' },
  { name: 'แนวคิดตัวละคร', content: '# Character Idea\n\nName: \nConcept: \nMotivation: \nConflict: ', icon: 'Users', category: 'Writing' },
  { name: 'โครงเรื่องย่อ', content: '# Plot Outline\n\nLogline: \n\n## Act 1\n- Setup: \n- Inciting Incident: \n\n## Act 2\n- Rising Action: \n- Midpoint: \n\n## Act 3\n- Climax: \n- Resolution: ', icon: 'GitFork', category: 'Writing' },
  { name: 'ข้อมูลสถานที่', content: '# Location Details\n\nName: \nDescription: \nSignificance: \nAtmosphere: ', icon: 'MapPin', category: 'WorldBuilding' },
  { name: 'รายการสิ่งที่ต้องทำ', content: '# To-Do List\n\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3', icon: 'CheckSquare', category: 'Productivity' },
];

export const SYSTEM_NOTE_TEMPLATES = NOTE_TEMPLATES; // Alias for clarity if needed

export const EXPORT_TEMPLATES: ExportTemplate[] = [
    { id: 'default_md_note', name: 'Default Markdown (Note)', template: '# {{title}}\n\nTags: {{#if tags}}{{#each tags}}#{{this}} {{/each}}{{else}}N/A{{/if}}\nCategory: {{category}}\nCreated: {{createdAt}}\nUpdated: {{updatedAt}}\n\n{{{content}}}', type: 'note', fileType: 'md' },
    { id: 'default_txt_note', name: 'Default Plain Text (Note)', template: 'Title: {{title}}\n\nTags: {{#if tags}}{{#each tags}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}N/A{{/if}}\nCategory: {{category}}\nCreated: {{createdAt}}\nUpdated: {{updatedAt}}\n\n{{stripHtml content}}', type: 'note', fileType: 'txt' },
    { id: 'default_md_project', name: 'Default Markdown (Project)', template: '# Project: {{name}}\n\n{{#if description}}Description: {{description}}\n{{/if}}Genre: {{genre}}\nCreated: {{createdAt}}\n\n## Notes\n{{#each notes}}\n### {{this.title}}\nCategory: {{this.category}}\n{{{this.content}}}\n---\n{{/each}}\n\n## Lore Entries\n{{#each loreEntries}}\n### {{this.title}} ({{this.type}})\n{{{this.content}}}\n---\n{{/each}}', type: 'project', fileType: 'md' },
];

export const DEFAULT_PROJECT_ID = "default_project_ashval";
export const UNCATEGORIZED_PROJECT_ID = "uncategorized_ashval";

export const ASHVAL_MASCOT_QUOTES = [
    "Let's get those creative gears turning!",
    "Need a spark? I'm full of bright ideas!",
    "Don't forget to save your brilliant work!",
    "Writer's block? Let's brainstorm a way out!",
    "Every word counts towards your masterpiece.",
    "Ready to outline the next bestseller?",
    "What story are we weaving today?",
    "Remember, even a blank page holds infinite possibilities.",
    "Let's organize those thoughts into something amazing!",
    "Time for a creative session? I'm ready when you are!"
];
