import { GoogleGenAI } from "@google/genai";
import { WorkflowNode } from "../types";

// Helper to format the current workflow for the AI
const formatWorkflowContext = (nodes: WorkflowNode[]): string => {
  if (nodes.length === 0) return "The workflow is currently empty.";
  
  return nodes.map((node, index) => {
    return `${index + 1}. [${node.type}] ${node.blockType} - ${node.title}`;
  }).join('\n');
};

export const generateAIResponse = async (
  message: string, 
  currentWorkflow: WorkflowNode[],
  history: {role: string, content: string}[]
) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a system prompt based on the context
    const workflowContext = formatWorkflowContext(currentWorkflow);
    const systemInstruction = `You are an expert AI assistant for a clinical workflow builder called 'Vibrant Intelligence'. 
    Your goal is to help clinicians automate their patient care programs.
    
    Current Workflow State:
    ${workflowContext}
    
    The user can add Triggers (events that start the flow), Actions (tasks performed), and Logic (delays, conditions).
    Provide helpful, concise, and clinical-context aware suggestions.
    If the user asks to add a specific block, explain where it might fit best.
    `;

    const model = 'gemini-3-flash-preview';
    
    // Simple chat generation
    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] }, // Priming context
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the assistance service right now. Please try again later.";
  }
};
