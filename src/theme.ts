// Display modes from GDD section 9. Switching modes changes presentation only.
export type DisplayMode = 'dark' | 'light' | 'colorblind';

export interface Palette {
  bg: string;
  panel: string;
  text: string;
  muted: string;
  accent: string;    // rank / XP / case-file accents
  known: string;
  pass: string;
  pending: string;
  info: string;
  reject: string;
  candidate: string;
  border: string;
}

// Okabe-Ito values from GDD 9.2.
const okabeIto = {
  orange: '#E69F00',
  skyBlue: '#56B4E9',
  bluishGreen: '#009E73',
  yellow: '#F0E442',
  blue: '#0072B2',
  vermillion: '#D55E00',
  reddishPurple: '#CC79A7',
};

export const palettes: Record<DisplayMode, Palette> = {
  // Night-sky case file: deep indigo, aged-amber accents.
  dark: {
    bg: '#06070E',
    panel: '#121426',
    text: '#E8E2D0',
    muted: '#8F8A9E',
    accent: '#D9A441',
    known: '#7DA7D9',
    pass: '#6FBF8E',
    pending: '#E0C25A',
    info: '#8FB8D9',
    reject: '#D9685A',
    candidate: '#B77BC4',
    border: '#2A2B45',
  },
  // Aged paper case file, ink on parchment.
  light: {
    bg: '#EFE8D6',
    panel: '#FBF6E9',
    text: '#1E1B16',
    muted: '#6B6457',
    accent: '#9A6A1B',
    known: '#1D4E89',
    pass: '#2F6B45',
    pending: '#8A6D12',
    info: '#1F5F7A',
    reject: '#9B2E22',
    candidate: '#7A3A7E',
    border: '#CDBF9E',
  },
  // Okabe-Ito throughout, so meaning never depends on hue alone.
  colorblind: {
    bg: '#06070E',
    panel: '#121426',
    text: '#F5F2E8',
    muted: '#A3A0A8',
    accent: okabeIto.orange,
    known: okabeIto.skyBlue,
    pass: okabeIto.bluishGreen,
    pending: okabeIto.yellow,
    info: okabeIto.blue,
    reject: okabeIto.vermillion,
    candidate: okabeIto.reddishPurple,
    border: '#2A2B45',
  },
};

export const fonts = {
  ui: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};
