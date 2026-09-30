export interface FontOption {
  name: string;
  label: string;
  category: 'Sans-Serif' | 'Serif' | 'Display';
  description: string;
  sample: string;
  cssFamily: string;
}

export const FIELD_FONT_OPTIONS: FontOption[] = [
  {
    name: 'Inter',
    label: 'Inter',
    category: 'Sans-Serif',
    description: 'Clean, neutral, and ultra-readable modern sans',
    sample: 'Ag Bold & Clear',
    cssFamily: "'Inter', sans-serif",
  },
  {
    name: 'Roboto',
    label: 'Roboto',
    category: 'Sans-Serif',
    description: 'Geometric & friendly neo-grotesque standard',
    sample: 'Ag Balanced Form',
    cssFamily: "'Roboto', sans-serif",
  },
  {
    name: 'Poppins',
    label: 'Poppins',
    category: 'Sans-Serif',
    description: 'Geometric rounded curves for approachable surveys',
    sample: 'Ag Rounded & Warm',
    cssFamily: "'Poppins', sans-serif",
  },
  {
    name: 'Playfair Display',
    label: 'Playfair Display',
    category: 'Serif',
    description: 'High-contrast luxury editorial aesthetic',
    sample: 'Ag Elegant Serif',
    cssFamily: "'Playfair Display', serif",
  },
  {
    name: 'Merriweather',
    label: 'Merriweather',
    category: 'Serif',
    description: 'Sturdy classic serif designed for effortless reading',
    sample: 'Ag Literary Style',
    cssFamily: "'Merriweather', serif",
  },
  {
    name: 'Plus Jakarta Sans',
    label: 'Plus Jakarta Sans',
    category: 'Sans-Serif',
    description: 'Crisp contemporary typeface built for tech products',
    sample: 'Ag Premium Tech',
    cssFamily: "'Plus Jakarta Sans', sans-serif",
  },
  {
    name: 'Outfit',
    label: 'Outfit',
    category: 'Sans-Serif',
    description: 'Minimalist brand-forward display sans',
    sample: 'Ag Distinct Shape',
    cssFamily: "'Outfit', sans-serif",
  },
  {
    name: 'Space Grotesk',
    label: 'Space Grotesk',
    category: 'Display',
    description: 'Futuristic monospace-infused proportional sans',
    sample: 'Ag Neo-Brutalist',
    cssFamily: "'Space Grotesk', sans-serif",
  },
  {
    name: 'Lora',
    label: 'Lora',
    category: 'Serif',
    description: 'Contemporary calligraphic serif with organic curves',
    sample: 'Ag Graceful Tone',
    cssFamily: "'Lora', serif",
  },
  {
    name: 'Montserrat',
    label: 'Montserrat',
    category: 'Sans-Serif',
    description: 'Urban modernist geometric architecture',
    sample: 'Ag Modern Polish',
    cssFamily: "'Montserrat', sans-serif",
  },
];
