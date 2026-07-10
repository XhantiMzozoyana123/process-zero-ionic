export type SurveyQuestionType = 'MultipleChoice' | 'OpenEnded' | 0 | 1;

export interface SurveyQuestion {
  id: number;
  text: string;
  type: SurveyQuestionType;
  required: boolean;
  options?: string[];
}

export interface Survey {
  id: number;
  name: string;
  title: string;
  description: string;
  status: 'Active' | 'Draft' | 'Archived' | 'Closed';
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
}

/**
 * SurveyResponseResultDto
 * Returned by POST /api/survey/submit and GET /api/survey/response/{id}
 * Contains contact info extracted from answers[0-6] AND business answers[7+].
 */
export interface SurveyResponseResult {
  id: number;
  surveyId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company?: string;
  job?: string;
  industry?: string;
  answers: string[];       // business answers only (indices 7+)
  submittedAt: string;
}

export interface SurveyResponse {
  id: number;
  surveyId: number;
  answers: string[];
  submittedAt: string;
}

export interface SurveySummary {
  surveyId: number;
  name: string;
  title: string;
  totalResponses: number;
  responses: SurveyResponseResult[];
  collectedFrom: string;
  collectedTo: string;
}

export interface SurveysList {
  id: number;
  name: string;
  title: string;
  status: string;
  responseCount: number;
  uploadedAt: string;
}