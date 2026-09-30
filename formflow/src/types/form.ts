export type FieldType = 
  | 'short_text' 
  | 'paragraph' 
  | 'multiple_choice' 
  | 'rating' 
  | 'file_upload' 
  | 'date';

export type LayoutMode = 'single_page' | 'conversational';

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: string[]; // for multiple_choice
  minRating?: number; // for rating
  maxRating?: number; // for rating
  validation?: ValidationRule;
  fontFamily?: string;
}

export type LogicOperator = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty';
export type LogicActionType = 'jump_to' | 'show' | 'hide';

export interface LogicCondition {
  fieldId: string;
  operator: LogicOperator;
  value?: string;
}

export interface LogicAction {
  type: LogicActionType;
  targetFieldId: string;
}

export interface LogicRule {
  id: string;
  title?: string;
  sourceFieldId: string;
  condition: LogicCondition;
  action: LogicAction;
  elseAction?: LogicAction;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  bannerImage?: string;
  layoutMode: LayoutMode;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  event: 'on_submission';
  headers?: Record<string, string>;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  theme: FormTheme;
  fields: FormField[];
  logicRules: LogicRule[];
  webhooks: WebhookConfig[];
}

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: string;
  answers: Record<string, any>;
  respondentMeta?: {
    device?: 'desktop' | 'mobile' | 'tablet';
    durationSeconds?: number;
    userAgent?: string;
  };
}
