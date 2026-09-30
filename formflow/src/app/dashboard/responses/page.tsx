'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DBForm } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { FileText, MessageSquare, ArrowRight, Activity, Plus, LayoutTemplate, Sparkles, BarChart3, PieChart, TrendingUp, Filter, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface FormWithStats extends DBForm {
  responseCount: number;
}

export default function GlobalResponsesPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      // Fetch all forms for user
      const { data: formsData } = await supabase
        .from('forms')
        .select('*')
        .eq('owner_id', user!.id)
        .order('updated_at', { ascending: false });

      if (!formsData || formsData.length === 0) {
        setForms([]);
        setLoading(false);
        return;
      }

      const formIds = formsData.map(f => f.id);
      let allForms: FormWithStats[] = formsData.map((f: any) => ({ ...f, responseCount: 0 }));

      // Fetch response counts manually to ensure reliability
      const { data: responsesData } = await supabase
        .from('responses')
        .select('form_id');
      
      if (responsesData) {
        const countMap = responsesData.reduce((acc: any, curr: any) => {
          acc[curr.form_id] = (acc[curr.form_id] || 0) + 1;
          return acc;
        }, {});
        
        allForms = allForms.map(f => ({
          ...f,
          responseCount: countMap[f.id] || 0
        }));
      }

      // Sort by response count descending
      allForms.sort((a, b) => b.responseCount - a.responseCount);
      setForms(allForms);
      setLoading(false);
    }

    load();
  }, [user, supabase]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -35, y: -35 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ paddingBottom: 60 }}
      >
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 180, height: 38, background: 'rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 10 }} />
          <div style={{ width: 340, height: 18, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -25, y: -25 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: 125,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '16px',
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  const totalResponses = forms.reduce((sum, f) => sum + f.responseCount, 0);
  const activeForms = forms.filter(f => f.status === 'published').length;
  const hasData = forms.length > 0 && totalResponses > 0;

  // Render Stats Card with Top-Left to Bottom-Right entrance
  const StatCard = ({ title, value, icon: Icon, index = 0 }: any) => (
    <motion.div
      initial={{ opacity: 0, x: -30, y: -30 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="stat-card"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} />
        </div>
        <span style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>{title}</span>
      </div>
      <span style={{ fontSize: 32, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>{value}</span>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: -35, y: -35 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ paddingBottom: 60 }}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -25, y: -25 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.02em' }}>Responses</h1>
          <p style={{ color: '#94A3B8', fontSize: 16 }}>Track submissions, review responses, and monitor live feedback.</p>
        </div>
        
        {hasData && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', color: '#F8FAFC' }}>
              <Filter size={16} style={{ marginRight: 8 }} /> Filter
            </button>
          </div>
        )}
      </motion.div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
        <StatCard title="Total Responses" value={totalResponses} icon={MessageSquare} index={0} />
        <StatCard title="Completion Rate" value={hasData ? "68%" : "0%"} icon={Activity} index={1} />
        <StatCard title="Active Forms" value={activeForms} icon={FileText} index={2} />
        <StatCard title="Avg. Rating" value={hasData ? "4.8/5" : "N/A"} icon={Users} index={3} />
      </div>

      {!hasData ? (
        // Premium Empty State
        <div style={{ position: 'relative', marginTop: 20, minHeight: 600 }}>
          {/* Overlay Content */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 500,
            zIndex: 10
          }}>
            <motion.div
              initial={{ opacity: 0, x: -40, y: -40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: '#1e293b', // Matches mockup perfectly
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '48px 32px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* Compact Placeholder Charts Cluster */}
                <div style={{ position: 'relative', height: 140, width: '100%', maxWidth: 280, margin: '0 auto 32px' }}>
                  
                  {/* Left Line Chart */}
                  <div style={{
                    position: 'absolute', top: 30, left: -10, width: 100, height: 70,
                    background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 12, padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1
                  }}>
                    <TrendingUp size={12} color="#34D399" style={{ position: 'absolute', top: 8, left: 8 }} />
                    <svg width="100%" height="24" viewBox="0 0 100 30" style={{ marginTop: 12 }}>
                      <path d="M0,30 L20,15 L40,25 L60,10 L80,15 L100,5" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Right Pie Chart */}
                  <div style={{
                    position: 'absolute', top: 30, right: -10, width: 90, height: 90,
                    background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1
                  }}>
                    <div style={{ width: 50, height: 50, borderRadius: '50%', border: '10px solid #8B5CF6' }} />
                  </div>

                  {/* Center Response Table (Layered on top) */}
                  <div style={{
                    position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                    width: 130, height: 110, background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 12, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8,
                    boxShadow: '0 15px 35px rgba(0,0,0,0.6)', zIndex: 3
                  }}>
                    <div style={{ width: '60%', height: 10, background: '#8B5CF6', borderRadius: 3, marginBottom: 4 }} />
                    {[...Array(4)].map((_, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 6 }}>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                      </div>
                    ))}
                  </div>

                </div>
                
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>No Responses Yet</h2>
                <p style={{ fontSize: 14, color: '#94A3B8', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                  Share your form to start collecting valuable insights. As responses roll in, this dashboard will come alive with real-time feedback.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        // Populated state - Forms Grid
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {forms.map((form, i) => (
            <motion.div 
              key={form.id} 
              initial={{ opacity: 0, x: -25, y: -25 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '16px',
                padding: '24px', display: 'flex', flexDirection: 'column', height: '100%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieChart size={22} />
                </div>
                {form.status === 'published' ? (
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(52, 211, 153, 0.1)', color: '#34D399', padding: '4px 10px', borderRadius: 12 }}>Active</span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(148, 163, 184, 0.1)', color: '#94A3B8', padding: '4px 10px', borderRadius: 12 }}>Draft</span>
                )}
              </div>
              
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F8FAFC', marginBottom: 6 }}>{form.title}</h3>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24, flex: 1, lineHeight: 1.5 }}>
                {form.description ? (form.description.length > 60 ? form.description.substring(0, 60) + '...' : form.description) : 'No description provided.'}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: form.responseCount > 0 ? '#818CF8' : '#94A3B8' }}>
                  <BarChart3 size={16} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{form.responseCount} <span style={{ fontWeight: 500, fontSize: 13, color: '#64748B' }}>responses</span></span>
                </div>
                
                <Link 
                  href={`/dashboard/forms/${form.id}/responses`}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 4, 
                    color: '#F8FAFC', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8
                  }}
                >
                  Analyze <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
