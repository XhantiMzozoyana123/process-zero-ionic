import { SurveyQuestionDto } from './survey-question-dto.model';

export interface SurveyClientDto {
  id: number;
  name: string;
  title: string;
  description: string;
  status: string;
  questions: SurveyQuestionDto[];
}