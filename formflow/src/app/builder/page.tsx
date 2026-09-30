'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  FormField,
  FormSchema,
  FIELD_PALETTE,
  LogicRule,
  FormTheme,
  DEFAULT_THEME,
  DEFAULT_SETTINGS,
} from '@/lib/types';
import { generateId, generateSlug, formSchemaToCSV, downloadFile } from '@/lib/utils';
import FieldPalette from '@/components/builder/FieldPalette';
import FormCanvas from '@/components/builder/FormCanvas';
import PropertiesPanel from '@/components/builder/PropertiesPanel';
import LogicPanel from '@/components/builder/LogicPanel';
import ThemePanel from '@/components/builder/ThemePanel';
import FormRenderer from '@/components/form/FormRenderer';
import FormDeleteTrashBin from '@/components/builder/FormDeleteTrashBin';
import FormCrunchAnimationOverlay from '@/components/builder/FormCrunchAnimationOverlay';
import FormCrumpleExperience from '@/components/builder/FormCrumpleExperience';
import AiFormAssistant from '@/components/builder/AiFormAssistant';
import ShareModal from '@/components/builder/ShareModal';
import { getBackgroundStyle, POSTER_PRESETS } from '@/lib/theme-presets';
import { createClient } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Eye,
  Edit3,
  Download,
  Share2,
  Sparkles,
  Save,
  Check,
  Layers,
  Image as ImageIcon,
  Sliders,
  GitBranch,
  Trash2,
} from 'lucide-react';

const INITIAL_DEMO_SCHEMA: FormSchema = {
  title: 'Community Feedback & Event Registration',
  description: 'Customize this form using drag-and-drop fields, custom backgrounds, and header posters.',
  fields: [
    {
      id: 'q_name',
      type: 'short_text',
      label: 'Your Full Name',
      required: true,
      placeholder: 'Jane Doe',
    },
    {
      id: 'q_role',
      type: 'multiple_choice',
      label: 'What best describes your role?',
      required: false,
      options: ['Software Engineer', 'Product Designer', 'Student / Researcher', 'Other'],
      selectionMode: 'single',
    },
    {
      id: 'q_rating',
      type: 'rating',
      label: 'How would you rate your overall experience?',
      required: false,
      maxStars: 5,
    },
    {
      id: 'q_feedback',
      type: 'paragraph',
      label: 'Any suggestions or feedback for the team?',
      required: false,
      placeholder: 'Share your thoughts and ideas...',
    },
  ],
  logic: [],
  theme: {
    ...DEFAULT_THEME,
    posterUrl: POSTER_PRESETS[0].url,
    bannerUrl: POSTER_PRESETS[0].url,
    posterTitle: 'Innov8 Hackathon 2026',
    posterSubtitle: 'Build next-generation intelligent applications',
    posterHeight: 190,
    backgroundType: 'gradient',
    backgroundGradient: 'linear-gradient(135deg, #EAF4F4 0%, #CFE5E3 50%, #B8CECF 100%)',
  },
  settings: DEFAULT_SETTINGS,
};

