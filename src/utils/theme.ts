export interface ColorPalette {
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  primaryBorder: string;
  primaryFocus: string;
  lightBg: string;
  badgeBg: string;
  badgeText: string;
  accentText: string;
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  emerald: {
    primaryBg: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    primaryText: 'text-emerald-700',
    primaryBorder: 'border-emerald-500',
    primaryFocus: 'focus:ring-emerald-500',
    lightBg: 'bg-emerald-50',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    accentText: 'text-emerald-500',
  },
  sky: {
    primaryBg: 'bg-sky-600',
    primaryHover: 'hover:bg-sky-700',
    primaryText: 'text-sky-700',
    primaryBorder: 'border-sky-500',
    primaryFocus: 'focus:ring-sky-500',
    lightBg: 'bg-sky-50',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    accentText: 'text-sky-500',
  },
  orange: {
    primaryBg: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    primaryText: 'text-orange-700',
    primaryBorder: 'border-orange-500',
    primaryFocus: 'focus:ring-orange-500',
    lightBg: 'bg-orange-50',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    accentText: 'text-orange-500',
  },
  amber: {
    primaryBg: 'bg-amber-500',
    primaryHover: 'hover:bg-amber-600',
    primaryText: 'text-amber-600',
    primaryBorder: 'border-amber-400',
    primaryFocus: 'focus:ring-amber-500',
    lightBg: 'bg-amber-50/70',
    badgeBg: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    accentText: 'text-amber-500',
  },
  zinc: {
    primaryBg: 'bg-zinc-800',
    primaryHover: 'hover:bg-zinc-900',
    primaryText: 'text-zinc-800',
    primaryBorder: 'border-zinc-800',
    primaryFocus: 'focus:ring-zinc-800',
    lightBg: 'bg-zinc-100',
    badgeBg: 'bg-zinc-200',
    badgeText: 'text-zinc-800',
    accentText: 'text-zinc-600',
  }
};

export interface FontStyles {
  titleFont: string;
  bodyFont: string;
}

export const FONT_STYLES: Record<string, FontStyles> = {
  editorial: {
    titleFont: 'font-serif font-semibold tracking-tight',
    bodyFont: 'font-sans'
  },
  modern: {
    titleFont: 'font-sans font-extrabold tracking-tighter uppercase',
    bodyFont: 'font-sans text-slate-800'
  },
  minimal: {
    titleFont: 'font-sans font-light tracking-wide',
    bodyFont: 'font-sans text-slate-700'
  }
};
