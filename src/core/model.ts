import { Voxel, VoxelType } from '../types';

export interface ModelBox {
  id?: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  type?: VoxelType;
  color?: string;
}

export interface ModelPart {
  name: string;
  pivot?: [number, number, number];
  boxes: ModelBox[];
  children?: ModelPart[];
  visible?: boolean;
}

export interface VoxelModel {
  name: string;
  version?: string;
  author?: string;
  description?: string;
  gridDimensions?: [number, number, number];
  parts: ModelPart[];
  voxels?: Voxel[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates whether an unknown input object conforms to the VoxelModel interface schema.
 */
export function validateModel(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Model data must be a non-null object.'] };
  }

  const model = data as Record<string, unknown>;

  if (typeof model.name !== 'string' || !model.name.trim()) {
    errors.push('Model requires a valid "name" string.');
  }

  if ('parts' in model) {
    if (!Array.isArray(model.parts)) {
      errors.push('"parts" must be an array.');
    } else {
      model.parts.forEach((part, idx) => {
        validatePart(part, `parts[${idx}]`, errors);
      });
    }
  }

  if ('voxels' in model) {
    if (!Array.isArray(model.voxels)) {
      errors.push('"voxels" must be an array.');
    } else {
      model.voxels.forEach((v, idx) => {
        if (!v || typeof v !== 'object') {
          errors.push(`voxels[${idx}] must be an object.`);
        } else {
          const vox = v as Record<string, unknown>;
          if (typeof vox.x !== 'number' || typeof vox.y !== 'number' || typeof vox.z !== 'number') {
            errors.push(`voxels[${idx}] requires numeric x, y, z coordinates.`);
          }
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validatePart(part: unknown, path: string, errors: string[]) {
  if (!part || typeof part !== 'object') {
    errors.push(`${path} must be an object.`);
    return;
  }

  const p = part as Record<string, unknown>;

  if (typeof p.name !== 'string' || !p.name.trim()) {
    errors.push(`${path} requires a valid "name" string.`);
  }

  if (!Array.isArray(p.boxes)) {
    errors.push(`${path}.boxes must be an array.`);
  } else {
    p.boxes.forEach((box, bIdx) => {
      validateBox(box, `${path}.boxes[${bIdx}]`, errors);
    });
  }

  if ('children' in p && Array.isArray(p.children)) {
    p.children.forEach((child, cIdx) => {
      validatePart(child, `${path}.children[${cIdx}]`, errors);
    });
  }
}

function validateBox(box: unknown, path: string, errors: string[]) {
  if (!box || typeof box !== 'object') {
    errors.push(`${path} must be an object.`);
    return;
  }

  const b = box as Record<string, unknown>;
  const requiredNums = ['x', 'y', 'z', 'width', 'height', 'depth'];
  requiredNums.forEach((prop) => {
    if (typeof b[prop] !== 'number') {
      errors.push(`${path}.${prop} must be a number.`);
    }
  });
}

/**
 * Parses and loads a VoxelModel from a JSON string or raw object.
 * Throws a detailed Error if validation fails.
 */
export function loadModel(input: string | unknown): VoxelModel {
  let parsed: unknown;

  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input);
    } catch (err) {
      throw new Error(`Failed to parse model JSON: ${(err as Error).message}`);
    }
  } else {
    parsed = input;
  }

  const validation = validateModel(parsed);
  if (!validation.valid) {
    throw new Error(`Invalid VoxelModel schema:\n- ${validation.errors.join('\n- ')}`);
  }

  return parsed as VoxelModel;
}

/**
 * Converts a structured VoxelModel parts array into a flat Voxel[] array.
 */
export function modelToVoxels(model: VoxelModel): Voxel[] {
  if (model.voxels && model.voxels.length > 0) {
    return model.voxels;
  }

  const voxelsMap = new Map<string, Voxel>();

  function processPart(part: ModelPart, parentOffset: [number, number, number] = [0, 0, 0]) {
    const pivot = part.pivot || [0, 0, 0];
    const offsetX = parentOffset[0] + pivot[0];
    const offsetY = parentOffset[1] + pivot[1];
    const offsetZ = parentOffset[2] + pivot[2];

    for (const box of part.boxes) {
      const type: VoxelType = box.type || 'rock';

      for (let bx = 0; bx < box.width; bx++) {
        for (let by = 0; by < box.height; by++) {
          for (let bz = 0; bz < box.depth; bz++) {
            const vx = Math.round(offsetX + box.x + bx);
            const vy = Math.round(offsetY + box.y + by);
            const vz = Math.round(offsetZ + box.z + bz);
            const key = `${vx},${vy},${vz}`;

            voxelsMap.set(key, { x: vx, y: vy, z: vz, type });
          }
        }
      }
    }

    if (part.children) {
      for (const child of part.children) {
        processPart(child, [offsetX, offsetY, offsetZ]);
      }
    }
  }

  for (const part of model.parts) {
    processPart(part);
  }

  return Array.from(voxelsMap.values());
}
