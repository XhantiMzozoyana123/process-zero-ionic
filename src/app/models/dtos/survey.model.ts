export type SurveyQuestionType = 'MultipleChoice' | 'OpenEnded';

export type SurveyQuestionCategory = 'Contact' | 'Business';

export interface SurveyQuestion {
  id: number;
  /**
   * Display order. In the relational model contact questions are rows 0-6 and
   * business questions are rows 7+. The public GET endpoint returns questions
   * already ordered by this value, so answers submitted positionally line up
   * with these rows.
   */
  order?: number;
  text: string;
  type: SurveyQuestionType;
  required: boolean;
  /**
   * Category of the question. Used by the controller to auto-prepend contact
   * questions (0-6) and treat business questions (7+) separately. When present
   * this is the authoritative source for distinguishing contact vs business;
   * otherwise the page falls back to text heuristics.
   */
  category?: SurveyQuestionCategory;
  /**
   * Answer option texts for MultipleChoice questions. Stored as individual
   * SurveyQuestionOption rows on the backend; the DTO projects them to strings.
   */
  options?: string[];
}

export interface Survey {
  id: number;
  name: string;
  title: string;
  description: string;
  status: 'Active' | 'Draft' | 'Archived' | 'Closed';
  questions: SurveyQuestion[];
  /** URL for demo call booking (used in business audit emails). */
  bookingLink?: string;
  /** Last uploaded/modified timestamp (backend Surveys.UploadedAt). */
  uploadedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payload accepted by POST /api/survey/submit.
 * Each entry in `answers` maps positionally to a SurveyQuestion row ordered by
 * Order (contact 0-6, business 7+).
 */
export interface SurveyResponseSubmissionDto {
  surveyId: number;
  answers: string[];
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