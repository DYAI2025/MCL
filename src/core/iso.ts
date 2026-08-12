import { MaterialId, faceColor } from './palette';

export interface IsoVoxel {
  x: number;
  y: number;
  z: number;
  material: MaterialId;
}

export interface Face {
  points: [number, number][];
  color: string;
  depth: number;
}

function roundCoord(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Projects a 3D isometric model onto a 2D plane with face culling and depth sorting.
 * @param voxels Array of 3D voxel objects
 * @param width Canvas width in pixels
 * @param height Canvas height in pixels
 * @param pad Padding as a fraction of the smaller canvas side (defaults to 0.15)
 * @returns Array of projected faces ready for rendering
 */
export function projectModel(
  voxels: IsoVoxel[],
  width: number,
  height: number,
  pad?: number
): Face[] {
  if (!voxels || voxels.length === 0) {
    return [];
  }

  const padFraction = pad !== undefined ? pad : 0.15;
  const padding = Math.min(width, height) * padFraction;

  // Build coordinate lookup map for O(1) neighbor culling
  const voxelMap = new Map<string, IsoVoxel>();
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const v of voxels) {
    const key = `${v.x},${v.y},${v.z}`;
    voxelMap.set(key, v);

    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;
  }

  // Bounding box in 3D (unit cubes span [x, x+1] x [y, y+1] x [z, z+1])
  const bboxXMin = minX;
  const bboxXMax = maxX + 1;
  const bboxYMin = minY;
  const bboxYMax = maxY + 1;
  const bboxZMin = minZ;
  const bboxZMax = maxZ + 1;

  const cos30 = Math.cos((30 * Math.PI) / 180);
  const sin30 = Math.sin((30 * Math.PI) / 180);

  // Raw isometric projection formula (unscaled)
  function rawProj(x: number, y: number, z: number): [number, number] {
    const rx = (x - z) * cos30;
    const ry = -y + (x + z) * sin30;
    return [rx, ry];
  }

  // Project 8 corners of bounding box to calculate fit scale & centering offset
  const corners: [number, number, number][] = [
    [bboxXMin, bboxYMin, bboxZMin],
    [bboxXMax, bboxYMin, bboxZMin],
    [bboxXMin, bboxYMax, bboxZMin],
    [bboxXMax, bboxYMax, bboxZMin],
    [bboxXMin, bboxYMin, bboxZMax],
    [bboxXMax, bboxYMin, bboxZMax],
    [bboxXMin, bboxYMax, bboxZMax],
    [bboxXMax, bboxYMax, bboxZMax],
  ];

  let rawMinX = Infinity, rawMaxX = -Infinity;
  let rawMinY = Infinity, rawMaxY = -Infinity;

  for (const [cx, cy, cz] of corners) {
    const [px, py] = rawProj(cx, cy, cz);
    if (px < rawMinX) rawMinX = px;
    if (px > rawMaxX) rawMaxX = px;
    if (py < rawMinY) rawMinY = py;
    if (py > rawMaxY) rawMaxY = py;
  }

  const rawW = rawMaxX - rawMinX;
  const rawH = rawMaxY - rawMinY;

  const availW = Math.max(1, width - 2 * padding);
  const availH = Math.max(1, height - 2 * padding);

  const scale = (rawW > 0 && rawH > 0) ? Math.min(availW / rawW, availH / rawH) : 1;

  const rawCenterX = (rawMinX + rawMaxX) / 2;
  const rawCenterY = (rawMinY + rawMaxY) / 2;

  const screenCenterX = width / 2;
  const screenCenterY = height / 2;

  const offX = screenCenterX - rawCenterX * scale;
  const offY = screenCenterY - rawCenterY * scale;

  function projectPoint(x: number, y: number, z: number): [number, number] {
    const [rx, ry] = rawProj(x, y, z);
    return [
      roundCoord(rx * scale + offX),
      roundCoord(ry * scale + offY),
    ];
  }

  const faces: Face[] = [];

  for (const v of voxelMap.values()) {
    const x = v.x;
    const y = v.y;
    const z = v.z;

    // Top face (+Y): Culled if neighbor at (x, y + 1, z) exists
    if (!voxelMap.has(`${x},${y + 1},${z}`)) {
      const p0 = projectPoint(x, y + 1, z);
      const p1 = projectPoint(x + 1, y + 1, z);
      const p2 = projectPoint(x + 1, y + 1, z + 1);
      const p3 = projectPoint(x, y + 1, z + 1);

      faces.push({
        points: [p0, p1, p2, p3],
        color: faceColor(v.material, 'top'),
        depth: x + z + y + 0.5,
      });
    }

    // Front face (+Z): Culled if neighbor at (x, y, z + 1) exists
    if (!voxelMap.has(`${x},${y},${z + 1}`)) {
      const p0 = projectPoint(x, y, z + 1);
      const p1 = projectPoint(x + 1, y, z + 1);
      const p2 = projectPoint(x + 1, y + 1, z + 1);
      const p3 = projectPoint(x, y + 1, z + 1);

      faces.push({
        points: [p0, p1, p2, p3],
        color: faceColor(v.material, 'front'),
        depth: x + z + y + 0.3,
      });
    }

    // Side face (+X): Culled if neighbor at (x + 1, y, z) exists
    if (!voxelMap.has(`${x + 1},${y},${z}`)) {
      const p0 = projectPoint(x + 1, y, z);
      const p1 = projectPoint(x + 1, y, z + 1);
      const p2 = projectPoint(x + 1, y + 1, z + 1);
      const p3 = projectPoint(x + 1, y + 1, z);

      faces.push({
        points: [p0, p1, p2, p3],
        color: faceColor(v.material, 'side'),
        depth: x + z + y + 0.3,
      });
    }
  }

  // Sort back-to-front for painter's algorithm
  faces.sort((a, b) => a.depth - b.depth);

  return faces;
}
