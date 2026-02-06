
import { GoogleGenAI } from "@google/genai";
import { AI_ENGAGEMENT_SUMMARY, MOCK_AT_RISK_PATIENTS, AI_FINANCIAL_SUMMARY, METRIC_LIBRARY_DATA } from '../constants';
import { AtRiskPatient, RevenueData, CostData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface EngagementAnalysis {
    summary: string;
    atRiskPatients: AtRiskPatient[];
    sentimentEmoji: string;
}

export const analyzeEngagement = async (engagementData: any): Promise<EngagementAnalysis> => {
    // Simulated existing logic
    await new Promise(resolve => setTimeout(resolve, 800)); 
    return {
        summary: AI_ENGAGEMENT_SUMMARY,
        atRiskPatients: MOCK_AT_RISK_PATIENTS,
        sentimentEmoji: '🙂',
    };
};

export const analyzeFinancials = async (revenueData: RevenueData[], costData: CostData[]): Promise<string> => {
    // Simulated existing logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    return AI_FINANCIAL_SUMMARY;
};

/**
 * Practice Insights Assistant
 * Handles user queries about clinic metrics with strict constraints.
 */
export const queryPracticeInsights = async (query: string, currentRange: string, scope: string = "Practice-wide"): Promise<string> => {
    // Construct metric context from the library
    const metricContext = Object.entries(METRIC_LIBRARY_DATA)
        .map(([category, metrics]) => {
            return `${category}:\n` + metrics.map(m => `- ${m.label}: ${m.value} (${m.description})`).join('\n');
        }).join('\n\n');

    const systemInstruction = `You are a Practice Insights assistant.

You are currently viewing data for: ${scope}.
You may only answer questions related to metrics defined in the Metric Library.
All responses must be based on aggregated data for the current scope (${scope}).
Do not reference or infer any patient-identifiable information.

Metric Library Data Context (Aggregated for ${scope}):
${metricContext}

Current Selected Date Range: ${currentRange}

When a user asks about a metric:
- Summarize the current value within the selected date range for ${scope}.
- Compare it to the previous equivalent period when available.
- Explain the change using existing metrics only.
- Do not speculate beyond available data.

When a metric is unavailable due to the selected date range, respond exactly with:
"This metric is not available for the selected date range. Try expanding the date range to view trends and comparisons."

When a user asks about unsupported, patient-level, or non-metric content, respond exactly with:
"I can help explain trends and changes in your ${scope} metrics, but this insight is not available here. Try asking about one of the metrics shown above."

Rules:
- Be concise and factual.
- Avoid clinical, financial, or operational recommendations.
- Avoid judgmental language.
- Avoid generating new or inferred metrics.
- You may suggest related metrics from the Metric Library but must not automatically change the UI.

Example response format:
"Based on the selected date range for ${scope}, acquisitions were ${scope === 'Practice-wide' ? '41' : '12'} during this period. You may want to review related metrics such as Engagement Rate for additional context."`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: query,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2, // Keep it factual and predictable
            },
        });

        return response.text || "I'm sorry, I couldn't generate a response at this time.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "An error occurred while fetching practice insights. Please try again.";
    }
};
