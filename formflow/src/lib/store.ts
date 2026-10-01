import { create } from 'zustand';
import {
  FormField,
  FormSchema,
  FieldType,
  FormTheme,
  LogicRule,
  DEFAULT_THEME,
  DEFAULT_SETTINGS,
  FIELD_PALETTE,
} from './types';
import { generateId } from './utils';
import { arrayMove } from '@dnd-kit/sortable';
import { HARDCODED_TYPEFORM_QUESTIONS } from '@/components/form/TypeformRenderer';

interface FormBuilderState {
  schema: FormSchema;
  selectedFieldId: string | null;

  // Actions
  setSelectedFieldId: (id: string | null) => void;
  updateTitle: (title: string) => void;
  updateDescription: (desc: string) => void;
  setSchema: (schema: FormSchema) => void;

  // Field manipulation
  addField: (type: FieldType, customDefaults?: Partial<FormField>) => string;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  reorderFields: (oldIndex: number, newIndex: number) => void;

  // Theme & Poster
  updateTheme: (updates: Partial<FormTheme>) => void;

  // Logic jumps
  addLogicRule: (rule: LogicRule) => void;
  updateLogicRule: (id: string, updates: Partial<LogicRule>) => void;
  deleteLogicRule: (id: string) => void;
}

export const useFormStore = create<FormBuilderState>((set) => ({
  schema: {
    title: 'Interactive Typeform Survey',
    description: 'Customize your blocks, logic jumps, and theme.',
    fields: HARDCODED_TYPEFORM_QUESTIONS,
    logic: [],
    theme: {
      ...DEFAULT_THEME,
      layout: 'conversational',
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #090D16 0%, #0F172A 50%, #1E293B 100%)',
      primary: '#38BDF8',
      text: '#F8FAFC',
    },
    settings: DEFAULT_SETTINGS,
  },
  selectedFieldId: 'block_welcome',

  setSelectedFieldId: (id) => set({ selectedFieldId: id }),

  updateTitle: (title) =>
    set((state) => ({ schema: { ...state.schema, title } })),

  updateDescription: (description) =>
    set((state) => ({ schema: { ...state.schema, description } })),

  setSchema: (schema) => set({ schema }),

  addField: (type, customDefaults) => {
    const id = generateId('block');
    const palette = FIELD_PALETTE.find((p) => p.type === type);

    const newField: FormField = {
      id,
      type,
      label: customDefaults?.label || palette?.defaultField?.label || 'Untitled Question',
      description: customDefaults?.description || '',
      required: customDefaults?.required ?? false,
      placeholder: customDefaults?.placeholder || palette?.defaultField?.placeholder || '',
      options: customDefaults?.options || (type === 'multiple_choice' ? ['Option A', 'Option B', 'Option C'] : undefined),
      selectionMode: customDefaults?.selectionMode || 'single',
      maxStars: customDefaults?.maxStars || (type === 'rating' ? 5 : undefined),
      buttonText: customDefaults?.buttonText || (type === 'welcome_screen' ? 'Start' : undefined),
      ...customDefaults,
    };

    set((state) => ({
      schema: {
        ...state.schema,
        fields: [...state.schema.fields, newField],
      },
      selectedFieldId: id,
    }));

    return id;
  },

  updateField: (id, updates) =>
    set((state) => ({
      schema: {
        ...state.schema,
        fields: state.schema.fields.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
      },
    })),

  deleteField: (id) =>
    set((state) => {
      const remaining = (state.schema.fields || []).filter((f) => f.id !== id);
      const nextSelected =
        state.selectedFieldId === id
          ? remaining.length > 0
            ? remaining[0].id
            : null
          : state.selectedFieldId;

      return {
        schema: {
          ...state.schema,
          fields: remaining,
          logic: (state.schema.logic || []).filter(
            (r) =>
              r.condition.questionId !== id &&
              r.action.targetQuestionId !== id
          ),
        },
        selectedFieldId: nextSelected,
      };
    }),

  duplicateField: (id) =>
    set((state) => {
      const field = state.schema.fields.find((f) => f.id === id);
      if (!field) return state;

      const newId = generateId('block');
      const duplicated: FormField = {
        ...field,
        id: newId,
        label: `${field.label} (Copy)`,
      };

      const index = state.schema.fields.findIndex((f) => f.id === id);
      const fields = [...state.schema.fields];
      fields.splice(index + 1, 0, duplicated);

      return {
        schema: { ...state.schema, fields },
        selectedFieldId: newId,
      };
    }),

  reorderFields: (oldIndex, newIndex) =>
    set((state) => ({
      schema: {
        ...state.schema,
        fields: arrayMove(state.schema.fields, oldIndex, newIndex),
      },
    })),

  updateTheme: (updates) =>
    set((state) => ({
      schema: {
        ...state.schema,
        theme: { ...state.schema.theme, ...updates },
      },
    })),

  addLogicRule: (rule) =>
    set((state) => ({
      schema: {
        ...state.schema,
        logic: [...state.schema.logic, rule],
      },
    })),

  updateLogicRule: (id, updates) =>
    set((state) => ({
      schema: {
        ...state.schema,
        logic: state.schema.logic.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      },
    })),

  deleteLogicRule: (id) =>
    set((state) => ({
      schema: {
        ...state.schema,
        logic: state.schema.logic.filter((r) => r.id !== id),
      },
    })),
}));
