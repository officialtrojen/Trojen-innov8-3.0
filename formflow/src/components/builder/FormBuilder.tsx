'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FormField, FormSchema, FIELD_PALETTE, LogicRule, FormTheme, DEFAULT_THEME, DEFAULT_SETTINGS } from '@/lib/types';
import { generateId } from '@/lib/utils';
import FieldPalette from '@/components/builder/FieldPalette';
import FormCanvas from '@/components/builder/FormCanvas';
import PropertiesPanel from '@/components/builder/PropertiesPanel';
import LogicPanel from '@/components/builder/LogicPanel';
import ThemePanel from '@/components/builder/ThemePanel';
import BuilderToolbar from '@/components/builder/BuilderToolbar';
import { getBackgroundStyle } from '@/lib/theme-presets';

interface FormBuilderProps {
  initialSchema: FormSchema;
  formId: string;
  formStatus: string;
  publicSlug: string;
  onSave: (schema: FormSchema) => Promise<void>;
  onPublish: () => Promise<void>;
}

export default function FormBuilder({
  initialSchema,
  formId,
  formStatus,
  publicSlug,
  onSave,
  onPublish,
}: FormBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'properties' | 'logic' | 'theme'>('properties');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedField = schema.fields.find((f) => f.id === selectedFieldId) || null;

  // --- Field operations ---
  const addField = useCallback((type: string) => {
    const palette = FIELD_PALETTE.find((p) => p.type === type);
    if (!palette) return;

    const newField: FormField = {
      ...palette.defaultField,
      id: generateId('q'),
      type: palette.type,
      label: palette.defaultField.label || 'Untitled Question',
      required: false,
    } as FormField;

    setSchema((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedFieldId(newField.id);
    setActivePanel('properties');
  }, []);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    }));
  }, []);

  const deleteField = useCallback((fieldId: string) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
      logic: prev.logic.filter(
        (r) => r.condition.questionId !== fieldId && r.action.targetQuestionId !== fieldId
      ),
    }));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  }, [selectedFieldId]);

  const duplicateField = useCallback((fieldId: string) => {
    setSchema((prev) => {
      const field = prev.fields.find((f) => f.id === fieldId);
      if (!field) return prev;
      const newField = { ...field, id: generateId('q'), label: `${field.label} (Copy)` };
      const idx = prev.fields.findIndex((f) => f.id === fieldId);
      const fields = [...prev.fields];
      fields.splice(idx + 1, 0, newField);
      return { ...prev, fields };
    });
  }, []);

  const moveField = useCallback((fieldId: string, direction: 'up' | 'down') => {
    setSchema((prev) => {
      const index = prev.fields.findIndex((f) => f.id === fieldId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.fields.length) return prev;
      return {
        ...prev,
        fields: arrayMove(prev.fields, index, targetIndex),
      };
    });
  }, []);

  // --- Logic operations ---
  const addRule = useCallback((rule: LogicRule) => {
    setSchema((prev) => ({
      ...prev,
      logic: [...prev.logic, rule],
    }));
  }, []);

  const updateRule = useCallback((ruleId: string, updates: Partial<LogicRule>) => {
    setSchema((prev) => ({
      ...prev,
      logic: prev.logic.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
    }));
  }, []);

  const deleteRule = useCallback((ruleId: string) => {
    setSchema((prev) => ({
      ...prev,
      logic: prev.logic.filter((r) => r.id !== ruleId),
    }));
  }, []);

  // --- Theme ---
  const updateTheme = useCallback((updates: Partial<FormTheme>) => {
    setSchema((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...updates },
    }));
  }, []);

  // --- DnD handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Could add drop-zone highlighting here
  };

  // Custom collision detection prioritize card-level targets for sorting
  const handleCollisionDetection = useCallback((args: any) => {
    const pointerCollisions = pointerWithin(args);
    const cardCollisions = pointerCollisions.filter((c) => c.id !== 'canvas-drop-zone');
    if (cardCollisions.length > 0) {
      return cardCollisions;
    }
    const centerCollisions = closestCenter(args);
    const cardCenterCollisions = centerCollisions.filter((c) => c.id !== 'canvas-drop-zone');
    if (cardCenterCollisions.length > 0) {
      return cardCenterCollisions;
    }
    return closestCenter(args);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Dragging from palette to canvas
    if (String(active.id).startsWith('palette-')) {
      const type = String(active.id).replace('palette-', '');
      addField(type);
      return;
    }

    // Reordering within canvas
    if (active.id !== over.id) {
      setSchema((prev) => {
        const oldIndex = prev.fields.findIndex((f) => f.id === active.id);
        let newIndex = prev.fields.findIndex((f) => f.id === over.id);

        if (oldIndex === -1) return prev;

        if (newIndex === -1 && over.id === 'canvas-drop-zone') {
          newIndex = prev.fields.length - 1;
        }

        if (newIndex === -1 || oldIndex === newIndex) return prev;
        return { ...prev, fields: arrayMove(prev.fields, oldIndex, newIndex) };
      });
    }
  };

  // --- Save ---
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(schema);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={handleCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        <BuilderToolbar
          title={schema.title}
          onTitleChange={(title) => setSchema((prev) => ({ ...prev, title }))}
          onSave={handleSave}
          onPublish={onPublish}
          saving={saving}
          formStatus={formStatus}
          publicSlug={publicSlug}
          formId={formId}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Field Palette */}
          <div
            style={{
              width: 220,
              borderRight: '1px solid #B8CECF',
              background: '#FFFEF9',
              overflowY: 'auto',
              padding: 16,
              flexShrink: 0,
            }}
            className="builder-left-panel"
          >
            <FieldPalette onAddField={addField} />
          </div>

          {/* Center: Canvas with live customized background */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              ...getBackgroundStyle(schema.theme),
            }}
            className="builder-canvas-wrapper"
          >
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '36px 32px',
                transition: 'background 0.3s ease',
              }}
              className="builder-canvas"
            >
              <FormCanvas
                fields={schema.fields}
                selectedFieldId={selectedFieldId}
                onSelectField={setSelectedFieldId}
                onDeleteField={deleteField}
                onDuplicateField={duplicateField}
                onMoveField={moveField}
                theme={schema.theme}
                title={schema.title}
                description={schema.description}
                onOpenThemePanel={() => setActivePanel('theme')}
              />
            </div>
          </div>

          {/* Right: Properties / Logic / Theme */}
          <div
            style={{
              width: 320,
              borderLeft: '1px solid #B8CECF',
              background: '#FFFEF9',
              overflowY: 'auto',
              flexShrink: 0,
            }}
            className="builder-right-panel"
          >
            {activePanel === 'properties' && selectedField && (
              <PropertiesPanel
                field={selectedField}
                onUpdate={(updates) => updateField(selectedField.id, updates)}
              />
            )}
            {activePanel === 'properties' && !selectedField && (
              <div style={{ padding: 24, textAlign: 'center', color: '#52796F', fontSize: 14, marginTop: 60 }}>
                Select a field to edit its properties
              </div>
            )}
            {activePanel === 'logic' && (
              <LogicPanel
                rules={schema.logic}
                fields={schema.fields}
                onAddRule={addRule}
                onUpdateRule={updateRule}
                onDeleteRule={deleteRule}
              />
            )}
            {activePanel === 'theme' && (
              <ThemePanel
                theme={schema.theme}
                onUpdate={updateTheme}
              />
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeId && (
          <div className="dnd-drag-overlay" style={{ padding: '12px 16px', background: 'var(--card-bg)' }}>
            {activeId.startsWith('palette-')
              ? FIELD_PALETTE.find((p) => p.type === activeId.replace('palette-', ''))?.label
              : schema.fields.find((f) => f.id === activeId)?.label}
          </div>
        )}
      </DragOverlay>

      <style>{`
        @media (max-width: 1024px) {
          .builder-left-panel { width: 180px !important; }
          .builder-right-panel { width: 280px !important; }
        }
        @media (max-width: 768px) {
          .builder-left-panel { display: none !important; }
          .builder-right-panel { display: none !important; }
          .builder-canvas { padding: 16px !important; }
        }
      `}</style>
    </DndContext>
  );
}
