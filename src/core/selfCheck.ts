import { faceColor } from './palette';
import { projectModel, IsoVoxel } from './iso';

export interface CheckResult {
  name: string;
  ok: boolean;
  detail?: string;
}

export function runSelfCheck(): CheckResult[] {
  const results: CheckResult[] = [];

  // Check 1
  const topColor = faceColor('rock', 'top');
  results.push({
    name: "faceColor('rock','top') is #81888A",
    ok: topColor === '#81888A',
    detail: topColor,
  });

  // Check 2
  const frontColor = faceColor('rock', 'front');
  results.push({
    name: "faceColor('rock','front') is #6E7476",
    ok: frontColor === '#6E7476',
    detail: frontColor,
  });

  // Check 3
  const sideColor = faceColor('rock', 'side');
  results.push({
    name: "faceColor('rock','side') is #535758",
    ok: sideColor === '#535758',
    detail: sideColor,
  });

  // Check 4
  const voxels3x3: IsoVoxel[] = [];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        voxels3x3.push({ x, y, z, material: 'rock' });
      }
    }
  }
  const faces3x3 = projectModel(voxels3x3, 400, 400);
  results.push({
    name: "projectModel() on a solid 3×3×3 cube of rock returns exactly 27 faces, not 81 — proves culling works",
    ok: faces3x3.length === 27,
    detail: `Got ${faces3x3.length} faces`,
  });

  // Check 5
  const run1 = JSON.stringify(projectModel(voxels3x3, 400, 400));
  const run2 = JSON.stringify(projectModel(voxels3x3, 400, 400));
  results.push({
    name: "projectModel() called twice with identical input returns byte-identical output",
    ok: run1 === run2,
    detail: run1 === run2 ? 'Byte-identical output' : 'Output mismatch',
  });

  return results;
}
