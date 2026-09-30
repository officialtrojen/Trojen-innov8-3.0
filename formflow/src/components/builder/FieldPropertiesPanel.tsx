'use client';

import React from 'react';
import { FormField } from '@/types/form';
import { Plus, Trash2, X, Sliders, CheckCircle2, Type, Check } from 'lucide-react';
import { FIELD_FONT_OPTIONS } from '@/lib/font-presets';

interface FieldPropertiesPanelProps {
  field: FormField | null;
  onUpdateField: (updated: FormField) => void;
  onDeleteField: (id: string) => void;
  onClose: () => void;
}

export const FieldPropertiesPanel: React.FC<FieldPropertiesPanelProps> = ({
  field,
  onUpdateField,
  onDeleteField,
  onClose,
}) => {
  if (!field) {
    return (
      <aside className="w-80 flex-shrink-0 bg-zinc-900/90 border-l border-zinc-800 p-5 h-full flex flex-col items-center justify-center text-center text-zinc-500">
        <Sliders className="w-8 h-8 mb-2 text-zinc-600" />
        <div className="text-xs font-medium text-zinc-400">No field selected</div>
        <div className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
          Click on any question card in the canvas to edit its properties & validation
        </div>
      </aside>
    );
  }

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = val;
    onUpdateField({ ...field, options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    onUpdateField({ ...field, options: newOptions });
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = (field.options || []).filter((_, i) => i !== index);
    onUpdateField({ ...field, options: newOptions });
  };

  return (
    <aside className="w-80 flex-shrink-0 bg-zinc-900/90 border-l border-zinc-800 p-4 h-full overflow-y-auto text-zinc-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Field Properties
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {field.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {/* Label */}
        <div>
          <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
            Question Title / Label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdateField({ ...field, label: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Description / Subtitle */}
        <div>
          <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
            Help Text / Description
          </label>
          <input
            type="text"
            value={field.description || ''}
            onChange={(e) => onUpdateField({ ...field, description: e.target.value })}
            placeholder="Optional context for respondent..."
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Typography / 10 Font Options */}
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Field Typography (Font)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
              10 Fonts
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div>
              <div className="text-[10px] text-zinc-500 font-medium">Active Font</div>
              <div
                className="text-xs font-semibold text-zinc-200"
                style={{ fontFamily: field.fontFamily || 'inherit' }}
              >
                {field.fontFamily || 'Theme Default'}
              </div>
            </div>
            {field.fontFamily && (
              <button
                type="button"
                onClick={() => onUpdateField({ ...field, fontFamily: undefined })}
                className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
            {FIELD_FONT_OPTIONS.map((f) => {
              const isSelected = field.fontFamily === f.name;
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => onUpdateField({ ...field, fontFamily: f.name })}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-white'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold"
                        style={{ fontFamily: f.name }}
                      >
                        {f.label}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {f.category}
                      </span>
                    </div>
                    <div
                      className="text-[10px] text-zinc-400 truncate mt-0.5"
                      style={{ fontFamily: f.name }}
                    >
                      {f.sample}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Placeholder (for text fields) */}
        {(field.type === 'short_text' || field.type === 'paragraph') && (
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
              Input Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onUpdateField({ ...field, placeholder: e.target.value })}
              placeholder="e.g. Type your answer..."
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Required Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
          <div>
            <div className="text-xs font-medium text-zinc-200">Required Field</div>
            <div className="text-[10px] text-zinc-500">Respondents must answer before proceeding</div>
          </div>
          <button
            type="button"
            onClick={() => onUpdateField({ ...field, required: !field.required })}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              field.required ? 'bg-indigo-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                field.required ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Multiple Choice Options Configuration */}
        {field.type === 'multiple_choice' && (
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-zinc-400">Answer Options</span>
              <span className="text-[10px] text-zinc-500">
                {(field.options || []).length} choices
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {(field.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {(field.options || []).length > 1 && (
                    <button
                      onClick={() => handleDeleteOption(idx)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAddOption}
              className="w-full mt-2 py-1.5 px-3 rounded-lg border border-dashed border-zinc-700 hover:border-indigo-500/60 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Option
            </button>
          </div>
        )}

        {/* Rating Stars Configuration */}
        {field.type === 'rating' && (
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-300 block">
              ⭐ Standard 5-Star Rating
            </span>
            <p className="text-[11px] text-zinc-400">
              Users tap directly on the 5 stars to submit their rating.
            </p>
          </div>
        )}

        {/* Validation Rules */}
        {(field.type === 'short_text' || field.type === 'paragraph') && (
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">
              Length Validation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Min Length</label>
                <input
                  type="number"
                  min="0"
                  value={field.validation?.minLength ?? ''}
                  onChange={(e) =>
                    onUpdateField({
                      ...field,
                      validation: {
                        ...field.validation,
                        minLength: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Max Length</label>
                <input
                  type="number"
                  min="1"
                  value={field.validation?.maxLength ?? ''}
                  onChange={(e) =>
                    onUpdateField({
                      ...field,
                      validation: {
                        ...field.validation,
                        maxLength: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Field Button */}
      <div className="pt-4 mt-auto border-t border-zinc-800">
        <button
          onClick={() => onDeleteField(field.id)}
          className="w-full py-2 px-3 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Question
        </button>
      </div>
    </aside>
  );
};
