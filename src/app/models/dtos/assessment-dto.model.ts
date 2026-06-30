export interface QuestionClientDto {
  text: string;
  options: string[];
  weight: number;
}

export interface OpenQuestionDto {
  text: string;
  weight: number;
}

export interface AssessmentClientDto {
  title: string;
  description: string;
  productId: number;
  mcqs: QuestionClientDto[];
  openQuestions: OpenQuestionDto[];
}

export interface SubmissionDto {
  mcqAnswers: number[];
  openAnswers: (string | null)[];
}

export interface SubmissionResultDto {
  productId: number;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}

export interface QuestionDto {
  text: string;
  options: string[];
  correctIndex: number;
  weight: number;
}

export interface AssessmentDto {
  title: string;
  description: string;
  productId: number;
  passMark?: number | null;
  mcqs: QuestionDto[];
  openQuestions: OpenQuestionDto[];
}

/** Admin-facing result that includes the submitting user's id */
export interface AdminSubmissionResultDto {
  userId: string;
  productId: number;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  submittedAt?: string;
  // enriched client-side
  _userName?: string;
  _email?: string;
}
