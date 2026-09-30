'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { DBForm } from '@/lib/types';
import { 
  FileText, Plus, Search, MoreVertical, Edit2, Play, Activity, Settings, LayoutTemplate
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyFormsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [forms, setForms] = useState<DBForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForms() {
      let ownerId = user?.id;
      if (!ownerId) {
        const { data: authData } = await supabase.auth.getUser();
        ownerId = authData?.user?.id;
      }
      if (!ownerId && typeof window !== 'undefined') {
        ownerId = localStorage.getItem('formflow_guest_id') || undefined;
      }

      if (!ownerId) {
        setForms([]);
        setLoading(false);
        return;
      }

      // If user logged in and has guest forms, migrate them
      if (user?.id && typeof window !== 'undefined') {
        const guestId = localStorage.getItem('formflow_guest_id');
        if (guestId && guestId !== user.id) {
          await supabase.from('forms').update({ owner_id: user.id }).eq('owner_id', guestId);
          localStorage.removeItem('formflow_guest_id');
        }
      }

      const { data } = await supabase
        .from('forms')
        .select('*')
        .eq('owner_id', ownerId)
        .order('updated_at', { ascending: false });
        
      if (data) {
        setForms(data as DBForm[]);
      }
      setLoading(false);
    }
    loadForms();

    // Subscribe to realtime changes on forms table for live sync
    const channel = supabase
      .channel('my-forms-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forms' },
        () => {
          loadForms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const hasData = forms.length > 0;

  return (
    <div style={{ paddingBottom: 60, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.02em' }}>My Forms</h1>
          <p style={{ color: '#94A3B8', fontSize: 16 }}>Manage, edit, and organize all your forms in one place.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/builder" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 8 }}>
            <Plus size={16} /> Create Form
          </Link>
        </div>
      </motion.div>

      {!hasData ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{
              padding: '48px 32px',
              width: '90%',
              maxWidth: 500,
              textAlign: 'center',
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <FileText size={32} color="#94A3B8" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>No Forms Yet</h2>
            <p style={{ fontSize: 14, color: '#94A3B8', maxWidth: 360, margin: '0 auto 32px', lineHeight: 1.6 }}>
              You haven&apos;t created any forms. Click the button below to start building your first one.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link href="/builder" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 8 }}>
                <Plus size={16} /> Create Form
              </Link>
              <Link href="/builder" className="btn btn-secondary" style={{ padding: '10px 24px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <LayoutTemplate size={16} /> Studio Templates
              </Link>
            </div>
          </motion.div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {forms.map((form, i) => (
            <motion.div 
              key={form.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              style={{
                background: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px',
                padding: '24px', display: 'flex', flexDirection: 'column', height: '100%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={22} />
                </div>
                {form.status === 'published' ? (
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(52, 211, 153, 0.1)', color: '#34D399', padding: '4px 10px', borderRadius: 12 }}>Active</span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255, 255, 255, 0.05)', color: '#94A3B8', padding: '4px 10px', borderRadius: 12 }}>Draft</span>
                )}
              </div>
              
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F8FAFC', marginBottom: 6 }}>{form.title}</h3>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24, flex: 1, lineHeight: 1.5 }}>
                {form.description ? (form.description.length > 60 ? form.description.substring(0, 60) + '...' : form.description) : 'No description provided.'}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                <Link href={`/dashboard/forms/${form.id}/edit`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: 'none', padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                </Link>
                <div style={{ width: 8 }} />
                <Link href={`/dashboard/forms/${form.id}/responses`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{ width: '100%', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', border: 'none', padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                    <Activity size={14} /> Results
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
