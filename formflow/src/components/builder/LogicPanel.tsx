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
    <div style={{ padding: 20 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#52796F',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <GitBranch size={14} />
        Conditional Logic
      </div>

      {fields.length < 2 && (
        <div style={{ padding: 16, borderRadius: 8, background: 'rgba(207,229,227,0.3)', fontSize: 13, color: '#52796F', marginBottom: 16 }}>
          Add at least 2 fields to create conditional logic.
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
        <div style={{ padding: 24, textAlign: 'center', color: '#52796F', fontSize: 13, marginBottom: 16 }}>
          No logic rules yet. Add your first rule to create branching workflows.
        </div>
      )}

      <button
        onClick={handleAdd}
        className="btn btn-secondary btn-sm"
        style={{ width: '100%' }}
        disabled={fields.length < 2}
      >
        <Plus size={14} /> Add Rule
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

  return (
    <div
      style={{
        border: '1px solid rgba(184,206,207,0.5)',
        borderRadius: 10,
        padding: 14,
        background: 'rgba(255,254,249,0.5)',
      }}
    >
      {/* IF */}
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            display: 'inline-block',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          IF
        </span>
        <select
          className="select"
          value={rule.condition.questionId}
          onChange={(e) =>
            onUpdate({
              condition: { ...rule.condition, questionId: e.target.value },
            })
          }
          style={{ fontSize: 13, marginBottom: 6 }}
        >
          {fields.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>

        <select
          className="select"
          value={rule.condition.operator}
          onChange={(e) =>
            onUpdate({
              condition: { ...rule.condition, operator: e.target.value as LogicCondition['operator'] },
            })
          }
          style={{ fontSize: 13, marginBottom: 6 }}
        >
          {LOGIC_OPERATORS.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>

        {selectedOperator?.requiresValue && (
          <>
            {sourceField?.type === 'multiple_choice' && sourceField.options ? (
              <select
                className="select"
                value={String(rule.condition.value || '')}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...rule.condition, value: e.target.value },
                  })
                }
                style={{ fontSize: 13 }}
              >
                <option value="">Select value...</option>
                {sourceField.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                value={String(rule.condition.value || '')}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...rule.condition, value: e.target.value },
                  })
                }
                placeholder="Value..."
                style={{ fontSize: 13 }}
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
            background: '#d4edda',
            color: '#155724',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          THEN
        </span>
        <select
          className="select"
          value={rule.action.type}
          onChange={(e) =>
            onUpdate({
              action: { ...rule.action, type: e.target.value as LogicAction['type'] },
            })
          }
          style={{ fontSize: 13, marginBottom: 6 }}
        >
          {ACTION_TYPES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>

        {rule.action.type !== 'end_form' && (
          <select
            className="select"
            value={rule.action.targetQuestionId || ''}
            onChange={(e) =>
              onUpdate({
                action: { ...rule.action, targetQuestionId: e.target.value },
              })
            }
            style={{ fontSize: 13 }}
          >
            <option value="">Select question...</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Delete */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button onClick={onDelete} className="btn btn-ghost btn-sm" style={{ color: '#e74c3c', padding: 4 }}>
          <Trash2 size={13} /> Remove
        </button>
      </div>
    </div>
  );
}
