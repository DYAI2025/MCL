import { Voxel } from './core/model';
import { MaterialId } from './core/palette';

export type VoxelType = MaterialId;
export type { Voxel };

export type WolfPose = 'standing' | 'sleeping' | 'howling';
export type MossDensity = 'none' | 'seams' | 'light' | 'medium' | 'heavy' | 'lush';
export type ViewMode = 'turnaround' | 'interactive3d' | 'generated_image';

export interface ModelSpec {
  name: string;
  version: string;
  dimensions: { x: number; y: number; z: number };
  voxelCount: number;
  poses: WolfPose[];
}