export default function StandaloneBuilderPage() {
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('formflow_builder_draft');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        // Ignore parse error
      }
    }
    return INITIAL_DEMO_SCHEMA;
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>('q_name');
  const [activePanel, setActivePanel] = useState<'properties' | 'logic' | 'theme'>('theme');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showCrumpleExperience, setShowCrumpleExperience] = useState(false);
  const [isFormArmed, setIsFormArmed] = useState(false);
  const [isDraggingArmedForm, setIsDraggingArmedForm] = useState(false);
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isCrumpling, setIsCrumpling] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [publishedFormInfo, setPublishedFormInfo] = useState<{
    isOpen: boolean;
    formId: string;
    publicSlug: string;
    title: string;
  }>({
    isOpen: false,
    formId: '',
    publicSlug: '',
    title: '',
  });
  const trashBinRef = useRef<HTMLDivElement | null>(null);

  // Global pointer tracking when dragging armed form
  useEffect(() => {
    if (!isDraggingArmedForm) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragPointer({ x: e.clientX, y: e.clientY });

      if (trashBinRef.current) {
        const rect = trashBinRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        setIsOverTrash(dist < 80);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      setIsDraggingArmedForm(false);
      setDragPointer(null);

      if (trashBinRef.current) {
        const rect = trashBinRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        if (dist < 80) {
          setIsCrumpling(true);
          return;
        }
      }
      setIsOverTrash(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingArmedForm]);

  const handleStartDragForm = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingArmedForm(true);
    setDragPointer({ x: e.clientX, y: e.clientY });
  }, []);

  // Reset to brand-new clean form
  const handleNewForm = useCallback(() => {
    const freshSchema: FormSchema = {
      title: 'Untitled Form',
      description: 'Start designing your questions here.',
      fields: [
        {
          id: generateId('q'),
          type: 'short_text',
          label: 'What is your full name?',
          required: true,
          placeholder: 'Type your answer here...',
        },
      ],
      logic: [],
      theme: {
        ...DEFAULT_THEME,
        backgroundType: 'solid',
        background: '#EAF4F4',
        posterUrl: undefined,
        bannerUrl: undefined,
        posterTitle: undefined,
        posterSubtitle: undefined,
      },
      settings: DEFAULT_SETTINGS,
    };
    setSchema(freshSchema);
    setSelectedFieldId(freshSchema.fields[0].id);
    setActivePanel('properties');
    try {
      localStorage.setItem('formflow_builder_draft', JSON.stringify(freshSchema));
    } catch {
      // Ignore quota
    }
  }, []);

  // Load from local storage or check auth
  useEffect(() => {
    try {
      const saved = localStorage.getItem('formflow_builder_draft');
      if (saved) {
        setSchema(JSON.parse(saved));
      }
    } catch {
      // Ignore parse errors
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email });
      }
    });
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('formflow_builder_draft', JSON.stringify(schema));
    } catch {
      // Ignore quota
    }
  }, [schema]);

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

  // --- Logic rules ---
  const addRule = useCallback((rule: LogicRule) => {
    setSchema((prev) => ({ ...prev, logic: [...prev.logic, rule] }));
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

    if (String(active.id).startsWith('palette-')) {
      const type = String(active.id).replace('palette-', '');
      addField(type);
      return;
    }

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

  // --- Export CSV & JSON ---
  const handleExportCsv = () => {
    const csv = formSchemaToCSV(schema);
    const filename = `${schema.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_fields.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schema, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${schema.title.toLowerCase().replace(/\s+/g, '_')}_schema.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportExcel = () => {
    const data = schema.fields.map((f, i) => {
      let extra = f.placeholder || '';
      if (f.options) extra = f.options.join('; ');
      if (f.type === 'rating') extra = `Rating (1 - 5 stars)`;
      return {
        Order: i + 1,
        'Field ID': f.id,
        Type: f.type,
        Label: f.label,
        Required: f.required ? 'Yes' : 'No',
        'Placeholder / Options': extra
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fields");
    XLSX.writeFile(wb, `${schema.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_fields.xlsx`);
  };

  // --- Save / Publish to Account ---
  const handleSaveToAccount = async () => {
    setSaving(true);
    const supabase = createClient();

    if (!user) {
      // Save draft and redirect to signup/login
      localStorage.setItem('formflow_builder_draft', JSON.stringify(schema));
      router.push('/signup?redirect=/builder');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('forms')
        .insert({
          owner_id: user.id,
          title: schema.title,
          description: schema.description || null,
          schema,
          theme: schema.theme,
          status: 'published',
          public_slug: generateSlug(),
        })
        .select('id, public_slug')
        .single();

      if (error) {
        alert('Could not save form: ' + error.message);
      } else if (data) {
        setPublishedFormInfo({
          isOpen: true,
          publicSlug: data.public_slug,
          formId: data.id,
          title: schema.title,
        });
      }
    } catch (err: unknown) {
      alert('Error saving form');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={handleCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Builder Navigation */}
        <header
          style={{
            height: 60,
            background: 'white',
            borderBottom: '1px solid rgba(184,206,207,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 40,
            gap: 12,
          }}
        >
          {/* Brand & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/dashboard');
                }
              }}
              title="Back to previous window"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 700,
                color: '#1E293B',
                background: '#F1F5F9',
                borderRadius: 10,
                border: '1.5px solid #CBD5E1',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#E2E8F0';
                e.currentTarget.style.borderColor = '#94A3B8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
            >
              <ArrowLeft size={16} color="#1E293B" />
              <span>Back</span>
            </button>

            <div style={{ width: 1, height: 24, background: 'rgba(184,206,207,0.5)' }} />

            <input
              value={schema.title}
              onChange={(e) => setSchema((prev) => ({ ...prev, title: e.target.value }))}
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#263B3B',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: 280,
              }}
              placeholder="Form Title"
            />
          </div>

          {/* Mode Switcher: Edit vs Live Preview */}
          <div style={{ display: 'flex', background: 'rgba(207,229,227,0.4)', borderRadius: 10, padding: 3, gap: 2 }}>
            <button
              type="button"
              onClick={() => setMode('edit')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: mode === 'edit' ? 'white' : 'transparent',
                color: mode === 'edit' ? '#263B3B' : '#52796F',
                boxShadow: mode === 'edit' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Edit3 size={14} /> Builder View
            </button>

            <button
              type="button"
              onClick={() => setMode('preview')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: mode === 'preview' ? 'white' : 'transparent',
                color: mode === 'preview' ? '#263B3B' : '#52796F',
                boxShadow: mode === 'preview' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Eye size={14} /> Live Preview
            </button>
          </div>

          {/* Center Tabs: Fields / Logic / Theme & Poster */}
          {mode === 'edit' && (
            <div style={{ display: 'flex', gap: 4, background: 'rgba(207,229,227,0.3)', borderRadius: 8, padding: 3 }} className="hidden-mobile">
              {[
                { id: 'properties', label: 'Questions', icon: Sliders },
                { id: 'theme', label: '🎨 Background & Poster', icon: ImageIcon },
                { id: 'logic', label: 'Logic', icon: GitBranch },
              ].map((tab) => {
                const isSelected = activePanel === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePanel(tab.id as typeof activePanel)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: isSelected ? 'white' : 'transparent',
                      color: isSelected ? 'var(--primary)' : '#52796F',
                      boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* AI Assistant Toggle Button */}
            <button
              type="button"
              onClick={() => setIsAiOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: isAiOpen
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                  : 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                color: '#FFFFFF',
                boxShadow: isAiOpen
                  ? '0 0 16px rgba(139, 92, 246, 0.5)'
                  : '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease',
              }}
            >
              <Sparkles size={14} style={{ color: '#FDE047' }} />
              <span>{isAiOpen ? 'Close AI' : '✨ AI Assistant'}</span>
            </button>

            {/* Export CSV & JSON */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#EAF4F4',
                border: '1.5px solid #B8CECF',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={handleExportCsv}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#263B3B',
                  background: 'transparent',
                  border: 'none',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                title="Download Form Questions & Structure as CSV"
              >
                <Download size={14} /> Export CSV
              </button>
              <div style={{ width: 1, height: 18, background: '#B8CECF' }} />
              <button
                type="button"
                onClick={handleExportExcel}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#263B3B',
                  background: 'transparent',
                  border: 'none',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                title="Download as Excel (.xlsx)"
              >
                <Download size={14} /> Export Excel
              </button>
              <div style={{ width: 1, height: 18, background: '#B8CECF' }} />
              <button
                type="button"
                onClick={handleExportJson}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#365F5D',
                  background: 'transparent',
                  border: 'none',
                  padding: '6px 9px',
                  cursor: 'pointer',
                }}
                title="Download as JSON"
              >
                JSON
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveToAccount}
              className="btn btn-sm"
              disabled={saving}
              style={{
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 8,
                padding: '7px 16px',
                background: '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #0F172A',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.75 : 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = '#0F172A';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(15, 23, 42, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = '#1E293B';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)';
                }
              }}
            >
              {saving ? <span className="spinner" /> : <Save size={14} style={{ color: '#FFFFFF' }} />}
              {user ? 'Save to Dashboard' : 'Save & Publish'}
            </button>
          </div>
        </header>

        {/* Builder Body or Preview Body */}
        {mode === 'preview' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <FormRenderer schema={schema} />
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left: Drag-and-Drop Palette */}
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

            {/* Center: Live Interactive Form Canvas */}
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
                }}
                className="builder-canvas"
              >
                <FormCanvas
                  fields={schema.fields}
                  selectedFieldId={selectedFieldId}
                  onSelectField={(id) => {
                    setSelectedFieldId(id);
                    if (id) setActivePanel('properties');
                  }}
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

            {/* Right: Customization Panels */}
            <div
              style={{
                width: 330,
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
                <div style={{ padding: 32, textAlign: 'center', color: '#52796F', fontSize: 13, marginTop: 40 }}>
                  <p>Click on any form question to inspect and edit its title, options, and validations.</p>
                  <button
                    type="button"
                    onClick={() => setActivePanel('theme')}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 12 }}
                  >
                    Open Background & Poster
                  </button>
                </div>
              )}

              {activePanel === 'theme' && (
                <ThemePanel
                  theme={schema.theme}
                  onUpdate={updateTheme}
                />
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
            </div>
          </div>
        )}
      </div>

      {/* Drag Overlay for smooth dnd feedback */}
      <DragOverlay>
        {activeId && (
          <div
            className="dnd-drag-overlay"
            style={{
              padding: '12px 16px',
              background: 'white',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              fontWeight: 600,
              color: '#263B3B',
              border: '2px solid var(--primary)',
            }}
          >
            {activeId.startsWith('palette-')
              ? FIELD_PALETTE.find((p) => p.type === activeId.replace('palette-', ''))?.label
              : schema.fields.find((f) => f.id === activeId)?.label}
          </div>
        )}
      </DragOverlay>

      {/* Share Modal Dialog upon publishing */}
      <ShareModal
        isOpen={publishedFormInfo.isOpen}
        onClose={() => {
          const formId = publishedFormInfo.formId;
          setPublishedFormInfo((prev) => ({ ...prev, isOpen: false }));
          if (formId) {
            router.push(`/dashboard/forms/${formId}/edit`);
          }
        }}
        formTitle={publishedFormInfo.title}
        publicSlug={publishedFormInfo.publicSlug}
        formId={publishedFormInfo.formId}
      />

      {/* AI Form Assistant Floating Chatbox */}
      <AiFormAssistant
        currentSchema={schema}
        onApplySchema={(newSchema) => {
          setSchema(newSchema);
          if (newSchema.fields.length > 0) {
            setSelectedFieldId(newSchema.fields[0].id);
          }
        }}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onOpen={() => setIsAiOpen(true)}
        onToggle={() => setIsAiOpen((prev) => !prev)}
      />

      <style>{`
        @media (max-width: 900px) {
          .builder-left-panel { width: 170px !important; }
          .builder-right-panel { width: 280px !important; }
        }
        @media (max-width: 768px) {
          .builder-left-panel { display: none !important; }
          .builder-right-panel { display: none !important; }
        }
      `}</style>
    </DndContext>
  );
}
