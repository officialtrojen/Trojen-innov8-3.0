// ============================================================
// FormFlow — Core Types
// ============================================================

// ---------- Field Types ----------
export type FieldType =
  | 'welcome_screen'
  | 'short_text'
  | 'paragraph'
  | 'multiple_choice'
  | 'yes_no'
  | 'rating'
  | 'file_upload'
  | 'date_picker';

// ---------- Field Configuration ----------
export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  charLimit?: number;
  minDate?: string;
  maxDate?: string;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  selectionMode?: 'single' | 'multiple';
  maxStars?: number;
  buttonText?: string;
  validation?: FieldValidation;
  fontFamily?: string;
  textColor?: string;
}

// ---------- Conditional Logic ----------
export type LogicOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_answered'
  | 'is_not_answered'
  | 'is_not_empty'
  | 'is_empty';

export type LogicActionType = 'show' | 'hide' | 'jump' | 'jump_to' | 'end_form';

export interface LogicCondition {
  questionId: string;
  operator: LogicOperator;
  value?: string | number;
}

export interface LogicAction {
  type: LogicActionType;
  targetQuestionId?: string;
}

export interface LogicRule {
  id: string;
  condition: LogicCondition;
  action: LogicAction;
  elseAction?: LogicAction;
}

// ---------- Form Theme ----------
export interface FormTheme {
  background: string;
  primary: string;
  secondary: string;
  text: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  layout: 'single-page' | 'conversational';
  logoUrl?: string;
  bannerUrl?: string;
  bannerColor?: string;
  posterColor?: string;
  // Background customization options
  backgroundType?: 'solid' | 'gradient' | 'pattern' | 'image';
  backgroundGradient?: string;
  backgroundPattern?: 'dots' | 'grid' | 'mesh' | 'stripes' | 'none';
  backgroundImage?: string;
  backgroundBlur?: number;
  backgroundOverlay?: number;
  // Form Page / Card customization options
  cardBackground?: string;
  cardOpacity?: number; // 0-100
  cardBorderRadius?: number; // px
  cardShadow?: 'none' | 'subtle' | 'elevated' | 'glow';
  // Poster in form options
  posterUrl?: string;
  posterStyle?: 'banner' | 'card-top' | 'floating' | 'background';
  posterHeight?: number;
  posterOverlay?: number;
  posterTitle?: string;
  posterSubtitle?: string;
}

export const DEFAULT_THEME: FormTheme = {
  background: '#EAF4F4',
  cardBackground: '#FFFFFF',
  cardOpacity: 100,
  cardBorderRadius: 20,
  cardShadow: 'elevated',
  primary: '#4F7C7A',
  secondary: '#CFE5E3',
  text: '#263B3B',
  fontFamily: 'Inter',
  fontSize: 'medium',
  layout: 'single-page',
  backgroundType: 'solid',
  backgroundGradient: 'linear-gradient(135deg, #EAF4F4 0%, #CFE5E3 100%)',
  backgroundPattern: 'none',
  posterHeight: 180,
  posterStyle: 'card-top',
  posterOverlay: 20,
};

// ---------- Form Settings ----------
export interface FormSettings {
  acceptingResponses: boolean;
  showProgressBar: boolean;
  submitButtonText: string;
  successMessage: string;
  closedMessage: string;
}

export const DEFAULT_SETTINGS: FormSettings = {
  acceptingResponses: true,
  showProgressBar: true,
  submitButtonText: 'Submit',
  successMessage: 'Thank you! Your response has been recorded.',
  closedMessage: 'This form is no longer accepting responses.',
};

// ---------- Form Schema ----------
export interface FormSchema {
  title: string;
  description: string;
  fields: FormField[];
  logic: LogicRule[];
  theme: FormTheme;
  settings: FormSettings;
}

// ---------- Database Models ----------
export interface DBForm {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  schema: FormSchema;
  theme: FormTheme;
  status: 'draft' | 'published' | 'closed';
  public_slug: string;
  created_at: string;
  updated_at: string;
}

export interface DBResponse {
  id: string;
  form_id: string;
  answers: Record<string, unknown>;
  metadata: Record<string, unknown>;
  submitted_at: string;
}

export interface DBIntegration {
  id: string;
  form_id: string;
  type: string;
  configuration: {
    url?: string;
    headers?: Record<string, string>;
    [key: string]: unknown;
  };
  enabled: boolean;
  created_at: string;
}

export interface DBWebhookLog {
  id: string;
  integration_id: string;
  response_id: string | null;
  status_code: number | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface DBProfile {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
}

// ---------- Dashboard Stats ----------
export interface DashboardStats {
  totalForms: number;
  publishedForms: number;
  totalResponses: number;
  avgResponseRate: number;
}

// ---------- Field Palette Items ----------
export interface PaletteItem {
  type: FieldType;
  label: string;
  icon: string;
  defaultField: Partial<FormField>;
}

export const FIELD_PALETTE: PaletteItem[] = [
  {
    type: 'welcome_screen',
    label: 'Welcome Screen',
    icon: 'Sparkles',
    defaultField: {
      type: 'welcome_screen',
      label: 'Welcome to our Form',
      description: 'Please answer the following questions to help us understand your needs.',
      required: false,
      buttonText: 'Start Quiz',
    },
  },
  {
    type: 'short_text',
    label: 'Short Text',
    icon: 'Type',
    defaultField: {
      type: 'short_text',
      label: 'Untitled Question',
      required: false,
      placeholder: 'Type your answer...',
    },
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: 'AlignLeft',
    defaultField: {
      type: 'paragraph',
      label: 'Untitled Question',
      required: false,
      placeholder: 'Type your detailed answer...',
      validation: { charLimit: 1000 },
    },
  },
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    icon: 'ListChecks',
    defaultField: {
      type: 'multiple_choice',
      label: 'Untitled Question',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      selectionMode: 'single',
    },
  },
  {
    type: 'yes_no',
    label: 'Yes / No',
    icon: 'CheckSquare',
    defaultField: {
      type: 'yes_no',
      label: 'Do you agree?',
      description: 'Press Y for Yes or N for No',
      required: false,
    },
  },
  {
    type: 'rating',
    label: 'Rating Stars',
    icon: 'Star',
    defaultField: {
      type: 'rating',
      label: 'Untitled Question',
      required: false,
      maxStars: 5,
    },
  },
  {
    type: 'file_upload',
    label: 'File Upload',
    icon: 'Upload',
    defaultField: {
      type: 'file_upload',
      label: 'Upload File',
      required: false,
      validation: { maxFileSize: 10, allowedFileTypes: [] },
    },
  },
  {
    type: 'date_picker',
    label: 'Date Picker',
    icon: 'Calendar',
    defaultField: {
      type: 'date_picker',
      label: 'Select a Date',
      required: false,
    },
  },
];
