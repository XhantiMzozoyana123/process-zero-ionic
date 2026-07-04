import { SurveyQuestionDto } from './survey-question-dto.model';

export interface SurveyClientDto {
  title: string;
  description: string;
  questions: SurveyQuestionDto[];
}