// Chosen approach for poses: Used a 'variants' field inside stone-wolf.json rather than separate files
// to avoid duplicating unchanged parts across standing, sleeping, and howling poses.

import { MaterialId, MATERIALS } from './palette';

export interface Voxel {
  x: number;
  y: number;
  z: number;
  type: MaterialId;
}

export interface ModelBox {
  name?: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  material: MaterialId;
}

export interface ModelPart {
  name: string;
  pivot?: [number, number, number];
  boxes: ModelBox[];
  children?: ModelPart[];
}

export type ModelCategory = 'creature' | 'item' | 'wearable' | 'block' | 'structure' | 'avatar';
export type TruthStatus = 'STATED' | 'TENTATIVE' | 'AMBIGUOUS' | 'CONFLICT' | 'OPEN';

export interface VoxelModelVariant {
  parts?: ModelPart[];
  accents?: { at: [number, number, number]; material: MaterialId }[];
  elementMask?: [number, number, number][];
}

export interface VoxelModel {
  id: string;
  name: string;
  category: ModelCategory;
  truthStatus: TruthStatus;
  up: 'y';
  unit: 16;
  accents: { at: [number, number, number]; material: MaterialId }[];
  elementMask: [number, number, number][];
  parts: ModelPart[];
  variants?: Record<string, VoxelModelVariant>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateModel(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Model data must be a non-null object.'] };
  }

  const model = data as Record<string, unknown>;

  if (typeof model.id !== 'string' || !model.id.trim()) {
    errors.push('Model requires a valid "id" string.');
  }

  if (typeof model.name !== 'string' || !model.name.trim()) {
    errors.push('Model requires a valid "name" string.');
  }

  const validCategories: ModelCategory[] = ['creature', 'item', 'wearable', 'block', 'structure', 'avatar'];
  if (!validCategories.includes(model.category as ModelCategory)) {
    errors.push(`Model category must be one of: ${validCategories.join(', ')}`);
  }

  const validStatuses: TruthStatus[] = ['STATED', 'TENTATIVE', 'AMBIGUOUS', 'CONFLICT', 'OPEN'];
  if (!validStatuses.includes(model.truthStatus as TruthStatus)) {
    errors.push(`Model truthStatus must be one of: ${validStatuses.join(', ')}`);
  }

  if (model.up !== 'y') {
    errors.push('Model up vector must be "y".');
  }

  if (model.unit !== 16) {
    errors.push('Model unit must be 16.');
  }

  if (!Array.isArray(model.accents)) {
    errors.push('Model accents must be an array.');
  } else {
    model.accents.forEach((acc: any, idx: number) => {
      if (!acc || !Array.isArray(acc.at) || acc.at.length !== 3) {
        errors.push(`accents[${idx}] must have a 3D coordinate "at".`);
      }
      if (!acc || !(acc.material in MATERIALS)) {
        errors.push(`accents[${idx}] has unknown material "${acc?.material}".`);
      }
    });
  }

  if (!Array.isArray(model.elementMask)) {
    errors.push('Model elementMask must be an array.');
  }

  if (!Array.isArray(model.parts) || model.parts.length === 0) {
    errors.push('Model "parts" must be a non-empty array.');
  } else {
    validateSiblingParts(model.parts as ModelPart[], 'parts', errors);
  }

