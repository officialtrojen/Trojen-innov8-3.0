// ============================================================
// FormFlow — Theme, Background & Poster Presets
// ============================================================

import { FormTheme } from './types';

export interface PosterPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  suggestedTitle: string;
  suggestedSubtitle: string;
}

export const POSTER_PRESETS: PosterPreset[] = [
  {
    id: 'tech-hackathon',
    name: 'Hackathon & Tech',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    suggestedTitle: 'Innov8 Hackathon 2026',
    suggestedSubtitle: 'Build next-generation intelligent applications',
  },
  {
    id: 'ai-summit',
    name: 'AI & Data Summit',
    category: 'Conference',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    suggestedTitle: 'AI Developer Conference',
    suggestedSubtitle: 'Registration & Participant Details',
  },
  {
    id: 'creative-workshop',
    name: 'Design & Workshop',
    category: 'Creative',
    url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    suggestedTitle: 'UI/UX Design Masterclass',
    suggestedSubtitle: 'Reserve your creative seat today',
  },
  {
    id: 'abstract-gradient',
    name: 'Aesthetic Gradient',
    category: 'Modern',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    suggestedTitle: 'Product Feedback Survey',
    suggestedSubtitle: 'Tell us how we can make FormFlow better',
  },
  {
    id: 'event-concert',
    name: 'Event & Fest',
    category: 'Event',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    suggestedTitle: 'Campus Cultural Fest',
    suggestedSubtitle: 'Passes, Team Registration & Entry Passes',
  },
  {
    id: 'nature-zen',
    name: 'Calm & Wellness',
    category: 'Lifestyle',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    suggestedTitle: 'Community Wellness Survey',
    suggestedSubtitle: 'Your health and mindfulness priorities',
  },
];

export interface GradientPreset {
  id: string;
  name: string;
  gradient: string;
  text: string;
  primary: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'emerald-flow',
    name: 'Emerald Flow',
    gradient: 'linear-gradient(135deg, #EAF4F4 0%, #CFE5E3 50%, #B8CECF 100%)',
    text: '#263B3B',
    primary: '#4F7C7A',
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Glow',
    gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 40%, #CFFAFE 100%)',
    text: '#14532D',
    primary: '#16A34A',
  },
  {
    id: 'sunset-amber',
    name: 'Warm Sunset',
    gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FDE047 100%)',
    text: '#7C2D12',
    primary: '#EA580C',
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Cyan',
    gradient: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 50%, #A5F3FC 100%)',
    text: '#164E63',
    primary: '#0891B2',
  },
  {
    id: 'violet-dream',
    name: 'Mystic Violet',
    gradient: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)',
    text: '#4C1D95',
    primary: '#7C3AED',
  },
  {
    id: 'dense-red-parchment',
    name: 'Dense Red & Parchment',
    gradient: 'linear-gradient(135deg, #FAF8F5 0%, #F5F0E6 50%, #EFE8D8 100%)',
    text: '#2D0A0A',
    primary: '#7A1010',
  },
];

export interface PatternPreset {
  id: 'dots' | 'grid' | 'mesh' | 'stripes' | 'none';
  name: string;
  css: string;
}

export const PATTERN_PRESETS: PatternPreset[] = [
  {
    id: 'none',
    name: 'None',
    css: 'none',
  },
  {
    id: 'dots',
    name: 'Modern Dots',
    css: 'radial-gradient(rgba(79, 124, 122, 0.22) 1.5px, transparent 1.5px)',
  },
  {
    id: 'grid',
    name: 'Architect Grid',
    css: 'linear-gradient(to right, rgba(79, 124, 122, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(79, 124, 122, 0.12) 1px, transparent 1px)',
  },
  {
    id: 'stripes',
    name: 'Subtle Diagonal',
    css: 'repeating-linear-gradient(45deg, rgba(79, 124, 122, 0.05), rgba(79, 124, 122, 0.05) 10px, transparent 10px, transparent 20px)',
  },
  {
    id: 'mesh',
    name: 'Soft Glow Mesh',
    css: 'radial-gradient(at 10% 20%, rgba(207, 229, 227, 0.6) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(184, 206, 207, 0.6) 0px, transparent 50%)',
  },
];

/**
 * Computes background styles for any form container or preview
 */
export function getBackgroundStyle(theme: FormTheme): React.CSSProperties {
  const bgType = theme.backgroundType || 'solid';

  if (bgType === 'gradient' && theme.backgroundGradient) {
    return {
      backgroundImage: theme.backgroundGradient,
    };
  }

  if (bgType === 'pattern' && theme.backgroundPattern && theme.backgroundPattern !== 'none') {
    const pattern = PATTERN_PRESETS.find((p) => p.id === theme.backgroundPattern);
    const patternCss = pattern?.css || 'none';
    const bgSize = theme.backgroundPattern === 'dots' ? '20px 20px' : theme.backgroundPattern === 'grid' ? '24px 24px' : undefined;

    return {
      backgroundColor: theme.background || '#EAF4F4',
      backgroundImage: patternCss !== 'none' ? patternCss : undefined,
      backgroundSize: bgSize,
    };
  }

  if (bgType === 'image' && theme.backgroundImage) {
    return {
      backgroundImage: `url(${theme.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    };
  }

  // Default solid color
  return {
    backgroundColor: theme.background || '#EAF4F4',
  };
}
