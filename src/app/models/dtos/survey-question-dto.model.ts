import { QuestionCategory } from './question-category.enum';

export type SurveyQuestionType = 'MultipleChoice' | 'OpenEnded';

export interface SurveyQuestionDto {
  id: number;
  text: string;
  isRequired: boolean;
  category?: QuestionCategory;
  type?: SurveyQuestionType;
  options?: string[];
}