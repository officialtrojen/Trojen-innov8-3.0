import { FormField, LogicRule } from '@/types/form';

export interface LogicEvaluationResult {
  visibleFieldIds: Set<string>;
  nextFieldId?: string;
}

/**
 * Evaluates conditional logic rules against current answers.
 * Returns:
 * - visibleFieldIds: Set of field IDs that should be visible
 * - getNextField: function to calculate next question in conversational mode
 */
export function evaluateFormLogic(
  fields: FormField[],
  rules: LogicRule[],
  answers: Record<string, any>,
  currentFieldId?: string
) {
  // Start with all fields visible by default
  const hiddenFields = new Set<string>();
  let jumpTargetId: string | null = null;

  for (const rule of rules) {
    const sourceVal = answers[rule.sourceFieldId];
    const condition = rule.condition;
    let isMatch = false;

    if (condition.operator === 'is_empty') {
      isMatch = sourceVal === undefined || sourceVal === null || sourceVal === '';
    } else if (condition.operator === 'is_not_empty') {
      isMatch = sourceVal !== undefined && sourceVal !== null && sourceVal !== '';
    } else if (sourceVal !== undefined && sourceVal !== null) {
      const strVal = String(sourceVal).toLowerCase().trim();
      const targetVal = String(condition.value || '').toLowerCase().trim();

      switch (condition.operator) {
        case 'equals':
          isMatch = strVal === targetVal;
          break;
        case 'not_equals':
          isMatch = strVal !== targetVal;
          break;
        case 'contains':
          isMatch = strVal.includes(targetVal);
          break;
      }
    }

    if (isMatch) {
      if (rule.action.type === 'hide') {
        hiddenFields.add(rule.action.targetFieldId);
      } else if (rule.action.type === 'show') {
        hiddenFields.delete(rule.action.targetFieldId);
      } else if (rule.action.type === 'jump_to') {
        if (!currentFieldId || currentFieldId === rule.sourceFieldId) {
          jumpTargetId = rule.action.targetFieldId;
        }
      }
    } else if (rule.elseAction) {
      if (rule.elseAction.type === 'hide') {
        hiddenFields.add(rule.elseAction.targetFieldId);
      } else if (rule.elseAction.type === 'show') {
        hiddenFields.delete(rule.elseAction.targetFieldId);
      } else if (rule.elseAction.type === 'jump_to') {
        if (!currentFieldId || currentFieldId === rule.sourceFieldId) {
          jumpTargetId = rule.elseAction.targetFieldId;
        }
      }
    }
  }

  const visibleFieldIds = new Set<string>(
    fields.map((f) => f.id).filter((id) => !hiddenFields.has(id))
  );

  return {
    visibleFieldIds,
    jumpTargetId,
  };
}
