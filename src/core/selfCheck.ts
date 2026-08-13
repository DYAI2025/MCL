import { faceColor } from './palette';
import { projectModel, IsoVoxel } from './iso';
import { loadModel, modelToVoxels } from './model';

export interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

export function runSelfCheck(modelData?: unknown): CheckResult[] {
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
    name: "faceColor('rock','side') is #535759",
    ok: sideColor === '#535759',
    detail: sideColor,
  });

  // Check 4
  const cubeVoxels: IsoVoxel[] = [];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        cubeVoxels.push({ x, y, z, material: 'rock' });
      }
    }
  }
  const faces = projectModel(cubeVoxels, 400, 400);
  results.push({
    name: "projectModel() on a solid 3×3×3 cube of rock returns exactly 27 faces, not 81 — proves culling works",
    ok: faces.length === 27,
    detail: `Got ${faces.length} faces`,
  });

  // Check 5
  const run1 = JSON.stringify(projectModel(cubeVoxels, 400, 400));
  const run2 = JSON.stringify(projectModel(cubeVoxels, 400, 400));
  results.push({
    name: "projectModel() called twice with identical input returns byte-identical output",
    ok: run1 === run2,
    detail: run1 === run2 ? 'Byte-identical output' : 'Output mismatch',
  });

  // Check 6
  let unknownIdThrew = false;
  try {
    faceColor('nonexistent_material' as any, 'top');
  } catch (err) {
    unknownIdThrew = true;
  }
  results.push({
    name: "calling faceColor with an id that is not in the catalogue throws",
    ok: unknownIdThrew,
    detail: unknownIdThrew ? 'Threw Error as expected' : 'Did not throw',
  });

  // Check 7
  const singleVoxel: IsoVoxel[] = [{ x: 0, y: 0, z: 0, material: 'rock' }];
  const duplicateVoxels: IsoVoxel[] = [
    { x: 0, y: 0, z: 0, material: 'rock' },
    { x: 0, y: 0, z: 0, material: 'rock' },
  ];
  const facesSingle = projectModel(singleVoxel, 400, 400);
  const facesDup = projectModel(duplicateVoxels, 400, 400);
  results.push({
    name: "a voxel list containing the same coordinate twice produces the same face count as the list containing it once",
    ok: facesSingle.length === facesDup.length,
    detail: `Single: ${facesSingle.length}, Duplicate: ${facesDup.length}`,
  });

  // Check 8: Fixed expected voxel and material counts per pose
  if (modelData) {
    const model = loadModel(modelData);

    const standingVoxels = modelToVoxels(model, 'standing');
    const standingRock = standingVoxels.filter((v) => v.type === 'rock').length;
    const standingMoss = standingVoxels.filter((v) => v.type === 'moss').length;

    const sleepingVoxels = modelToVoxels(model, 'sleeping');
    const sleepingRock = sleepingVoxels.filter((v) => v.type === 'rock').length;
    const sleepingMoss = sleepingVoxels.filter((v) => v.type === 'moss').length;

    const howlingVoxels = modelToVoxels(model, 'howling');
    const howlingRock = howlingVoxels.filter((v) => v.type === 'rock').length;
    const howlingMoss = howlingVoxels.filter((v) => v.type === 'moss').length;

    const expectedStanding = { rock: 467, moss: 25, total: 492 };
    const expectedSleeping = { rock: 320, moss: 16, total: 336 };
    const expectedHowling = { rock: 522, moss: 14, total: 536 };

    const check8Ok =
      standingVoxels.length === expectedStanding.total &&
      standingRock === expectedStanding.rock &&
      standingMoss === expectedStanding.moss &&
      sleepingVoxels.length === expectedSleeping.total &&
      sleepingRock === expectedSleeping.rock &&
      sleepingMoss === expectedSleeping.moss &&
      howlingVoxels.length === expectedHowling.total &&
      howlingRock === expectedHowling.rock &&
      howlingMoss === expectedHowling.moss;

    results.push({
      name: "for each pose, voxel counts and material breakdown match expected values",
      ok: check8Ok,
      detail: `standing: ${standingRock} rock / ${standingMoss} moss (total ${standingVoxels.length}), sleeping: ${sleepingRock} rock / ${sleepingMoss} moss (total ${sleepingVoxels.length}), howling: ${howlingRock} rock / ${howlingMoss} moss (total ${howlingVoxels.length})`,
    });
  } else {
    results.push({
      name: "for each pose, voxel counts and material breakdown match expected values",
      ok: false,
      detail: 'No model data provided or accessible for Check 8',
    });
  }

  return results;
}

export const runSelfChecks = runSelfCheck;
