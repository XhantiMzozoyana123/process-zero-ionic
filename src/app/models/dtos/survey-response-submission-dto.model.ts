import { SurveyRespondentSubmissionDto } from './survey-respondent-submission-dto.model';

export interface SurveyResponseSubmissionDto {
  respondent: SurveyRespondentSubmissionDto;
  answers: string[];
}