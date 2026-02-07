// Practice Gemini Service migrated from myPractice folder
// Note: AI functionality is simulated for demo purposes - no API key required
import { AI_ENGAGEMENT_SUMMARY, MOCK_AT_RISK_PATIENTS, AI_FINANCIAL_SUMMARY } from '../practiceConstants';
import { AtRiskPatient } from "../practiceTypes";

interface EngagementAnalysis {
    summary: string;
    atRiskPatients: AtRiskPatient[];
    sentimentEmoji: string;
}

export const analyzeEngagement = async (engagementData: any): Promise<EngagementAnalysis> => {
    // Simulated logic for demo - no API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
        summary: AI_ENGAGEMENT_SUMMARY,
        atRiskPatients: MOCK_AT_RISK_PATIENTS,
        sentimentEmoji: '🙂',
    };
};

export const analyzeFinancials = async (revenueData: any[], costData: any[]): Promise<string> => {
    // Simulated logic for demo - no API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return AI_FINANCIAL_SUMMARY;
};

/**
 * Practice Insights Assistant
 * Handles user queries about clinic metrics with strict constraints.
 * For demo purposes, returns simulated responses without API calls.
 */
export const queryPracticeInsights = async (query: string, currentRange: string, scope: string = "Practice-wide"): Promise<string> => {
    // Simulated response for demo - no API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return `Based on the selected date range for ${scope}, here are the key insights: Patient growth is strong with 28 new patients. Engagement rate stands at 82% with healthy sentiment. Revenue is up 12% compared to the previous period. Would you like me to elaborate on any specific metric?`;
};
