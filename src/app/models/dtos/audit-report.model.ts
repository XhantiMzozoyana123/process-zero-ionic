/**
 * Model for structured visual audit report data - Generic for any survey type
 */
export interface AuditChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface AuditReport {
  overallScore: number;
  scoreLabel: string;
  keyMetrics: AuditChartData[];
  sentimentScore?: number;
  responseDepth?: number;
  responsesAnalyzed: number;
  // Generic categories for any survey type
  topInsights: string[];
  topOpportunities: AuditChartData;
  surveyType?: string;
}

/**
 * Parsed data from survey responses for chart generation
 */
export interface SurveyAnswersParsed {
  questionTexts: string[];
  answerTexts: string[];
  wordCount: number;
  keyThemes: string[];
}