  if (errors.length === 0) {
    // Validate element mask coverage percentage if present
    const voxelCount = modelToVoxels(data as VoxelModel).length;
    const maskLen = (model.elementMask as any[]).length;
    if (maskLen > 0 && voxelCount > 0) {
      const ratio = maskLen / voxelCount;
      if (ratio < 0.15 || ratio > 0.25) {
        errors.push(
          `Element mask coverage ratio must be between 15% and 25% of opaque voxels (got ${(ratio * 100).toFixed(1)}%).`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateSiblingParts(parts: ModelPart[], path: string, errors: string[]) {
  const seenNames = new Set<string>();

  parts.forEach((part, idx) => {
    const partPath = `${path}[${idx}]`;
    if (!part || typeof part !== 'object') {
      errors.push(`${partPath} must be an object.`);
      return;
    }

    if (typeof part.name !== 'string' || !part.name.trim()) {
      errors.push(`${partPath} requires a valid "name" string.`);
    } else {
      if (seenNames.has(part.name)) {
        errors.push(`Sibling part names must be unique; duplicate found: "${part.name}" at ${partPath}.`);
      } else {
        seenNames.add(part.name);
      }
    }

    if (!Array.isArray(part.boxes)) {
      errors.push(`${partPath}.boxes must be an array.`);
    } else {
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      part.boxes.forEach((box, bIdx) => {
        const boxPath = `${partPath}.boxes[${bIdx}]`;
        if (!box || typeof box !== 'object') {
          errors.push(`${boxPath} must be an object.`);
          return;
        }

        if (!(box.material in MATERIALS)) {
          errors.push(`${boxPath} has unknown material "${box.material}".`);
        }

        const dims = ['width', 'height', 'depth'] as const;
        dims.forEach((d) => {
          const val = box[d];
          if (typeof val !== 'number' || !Number.isInteger(val) || val <= 0) {
            errors.push(`${boxPath}.${d} must be a positive integer.`);
          }
        });

        const coords = ['x', 'y', 'z'] as const;
        coords.forEach((c) => {
          if (typeof box[c] !== 'number' || !Number.isInteger(box[c])) {
            errors.push(`${boxPath}.${c} must be an integer.`);
          }
        });

        if (typeof box.x === 'number' && typeof box.width === 'number') {
          minX = Math.min(minX, box.x);
          maxX = Math.max(maxX, box.x + box.width);
        }
        if (typeof box.y === 'number' && typeof box.height === 'number') {
          minY = Math.min(minY, box.y);
          maxY = Math.max(maxY, box.y + box.height);
        }
        if (typeof box.z === 'number' && typeof box.depth === 'number') {
          minZ = Math.min(minZ, box.z);
          maxZ = Math.max(maxZ, box.z + box.depth);
        }
      });

      // Pivot check: pivot must lie inside the bounding box of its own part (local space: 0 lies within min..max)
      if (part.boxes.length > 0) {
        if (minX > 0 || maxX < 0 || minY > 0 || maxY < 0 || minZ > 0 || maxZ < 0) {
          errors.push(
            `Part pivot point (origin) must lie inside its bounding box. Bounding box for "${part.name}" is [${minX}..${maxX}, ${minY}..${maxY}, ${minZ}..${maxZ}].`
          );
        }
      }
    }

    if ('children' in part && Array.isArray(part.children) && part.children.length > 0) {
      validateSiblingParts(part.children, `${partPath}.children`, errors);
    }
  });
}

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

export function modelToVoxels(model: VoxelModel, variantName?: string): Voxel[] {
  const voxelMap = new Map<string, Voxel>();

  const activeVariant = variantName && model.variants ? model.variants[variantName] : undefined;
  const partsToProcess = activeVariant?.parts || model.parts;
  const accentsToProcess = activeVariant?.accents || model.accents;

  function processPart(part: ModelPart, parentOffset: [number, number, number] = [0, 0, 0]) {
    const pivot = part.pivot || [0, 0, 0];
    const offsetX = parentOffset[0] + pivot[0];
    const offsetY = parentOffset[1] + pivot[1];
    const offsetZ = parentOffset[2] + pivot[2];

    for (const box of part.boxes) {
      for (let bx = 0; bx < box.width; bx++) {
        for (let by = 0; by < box.height; by++) {
          for (let bz = 0; bz < box.depth; bz++) {
            const vx = Math.round(offsetX + box.x + bx);
            const vy = Math.round(offsetY + box.y + by);
            const vz = Math.round(offsetZ + box.z + bz);
            const key = `${vx},${vy},${vz}`;

            voxelMap.set(key, { x: vx, y: vy, z: vz, type: box.material });
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

  for (const part of partsToProcess) {
    processPart(part);
  }

  if (accentsToProcess) {
    for (const accent of accentsToProcess) {
      const [ax, ay, az] = accent.at;
      const key = `${ax},${ay},${az}`;
      voxelMap.set(key, { x: ax, y: ay, z: az, type: accent.material });
    }
  }

  return Array.from(voxelMap.values());
}
