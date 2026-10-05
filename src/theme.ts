// Display modes from GDD section 9. Switching modes changes presentation only.
export type DisplayMode = 'dark' | 'light' | 'colorblind';

export interface Palette {
  bg: string;
  panel: string;
  text: string;
  muted: string;
  accent: string;   // rank / XP indicators
  known: string;    // known object, catalog matched
  pass: string;     // flag accepted
  pending: string;  // awaiting consensus
  info: string;     // neutral metadata
  reject: string;   // flag rejected
  candidate: string;// professional follow-up candidate
  border: string;
}

// Okabe-Ito values come straight from GDD 9.2.
const okabeIto = {
  orange: '#E69F00',
  skyBlue: '#56B4E9',
  bluishGreen: '#009E73',
  yellow: '#F0E442',
  blue: '#0072B2',
  vermillion: '#D55E00',
  reddishPurple: '#CC79A7',
  black: '#000000',
};

export const palettes: Record<DisplayMode, Palette> = {
  dark: {
    bg: '#07090F',
    panel: '#111827',
    text: '#E5E7EB',
    muted: '#94A3B8',
    accent: '#E0A24A',
    known: '#60A5FA',
    pass: '#34D399',
    pending: '#FACC15',
    info: '#38BDF8',
    reject: '#F87171',
    candidate: '#F472B6',
    border: '#1F2A3D',
  },
  light: {
    bg: '#F4F1EA',
    panel: '#FFFFFF',
    text: '#111827',
    muted: '#4B5563',
    accent: '#B45309',
    known: '#1D4ED8',
    pass: '#047857',
    pending: '#A16207',
    info: '#0369A1',
    reject: '#B91C1C',
    candidate: '#BE185D',
    border: '#D6D3CB',
  },
  colorblind: {
    bg: '#07090F',
    panel: '#111827',
    text: okabeIto.black === '#000000' ? '#F5F5F5' : '#F5F5F5',
    muted: '#A3A3A3',
    accent: okabeIto.orange,
    known: okabeIto.skyBlue,
    pass: okabeIto.bluishGreen,
    pending: okabeIto.yellow,
    info: okabeIto.blue,
    reject: okabeIto.vermillion,
    candidate: okabeIto.reddishPurple,
    border: '#1F2A3D',
  },
};

export const fonts = {
  ui: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};
