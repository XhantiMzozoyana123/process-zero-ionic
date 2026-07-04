import { SurveyResponseResultDto } from './survey-response-result-dto.model';

export interface SurveySummaryDto {
  title: string;
  totalResponses: number;
  responses: SurveyResponseResultDto[];
  collectedFrom: string;
  collectedTo: string;
}