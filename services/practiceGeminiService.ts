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
    await new Promise(resolve => setTimeout(resolve, 1200));

    const lowerQuery = query.toLowerCase();

    // No-show rates query
    if (lowerQuery.includes('no-show') || lowerQuery.includes('no show') || lowerQuery.includes('noshow')) {
        return `## No-Show Rates - Past Month

### Overall Summary
**Total No-Show Rate: 12.3%** (down from 14.1% last month)
**Total Appointments: 847**
**No-Show Appointments: 104**

### Breakdown by Day
| Day of Week | No-Show Rate |
|------------|--------------|
| Monday | 8.2% |
| Tuesday | 10.5% |
| Wednesday | 11.8% |
| Thursday | 14.2% |
| Friday | 16.8% |

### Key Insights
• **Fridays show the highest no-show rate** (16.8%) - consider reminder calls
• **Monday appointments have best attendance** (8.2% no-show)
• **Afternoon slots (2-5pm)** have 35% higher no-show rate than mornings
• **New patients** no-show rate: 18.5% vs **established patients**: 9.2%

### Recommendations
1. Implement SMS reminders 24h before appointments (could reduce by ~30%)
2. Overbook Friday afternoon slots by 10-15%
3. Double-book new patient initial consultations

Would you like me to break down the data by provider or appointment type?`;
    }

    // Revenue queries
    if (lowerQuery.includes('revenue') || lowerQuery.includes('income') || lowerQuery.includes('financial')) {
        return `## Financial Performance - ${currentRange}

### Revenue Overview
**Total Revenue: $284,520** (+12% vs previous period)
**Collections: $268,340** (94.3% collection rate)
**Outstanding: $16,180**

### Top Revenue Sources
1. Consultations: $98,400 (34.6%)
2. Lab Testing: $76,800 (27.0%)
3. Treatment Plans: $52,200 (18.3%)
4. Follow-ups: $38,120 (13.4%)

### Trends
• ✅ Revenue up 12% from last ${currentRange}
• ✅ Lab testing revenue increased 18%
• ⚠️ Outstanding collections up 8% - follow up recommended`;
    }

    // Patient growth queries
    if (lowerQuery.includes('patient') && (lowerQuery.includes('growth') || lowerQuery.includes('new') || lowerQuery.includes('acquisition'))) {
        return `## Patient Growth - ${currentRange}

### New Patients
**28 new patients** this ${currentRange}
- 15 from referrals (53%)
- 8 from online/marketing (29%)
- 5 from other sources (18%)

### Patient Breakdown
**Active Patients: 642**
- New (active <3 months): 84
- Established (3-12 months): 198
- Long-term (12+ months): 360

### Churn Analysis
• **Patient churn rate: 4.2%** (down from 5.1%)
• Most common reason for leaving: relocation (42%)
• Insurance changes: 28% of cancellations`;
    }

    // Engagement queries
    if (lowerQuery.includes('engagement') || lowerQuery.includes('retention')) {
        return `## Patient Engagement - ${currentRange}

### Engagement Score
**82% engagement rate** (up from 79%)

### Metrics
• **Appointment Completion: 87.7%** (847 of 966 scheduled)
• **Portal Usage: 64%** active on patient portal
• **Survey Response Rate: 34%**
• **Follow-up Compliance: 76%**

### At-Risk Patients
3 patients flagged for low engagement:
- **Amanda Lee** - Last visit: 67 days ago
- **Kevin Johnson** - Missed last 2 appointments
- **Robert Chen** - Unresponsive to outreach`;
    }

    // Default response
    return `## Practice Insights - ${scope}

Based on **${currentRange}**, here are the key metrics:

### Highlights
• 📈 **Patient Growth**: +28 new patients
• 💰 **Revenue**: $284,520 (+12% vs last period)
• ⭐ **Engagement**: 82% (up from 79%)
• 📅 **Appointment Completion**: 87.7%

### Quick Stats
- **Active Patients**: 642
- **Avg. Daily Appointments**: 38
- **Collection Rate**: 94.3%
- **Patient Satisfaction**: 4.7/5.0

Would you like me to elaborate on any specific metric or dive deeper into a particular area?`;
};
