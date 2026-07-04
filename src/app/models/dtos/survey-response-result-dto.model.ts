export interface SurveyResponseResultDto {
  id: number;
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