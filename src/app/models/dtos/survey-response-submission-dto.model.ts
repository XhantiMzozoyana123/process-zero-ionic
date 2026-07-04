/**
 * Survey response submission matching the backend C# SurveyResponseSubmissionDto.
 *
 * CRITICAL: The answers array must have one entry per question in the survey's Questions array.
 * The backend prepends 7 contact questions (indices 0-6) to every survey, so the frontend
 * receives ALL questions (contact + business) from GET /api/survey.
 *
 * Answers array structure:
 *   answers[0]: Email address (REQUIRED)
 *   answers[1]: First name (REQUIRED)
 *   answers[2]: Last name (REQUIRED)
 *   answers[3]: Phone number (REQUIRED)
 *   answers[4]: Company (optional, can be empty string)
 *   answers[5]: Job title (optional, can be empty string)
 *   answers[6]: Industry (optional, can be empty string)
 *   answers[7+]: Business/pain point question responses
 */
export interface SurveyResponseSubmissionDto {
  answers: string[];
}