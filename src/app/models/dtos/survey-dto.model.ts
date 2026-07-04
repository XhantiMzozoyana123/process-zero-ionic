import { SurveyQuestionDto } from './survey-question-dto.model';

export interface SurveyDto {
  title: string;
  description: string;
  questions: SurveyQuestionDto[];
}