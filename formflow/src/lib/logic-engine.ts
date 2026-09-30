// ============================================================
// FormFlow — Conditional Logic Engine
// ============================================================
// This engine evaluates conditional rules defined in the form
// schema and determines which fields should be visible and
// what the next question should be.

import { FormField, LogicRule, LogicCondition, LogicOperator } from './types';

type AnswerValue = string | string[] | number | boolean | null | undefined;

/**
 * Evaluate a single condition against the current answers.
 */
export function evaluateCondition(
  condition: LogicCondition,
  answers: Record<string, AnswerValue>
): boolean {
  const answer = answers[condition.questionId];
  const { operator, value } = condition;

  switch (operator) {
    case 'is_answered':
      return answer !== undefined && answer !== null && answer !== '';

    case 'is_not_answered':
      return answer === undefined || answer === null || answer === '';

    case 'equals':
      if (Array.isArray(answer)) {
        return answer.includes(String(value));
      }
      return String(answer) === String(value);

    case 'not_equals':
      if (Array.isArray(answer)) {
        return !answer.includes(String(value));
      }
      return String(answer) !== String(value);

    case 'contains':
      if (Array.isArray(answer)) {
        return answer.some((a) => String(a).includes(String(value)));
      }
      return String(answer ?? '').includes(String(value));

    case 'not_contains':
      if (Array.isArray(answer)) {
        return !answer.some((a) => String(a).includes(String(value)));
      }
      return !String(answer ?? '').includes(String(value));

    case 'greater_than':
      return Number(answer) > Number(value);

    case 'less_than':
      return Number(answer) < Number(value);

    default:
      return false;
  }
}

/**
 * Evaluate all rules and return sets of field IDs to show/hide,
 * plus any jump or end-form directives.
 */
export function evaluateRules(
  rules: LogicRule[],
  answers: Record<string, AnswerValue>
): {
  showFields: Set<string>;
  hideFields: Set<string>;
  jumpTo: string | null;
  endForm: boolean;
} {
  const showFields = new Set<string>();
  const hideFields = new Set<string>();
  let jumpTo: string | null = null;
  let endForm = false;

  for (const rule of rules) {
    const matches = evaluateCondition(rule.condition, answers);
    if (matches) {
      switch (rule.action.type) {
        case 'show':
          if (rule.action.targetQuestionId) {
            showFields.add(rule.action.targetQuestionId);
          }
          break;
        case 'hide':
          if (rule.action.targetQuestionId) {
            hideFields.add(rule.action.targetQuestionId);
          }
          break;
        case 'jump':
          if (rule.action.targetQuestionId) {
            jumpTo = rule.action.targetQuestionId;
          }
          break;
        case 'end_form':
          endForm = true;
          break;
      }
    }
  }

  return { showFields, hideFields, jumpTo, endForm };
}

/**
 * Determine which fields are currently visible given the
 * answers and conditional logic rules.
 *
 * Fields start visible by default unless a rule explicitly
 * hides them. Show rules override hide rules for the same field.
 */
export function getVisibleFields(
  fields: FormField[],
  rules: LogicRule[],
  answers: Record<string, AnswerValue>
): FormField[] {
  if (rules.length === 0) return fields;

  const { showFields, hideFields } = evaluateRules(rules, answers);

  return fields.filter((field) => {
    // Explicit show overrides hide
    if (showFields.has(field.id)) return true;
    if (hideFields.has(field.id)) return false;
    // Default: visible
    return true;
  });
}

/**
 * For conversational/card layout: get the next question index.
 */
export function getNextQuestion(
  fields: FormField[],
  rules: LogicRule[],
  answers: Record<string, AnswerValue>,
  currentIndex: number
): number | 'end' {
  const { jumpTo, endForm } = evaluateRules(rules, answers);

  if (endForm) return 'end';

  if (jumpTo) {
    const idx = fields.findIndex((f) => f.id === jumpTo);
    if (idx !== -1) return idx;
  }

  // Default: next visible field
  const visibleFields = getVisibleFields(fields, rules, answers);
  const currentField = fields[currentIndex];
  const currentVisibleIdx = visibleFields.findIndex((f) => f.id === currentField?.id);

  if (currentVisibleIdx === -1 || currentVisibleIdx >= visibleFields.length - 1) {
    return 'end';
  }

  const nextVisibleField = visibleFields[currentVisibleIdx + 1];
  return fields.findIndex((f) => f.id === nextVisibleField.id);
}

// ---------- Operator metadata for the UI ----------
export const LOGIC_OPERATORS: {
  value: LogicOperator;
  label: string;
  requiresValue: boolean;
}[] = [
  { value: 'equals', label: 'Equals', requiresValue: true },
  { value: 'not_equals', label: 'Does not equal', requiresValue: true },
  { value: 'contains', label: 'Contains', requiresValue: true },
  { value: 'not_contains', label: 'Does not contain', requiresValue: true },
  { value: 'greater_than', label: 'Greater than', requiresValue: true },
  { value: 'less_than', label: 'Less than', requiresValue: true },
  { value: 'is_answered', label: 'Is answered', requiresValue: false },
  { value: 'is_not_answered', label: 'Is not answered', requiresValue: false },
];
