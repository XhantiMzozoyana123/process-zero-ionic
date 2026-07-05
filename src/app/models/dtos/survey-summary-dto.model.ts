import { SurveyResponseResultDto } from './survey-response-result-dto.model';

export interface SurveySummaryDto {
  surveyId: number;
  name: string;
  title: string;
  totalResponses: number;
  responses: SurveyResponseResultDto[];
  collectedFrom: string;
  collectedTo: string;
}