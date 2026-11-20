// ألوان المجالات الثلاثة على الخلفية الكريمية

export interface Accent {
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  dot: string;
}

export const ACCENTS: Record<string, Accent> = {
  forest: {
    text: 'text-forest',
    bg: 'bg-forest',
    bgSoft: 'bg-sage-soft',
    border: 'border-sage',
    dot: 'bg-forest',
  },
  gold: {
    text: 'text-gold',
    bg: 'bg-[#2f5d47]',
    bgSoft: 'bg-gold-soft',
    border: 'border-gold-soft',
    dot: 'bg-[#2f5d47]',
  },
  clay: {
    text: 'text-secondary',
    bg: 'bg-secondary',
    bgSoft: 'bg-secondary-soft',
    border: 'border-secondary-soft',
    dot: 'bg-secondary',
  },
};
