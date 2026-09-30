'use client';

import React, { useState } from 'react';
import { FormField, LogicRule, LogicOperator, LogicActionType } from '@/types/form';
import { Plus, Trash2, GitBranch, ArrowRight, CornerDownRight, Check, AlertCircle } from 'lucide-react';

interface LogicRuleBuilderProps {
  fields: FormField[];
  logicRules: LogicRule[];
  onUpdateRules: (rules: LogicRule[]) => void;
}

export const LogicRuleBuilder: React.FC<LogicRuleBuilderProps> = ({
  fields,
  logicRules,
  onUpdateRules,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [sourceFieldId, setSourceFieldId] = useState(fields[0]?.id || '');
  const [operator, setOperator] = useState<LogicOperator>('equals');
  const [value, setValue] = useState('');
  const [actionType, setActionType] = useState<LogicActionType>('jump_to');
  const [targetFieldId, setTargetFieldId] = useState(fields[1]?.id || '');
  const [hasElse, setHasElse] = useState(false);
  const [elseActionType, setElseActionType] = useState<LogicActionType>('show');
  const [elseTargetFieldId, setElseTargetFieldId] = useState(fields[2]?.id || '');

  const sourceField = fields.find((f) => f.id === sourceFieldId);

  const handleAddRule = () => {
    if (!sourceFieldId || !targetFieldId) return;

    const newRule: LogicRule = {
      id: `rule_${Date.now()}`,
      title: `Rule for ${sourceField?.label.slice(0, 24) || 'Question'}`,
      sourceFieldId,
      condition: {
        fieldId: sourceFieldId,
        operator,
        value: operator === 'is_empty' || operator === 'is_not_empty' ? undefined : value,
      },
      action: {
        type: actionType,
        targetFieldId,
      },
      elseAction: hasElse
        ? {
            type: elseActionType,
            targetFieldId: elseTargetFieldId,
          }
        : undefined,
    };

    onUpdateRules([...logicRules, newRule]);
    setIsAdding(false);
    setValue('');
  };

  const handleDeleteRule = (id: string) => {
    onUpdateRules(logicRules.filter((r) => r.id !== id));
  };

  const getFieldLabel = (id: string) => {
    const f = fields.find((item) => item.id === id);
    if (!f) return 'Unknown Question';
    const index = fields.findIndex((item) => item.id === id);
    return `Q${index + 1}: ${f.label.slice(0, 32)}${f.label.length > 32 ? '...' : ''}`;
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 max-w-5xl mx-auto text-zinc-100">
      {/* Title & Introduction */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Conditional Logic & Jump Engine</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Create dynamic branches. Automatically show, hide, or jump past questions based on respondent answers.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'Add Logic Rule'}
        </button>
      </div>

      {/* Visual Logic Flow Representation */}
      <div className="mb-8 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            Visual Logic Flow Map
          </span>
          <span className="text-[11px] text-zinc-500">
            {logicRules.length} active branching {logicRules.length === 1 ? 'rule' : 'rules'}
          </span>
        </div>

        {logicRules.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500">
            No conditional logic rules configured yet. The form follows linear flow (Q1 → Q2 → Q3...).
          </div>
        ) : (
          <div className="space-y-3">
            {logicRules.map((rule, idx) => {
              const srcF = fields.find((f) => f.id === rule.sourceFieldId);
              const tgtF = fields.find((f) => f.id === rule.action.targetFieldId);
              const elseF = rule.elseAction ? fields.find((f) => f.id === rule.elseAction.targetFieldId) : null;

              return (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-2 flex-1">
                    {/* Primary condition */}
                    <div className="flex flex-wrap items-center gap-2 text-zinc-300">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                        IF
                      </span>
                      <span className="text-white font-medium">{srcF ? srcF.label : rule.sourceFieldId}</span>
                      <span className="text-amber-400 font-semibold">{rule.condition.operator.replace('_', ' ')}</span>
                      {rule.condition.value && (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                          &quot;{rule.condition.value}&quot;
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase text-[10px]">
                        THEN {rule.action.type.replace('_', ' ')}
                      </span>
                      <span className="text-emerald-200 font-medium">{tgtF ? tgtF.label : rule.action.targetFieldId}</span>
                    </div>

                    {/* Else condition if present */}
                    {rule.elseAction && (
                      <div className="flex flex-wrap items-center gap-2 text-zinc-400 pl-4 border-l-2 border-zinc-800">
                        <CornerDownRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-bold">
                          ELSE
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase text-[10px]">
                          {rule.elseAction.type.replace('_', ' ')}
                        </span>
                        <span className="text-amber-200 font-medium">
                          {elseF ? elseF.label : rule.elseAction.targetFieldId}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors self-end md:self-center"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Rule Form */}
      {isAdding && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-indigo-500/40 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Configure New Logic Condition
            </h3>
            <span className="text-xs text-zinc-500">FR-2 Conditional Logic Jump Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* When question */}
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                When respondent answers:
              </label>
              <select
                value={sourceFieldId}
                onChange={(e) => {
                  setSourceFieldId(e.target.value);
                  setValue('');
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {fields.map((f, i) => (
                  <option key={f.id} value={f.id}>
                    Q{i + 1}: {f.label.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator */}
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                Condition Operator:
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as LogicOperator)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="equals">is equal to</option>
                <option value="not_equals">is not equal to</option>
                <option value="contains">contains text</option>
                <option value="is_empty">is empty (skipped)</option>
                <option value="is_not_empty">is filled (not empty)</option>
              </select>
            </div>

            {/* Target Value */}
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                Value to compare:
              </label>
              {sourceField?.type === 'multiple_choice' && (sourceField.options || []).length > 0 ? (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select option...</option>
                  {(sourceField.options || []).map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. Yes, Solo, or specific keyword"
                  disabled={operator === 'is_empty' || operator === 'is_not_empty'}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
                />
              )}
            </div>
          </div>

          {/* Action to perform */}
          <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-emerald-400 block mb-1.5">
                THEN Action:
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as LogicActionType)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="jump_to">Jump directly to question</option>
                <option value="show">Show specific question</option>
                <option value="hide">Hide specific question</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                Target Question:
              </label>
              <select
                value={targetFieldId}
                onChange={(e) => setTargetFieldId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {fields.map((f, i) => (
                  <option key={f.id} value={f.id}>
                    Q{i + 1}: {f.label.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Else Action */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="else_check"
                checked={hasElse}
                onChange={(e) => setHasElse(e.target.checked)}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500 bg-zinc-950"
              />
              <label htmlFor="else_check" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Add ELSE action (if condition is not met)
              </label>
            </div>

            {hasElse && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div>
                  <label className="text-[11px] font-medium text-amber-400 block mb-1.5">
                    ELSE Action:
                  </label>
                  <select
                    value={elseActionType}
                    onChange={(e) => setElseActionType(e.target.value as LogicActionType)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="show">Show question</option>
                    <option value="hide">Hide question</option>
                    <option value="jump_to">Jump to question</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                    ELSE Target Question:
                  </label>
                  <select
                    value={elseTargetFieldId}
                    onChange={(e) => setElseTargetFieldId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {fields.map((f, i) => (
                      <option key={f.id} value={f.id}>
                        Q{i + 1}: {f.label.slice(0, 30)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRule}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Logic Rule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
