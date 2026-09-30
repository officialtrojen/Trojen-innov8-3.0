'use client';

import React, { useState } from 'react';
import { FormField, LogicRule, LogicCondition, LogicAction } from '@/lib/types';
import { LOGIC_OPERATORS } from '@/lib/logic-engine';
import { generateId } from '@/lib/utils';
import { Plus, Trash2, GitBranch } from 'lucide-react';

interface LogicPanelProps {
  rules: LogicRule[];
  fields: FormField[];
  onAddRule: (rule: LogicRule) => void;
  onUpdateRule: (ruleId: string, updates: Partial<LogicRule>) => void;
  onDeleteRule: (ruleId: string) => void;
}

const ACTION_TYPES = [
  { value: 'show', label: 'Show question' },
  { value: 'hide', label: 'Hide question' },
  { value: 'jump', label: 'Jump to question' },
  { value: 'end_form', label: 'End form' },
] as const;

export default function LogicPanel({
  rules,
  fields,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
}: LogicPanelProps) {
  const [showNew, setShowNew] = useState(false);

  const handleAdd = () => {
    if (fields.length < 2) return;

    const newRule: LogicRule = {
      id: generateId('rule'),
      condition: {
        questionId: fields[0].id,
        operator: 'equals',
        value: '',
      },
      action: {
        type: 'show',
        targetQuestionId: fields[1]?.id,
      },
    };

    onAddRule(newRule);
    setShowNew(false);
  };

  return (
    <div
      style={{
        padding: '20px 18px',
        background: '#FFFEF9',
        color: '#263B3B',
        minHeight: '100%',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#4F7C7A',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid #B8CECF',
          paddingBottom: 10,
        }}
      >
        <GitBranch size={14} color="#4F7C7A" />
        Conditional Branching
      </div>

      {fields.length < 2 && (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            background: '#EAF4F4',
            border: '1px solid #B8CECF',
            fontSize: 12,
            color: '#365F5D',
            marginBottom: 16,
          }}
        >
          Add at least 2 questions to configure intelligent jump logic.
        </div>
      )}

      {/* Existing rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {rules.map((rule) => (
          <RuleEditor
            key={rule.id}
            rule={rule}
            fields={fields}
            onUpdate={(updates) => onUpdateRule(rule.id, updates)}
            onDelete={() => onDeleteRule(rule.id)}
          />
        ))}
      </div>

      {rules.length === 0 && fields.length >= 2 && (
        <div style={{ padding: 24, textAlign: 'center', color: '#365F5D', fontSize: 13, marginBottom: 16 }}>
          No logic rules created yet. Add a rule to show/hide or jump between questions.
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={fields.length < 2}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 8,
          border: '1.5px solid #4F7C7A',
          background: '#EAF4F4',
          color: '#4F7C7A',
          fontWeight: 700,
          fontSize: 13,
          cursor: fields.length < 2 ? 'not-allowed' : 'pointer',
          opacity: fields.length < 2 ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (fields.length >= 2) e.currentTarget.style.background = '#CFE5E3';
        }}
        onMouseLeave={(e) => {
          if (fields.length >= 2) e.currentTarget.style.background = '#EAF4F4';
        }}
      >
        <Plus size={15} /> Add Logic Rule
      </button>
    </div>
  );
}

// ---------- Rule Editor ----------
function RuleEditor({
  rule,
  fields,
  onUpdate,
  onDelete,
}: {
  rule: LogicRule;
  fields: FormField[];
  onUpdate: (updates: Partial<LogicRule>) => void;
  onDelete: () => void;
}) {
  const selectedOperator = LOGIC_OPERATORS.find((o) => o.value === rule.condition.operator);
  const sourceField = fields.find((f) => f.id === rule.condition.questionId);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '7px 10px',
    borderRadius: 6,
    border: '1.5px solid #B8CECF',
    background: '#FFFEF9',
    color: '#263B3B',
    fontSize: 12,
    outline: 'none',
    marginBottom: 6,
  };

  return (
    <div
      style={{
        border: '1.5px solid #B8CECF',
        borderRadius: 10,
        padding: 14,
        background: '#EAF4F4',
      }}
    >
      {/* IF */}
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            display: 'inline-block',
            background: '#4F7C7A',
            color: '#FFFEF9',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          IF
        </span>
        <select
          value={rule.condition.questionId}
          onChange={(e) =>
            onUpdate({
              condition: { ...rule.condition, questionId: e.target.value },
            })
          }
          style={inputStyle}
        >
          {fields.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>

        <select
          value={rule.condition.operator}
          onChange={(e) =>
            onUpdate({
              condition: { ...rule.condition, operator: e.target.value as LogicCondition['operator'] },
            })
          }
          style={inputStyle}
        >
          {LOGIC_OPERATORS.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>

        {selectedOperator?.requiresValue && (
          <>
            {sourceField?.type === 'multiple_choice' && sourceField.options ? (
              <select
                value={String(rule.condition.value || '')}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...rule.condition, value: e.target.value },
                  })
                }
                style={inputStyle}
              >
                <option value="">Select option value...</option>
                {sourceField.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                value={String(rule.condition.value || '')}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...rule.condition, value: e.target.value },
                  })
                }
                placeholder="Value..."
                style={inputStyle}
              />
            )}
          </>
        )}
      </div>

      {/* THEN */}
      <div>
        <span
          style={{
            display: 'inline-block',
            background: '#CFE5E3',
            color: '#263B3B',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          THEN
        </span>
        <select
          value={rule.action.type}
          onChange={(e) =>
            onUpdate({
              action: { ...rule.action, type: e.target.value as LogicAction['type'] },
            })
          }
          style={inputStyle}
        >
          {ACTION_TYPES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>

        {rule.action.type !== 'end_form' && (
          <select
            value={rule.action.targetQuestionId || ''}
            onChange={(e) =>
              onUpdate({
                action: { ...rule.action, targetQuestionId: e.target.value },
              })
            }
            style={inputStyle}
          >
            <option value="">Select target question...</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Delete */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          onClick={onDelete}
          style={{
            color: '#e74c3c',
            background: 'transparent',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Trash2 size={13} /> Remove
        </button>
      </div>
    </div>
  );
}
