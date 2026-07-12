/**
 * Model for structured visual audit report data
 */
export interface AuditChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface AuditReport {
  inventoryHealthScore: number;
  inventoryHealthLabel: string;
  topRisks: AuditChartData;
  topOpportunities: AuditChartData;
  timeSavingsHours: number;
  costSavingsPercentage: number;
  overallScore: number;
  responsesAnalyzed: number;
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