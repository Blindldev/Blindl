export type QuestionType = 'text' | 'email' | 'tel' | 'number' | 'select' | 'multiSelect' | 'textarea';

export interface Validation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  validation?: Validation;
}

export interface QuizData {
  submissionId: string;
  lastUpdated: string;
  submissionStarted: string;
  status: string;
  currentStep: number;
  answers: Record<string, any>;
} 