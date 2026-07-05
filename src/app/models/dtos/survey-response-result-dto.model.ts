export interface SurveyResponseResultDto {
  id: number;
  surveyId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  job: string;
  industry: string;
  answers: string[];
  submittedAt: string;
}