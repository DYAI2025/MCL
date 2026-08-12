export type MaterialId =
  | 'rock'
  | 'stone'
  | 'timber'
  | 'steel'
  | 'gold'
  | 'fur'
  | 'moss'
  | 'soil'
  | 'druhen'
  | 'eye'
  | 'snout';

export type ElementId = 'fire' | 'ice' | 'earth' | 'air';

export const MATERIALS: Record<MaterialId, string> = {
  rock: '#6E7476',
  stone: '#B2B5B6',
  timber: '#8A5A33',
  steel: '#B9C2C7',
  gold: '#D8A63C',
  fur: '#B5733F',
  moss: '#5C8F45',
  soil: '#5C4033',
  druhen: '#5B2E8C',
  eye: '#2A2F35',
  snout: '#7E8486',
};

export const ELEMENTS: Record<ElementId, string> = {
  fire: '#E85A1A',
  ice: '#4FA8D8',
  earth: '#4E8B3C',
  air: '#C3D3DE',
};

export const paper = '#FFFDF7';
export const gridline = '#DBD3C2';

export const SURFACES = {
  paper,
  gridline,
} as const;

function toHex(n: number): string {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0').toUpperCase();
}

function computeFaceColor(hex: string, face: 'top' | 'front' | 'side'): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (face === 'front') {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  const factor = face === 'top' ? 1.17 : 0.75;

  const rScaled = Math.min(255, Math.round(r * factor));
  const gScaled = Math.min(255, Math.round(g * factor));
  const bScaled = Math.min(255, Math.round(b * factor));

  return `#${toHex(rScaled)}${toHex(gScaled)}${toHex(bScaled)}`;
}

export function faceColor(material: MaterialId, face: 'top' | 'front' | 'side'): string {
  const ref = MATERIALS[material];
  if (!ref) {
    throw new Error(`Unknown material id: "${material}"`);
  }
  return computeFaceColor(ref, face);
}

export function elementColor(element: ElementId, face: 'top' | 'front' | 'side'): string {
  const ref = ELEMENTS[element];
  if (!ref) {
    throw new Error(`Unknown element id: "${element}"`);
  }
  return computeFaceColor(ref, face);
}

export function petrify(material: MaterialId): { top: string; front: string; side: string } {
  const ref = MATERIALS[material];
  if (!ref) {
    throw new Error(`Unknown material id: "${material}"`);
  }
  const r = parseInt(ref.slice(1, 3), 16);
  const g = parseInt(ref.slice(3, 5), 16);
  const b = parseInt(ref.slice(5, 7), 16);

  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const rDesat = gray + 0.35 * (r - gray);
  const gDesat = gray + 0.35 * (g - gray);
  const bDesat = gray + 0.35 * (b - gray);

  const targetR = 113; // #717373
  const targetG = 115;
  const targetB = 115;

  const rPetrify = Math.round(0.5 * rDesat + 0.5 * targetR);
  const gPetrify = Math.round(0.5 * gDesat + 0.5 * targetG);
  const bPetrify = Math.round(0.5 * bDesat + 0.5 * targetB);

  const baseHex = `#${toHex(rPetrify)}${toHex(gPetrify)}${toHex(bPetrify)}`;

  return {
    top: computeFaceColor(baseHex, 'top'),
    front: computeFaceColor(baseHex, 'front'),
    side: computeFaceColor(baseHex, 'side'),
  };
}
