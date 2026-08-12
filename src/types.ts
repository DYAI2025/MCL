export type VoxelType = 'rock' | 'moss' | 'eye' | 'snout';

export type WolfPose = 'standing' | 'sleeping' | 'howling';

export interface Voxel {
  x: number; // Left/Right
  y: number; // Up/Down (0 is ground level)
  z: number; // Back/Front
  type: VoxelType;
}

export type ViewMode = 'turnaround' | 'interactive3d' | 'inspector' | 'generated_image';

export type MossDensity = 'none' | 'seams' | 'medium' | 'lush';

export interface ColorPalette {
  topFace: string;      // #6E7476 or brighter
  frontBackFace: string; // #585D5E
  sideFace: string;     // #424647
  mossTop: string;       // #6BA351
  mossFrontBack: string; // #5C8F45
  mossSide: string;      // #4A7537
  bg: string;            // #FFFDF7
  gridLines: string;     // #E0DDD5
}

