
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Use localStorage key if available (compatibility mode), otherwise process.env
const getApiKey = () => {
    const storedKey = localStorage.getItem('userGeminiApiKey');
    return storedKey || apiKey;
};

const getAIModel = () => {
    const storedModel = localStorage.getItem('selectedGeminiModel');
    return storedModel && storedModel !== 'auto' ? storedModel : 'gemini-2.5-flash';
};

export const generateAIResponse = async (
    prompt: string, 
    context: string = '', 
    aiName: string = 'Memo',
    mentionedTabs: {name: string, content: string}[] = []
): Promise<string> => {
    const currentKey = getApiKey();
    if (!currentKey) {
        return "AI Error: API Key not configured. Please set it in Settings or Environment.";
    }

    const ai = new GoogleGenAI({ apiKey: currentKey });
    const modelName = getAIModel();

    // Build mentioned tabs content string
    let mentionedTabsContent = '';
    if (mentionedTabs.length > 0) {
        mentionedTabsContent = '\n\nMENTIONED TABS:\n';
        mentionedTabs.forEach(tab => {
            mentionedTabsContent += `\n--- Tab: "${tab.name}" ---\n${tab.content || '(empty)'}\n`;
        });
        mentionedTabsContent += '\n';
    }

    // Construct the system instruction - PURELY INFORMATIONAL, NO ACTIONS
    const systemInstruction = `Your name is ${aiName}. You are a helpful AI assistant for a notepad application.

${context ? `The user's current note content (active tab):\n\n${context}\n` : ''}
${mentionedTabsContent}
The user's question/request: ${prompt}

IMPORTANT: You only have ONE answer. Answer precisely and concisely. The user cannot reply to you, so give your complete answer in one response.

- Answer questions, calculations, explanations, and general queries normally and directly.
- TAB CONTEXT: When the user asks about "this tab", "current tab", "active tab", or "my tab", they are referring to the note content shown above.
- CONTEXT AWARENESS: When the user asks "what's my name", look in the note content. If not found, say you don't know.
- RESTRICTION: You DO NOT have any control over the application. You cannot create, delete, modify, or rename tabs or groups. You cannot change settings. You can ONLY answer questions based on the text provided in the prompt.
- If the user asks you to perform an action (like "create a new tab"), politely explain that you are an informational assistant only and cannot control the app directly.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: systemInstruction,
        });
        return response.text || "No response generated.";
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return `Error: ${error.message || "Unknown error occurred"}`;
    }
};
