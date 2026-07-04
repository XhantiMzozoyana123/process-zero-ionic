import { QuestionCategory } from './question-category.enum';

export interface SurveyQuestionDto {
  id: number;
  text: string;
  isRequired: boolean;
  category?: QuestionCategory;
}