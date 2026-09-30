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

export interface BackgroundImagePreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const BACKGROUND_IMAGE_PRESETS: BackgroundImagePreset[] = [
  {
    id: 'minimal-architecture',
    name: 'Modern Studio',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'nordic-nature',
    name: 'Misty Mountains',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'studio-paper',
    name: 'Warm Paper Texture',
    category: 'Texture',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'abstract-flow',
    name: 'Liquid Gradient',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'dark-obsidian',
    name: 'Dark Obsidian Geometry',
    category: 'Dark',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'ocean-calm',
    name: 'Calm Ocean Coast',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
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
    id: 'midnight-slate',
    name: 'Dark Obsidian',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
    text: '#F8FAFC',
    primary: '#38BDF8',
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

    if (theme.backgroundImage) {
      const overlay = (theme.backgroundOverlay ?? 0) / 100;
      const overlayGradient = overlay > 0 ? `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay})), ` : '';
      return {
        backgroundColor: theme.background || '#EAF4F4',
        backgroundImage: `${patternCss !== 'none' ? patternCss + ', ' : ''}${overlayGradient}url(${theme.backgroundImage})`,
        backgroundSize: `${bgSize ? bgSize + ', ' : ''}cover`,
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }

    return {
      backgroundColor: theme.background || '#EAF4F4',
      backgroundImage: patternCss !== 'none' ? patternCss : undefined,
      backgroundSize: bgSize,
    };
  }

  if (bgType === 'image' && theme.backgroundImage) {
    const overlay = (theme.backgroundOverlay ?? 0) / 100;
    const overlayGradient = overlay > 0 ? `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay})), ` : '';

    return {
      backgroundImage: `${overlayGradient}url(${theme.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
    };
  }

  // Default solid color
  return {
    backgroundColor: theme.background || '#EAF4F4',
  };
}

export interface PageColorPreset {
  id: string;
  name: string;
  category: 'Clean & Paper' | 'Warm & Soft' | 'Modern Dark' | 'Pastel Tint';
  color: string;
  textColor?: string;
  description: string;
}

export const PAGE_COLOR_PRESETS: PageColorPreset[] = [
  {
    id: 'pure-white',
    name: 'Clean White',
    category: 'Clean & Paper',
    color: '#FFFFFF',
    textColor: '#263B3B',
    description: 'Crisp, bright, classic card sheet',
  },
  {
    id: 'soft-cream',
    name: 'Soft Cream',
    category: 'Warm & Soft',
    color: '#FCFBF7',
    textColor: '#2A2E33',
    description: 'Warm natural paper aesthetic (#FCFBF7)',
  },
  {
    id: 'light-pebble',
    name: 'Light Pebble',
    category: 'Warm & Soft',
    color: '#F2EFE9',
    textColor: '#2A2E33',
    description: 'Subtle tactile stone matte (#F2EFE9)',
  },
  {
    id: 'warm-amber',
    name: 'Warm Amber',
    category: 'Warm & Soft',
    color: '#FFFBEB',
    textColor: '#78350F',
    description: 'Cozy parchment glow',
  },
  {
    id: 'ice-mint',
    name: 'Ice Mint',
    category: 'Pastel Tint',
    color: '#F0FDF4',
    textColor: '#14532D',
    description: 'Fresh organic green sheen',
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    category: 'Pastel Tint',
    color: '#F5F3FF',
    textColor: '#312E81',
    description: 'Subtle violet modern tone',
  },
  {
    id: 'blush-rose',
    name: 'Pale Rose',
    category: 'Pastel Tint',
    color: '#FFF1F2',
    textColor: '#881337',
    description: 'Delicate pastel blush',
  },
  {
    id: 'slate-gray',
    name: 'Slate Gray',
    category: 'Modern Dark',
    color: '#2A2E33',
    textColor: '#F8FAFC',
    description: 'Sophisticated modern graphite (#2A2E33)',
  },
  {
    id: 'dark-obsidian',
    name: 'Dark Obsidian',
    category: 'Modern Dark',
    color: '#0F172A',
    textColor: '#F8FAFC',
    description: 'Midnight ultra dark surface',
  },
  {
    id: 'deep-navy',
    name: 'Deep Navy',
    category: 'Modern Dark',
    color: '#1E293B',
    textColor: '#F1F5F9',
    description: 'Refined deep navy card',
  },
];

/**
 * Checks whether a hex color is dark
 */
export function isDarkColor(hexColor?: string): boolean {
  if (!hexColor || !hexColor.startsWith('#')) return false;
  const hex = hexColor.replace('#', '');
  if (hex.length < 3) return false;
  let r = 255, g = 255, b = 255;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length >= 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 135;
}

/**
 * Converts a hex color and optional opacity into an rgba string or hex
 */
export function getCardBackground(theme?: FormTheme): string {
  const bg = theme?.cardBackground || '#FFFFFF';
  const opacity = theme?.cardOpacity ?? 100;
  if (opacity >= 100) return bg;

  if (bg.startsWith('#')) {
    const hex = bg.replace('#', '');
    let r = 255, g = 255, b = 255;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0.1, opacity / 100)})`;
  }
  return bg;
}

/**
 * Returns full CSS properties for the form page card surface
 */
export function getCardStyle(theme?: FormTheme): React.CSSProperties {
  const bg = theme?.cardBackground || '#FFFFFF';
  const opacity = theme?.cardOpacity ?? 100;
  const radius = theme?.cardBorderRadius ?? 20;
  const shadowType = theme?.cardShadow ?? 'elevated';
  const isDark = isDarkColor(bg);

  const shadowMap: Record<string, string> = {
    none: 'none',
    subtle: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(38, 59, 59, 0.06)',
    elevated: isDark
      ? '0 24px 64px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.3)'
      : '0 24px 64px rgba(38, 59, 59, 0.14), 0 8px 24px rgba(38, 59, 59, 0.07), 0 1px 3px rgba(38, 59, 59, 0.05)',
    glow: isDark
      ? '0 0 40px rgba(79, 124, 122, 0.35), 0 4px 20px rgba(0, 0, 0, 0.5)'
      : '0 12px 40px rgba(79, 124, 122, 0.2), 0 4px 12px rgba(0,0,0,0.06)',
  };

  return {
    backgroundColor: getCardBackground(theme),
    backdropFilter: opacity < 100 ? 'blur(16px)' : undefined,
    WebkitBackdropFilter: opacity < 100 ? 'blur(16px)' : undefined,
    borderRadius: radius,
    boxShadow: shadowMap[shadowType] || shadowMap.elevated,
    border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(184, 206, 207, 0.5)',
  };
}

