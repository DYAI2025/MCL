import { Voxel, MossDensity, WolfPose } from '../types';

export function createStoneWolfModel(
  pose: WolfPose = 'standing',
  mossDensity: MossDensity = 'seams',
  viewVariant?: 'front' | 'left' | 'back' | 'iso'
): Voxel[] {
  const voxelsMap = new Map<string, Voxel>();

  const addVoxel = (x: number, y: number, z: number, type: Voxel['type'] = 'rock') => {
    const key = `${x},${y},${z}`;
    voxelsMap.set(key, { x, y, z, type });
  };

  // -------------------------------------------------------------
  // 1. STANDING POSE
  // -------------------------------------------------------------
  if (pose === 'standing') {
    // Four Box Legs (X: -3..-2 & 1..2, Y: 0..4, Z: 3..4 & -4..-3)
    for (let x = -3; x <= -2; x++) {
      for (let z = 3; z <= 4; z++) {
        for (let y = 0; y <= 4; y++) addVoxel(x, y, z, 'rock');
      }
    }
    for (let x = 1; x <= 2; x++) {
      for (let z = 3; z <= 4; z++) {
        for (let y = 0; y <= 4; y++) addVoxel(x, y, z, 'rock');
      }
    }
    for (let x = -3; x <= -2; x++) {
      for (let z = -4; z <= -3; z++) {
        for (let y = 0; y <= 4; y++) addVoxel(x, y, z, 'rock');
      }
    }
    for (let x = 1; x <= 2; x++) {
      for (let z = -4; z <= -3; z++) {
        for (let y = 0; y <= 4; y++) addVoxel(x, y, z, 'rock');
      }
    }

    // Torso (X: -3..2, Y: 5..8, Z: -5..4)
    for (let x = -3; x <= 2; x++) {
      for (let y = 5; y <= 8; y++) {
        for (let z = -5; z <= 4; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Back Ridge (Y: 9, X: -2..1, Z: -4..3)
    for (let x = -2; x <= 1; x++) {
      for (let z = -4; z <= 3; z++) addVoxel(x, 9, z, 'rock');
    }

    // Chest Bulk (X: -3..2, Y: 5..10, Z: 2..5)
    for (let x = -3; x <= 2; x++) {
      for (let y = 5; y <= 10; y++) {
        for (let z = 2; z <= 5; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Neck (X: -2..1, Y: 9..11, Z: 3..5)
    for (let x = -2; x <= 1; x++) {
      for (let y = 9; y <= 11; y++) {
        for (let z = 3; z <= 5; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Head Box (X: -2..1, Y: 11..13, Z: 4..7)
    for (let x = -2; x <= 1; x++) {
      for (let y = 11; y <= 13; y++) {
        for (let z = 4; z <= 7; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Snout (X: -1..0, Y: 11..12, Z: 8..9)
    for (let x = -1; x <= 0; x++) {
      for (let y = 11; y <= 12; y++) {
        for (let z = 8; z <= 9; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Upright Box Ears
    for (let y = 14; y <= 15; y++) {
      for (let z = 4; z <= 5; z++) {
        addVoxel(-2, y, z, 'rock');
        addVoxel(1, y, z, 'rock');
      }
    }

    // Tail (X: -1..0, Y: 7..8, Z: -7..-6)
    for (let x = -1; x <= 0; x++) {
      for (let y = 7; y <= 8; y++) {
        for (let z = -7; z <= -6; z++) addVoxel(x, y, z, 'rock');
      }
    }
  }

  // -------------------------------------------------------------
  // 2. SLEEPING POSE (Curled up, resting on ground)
  // -------------------------------------------------------------
  else if (pose === 'sleeping') {
    // Curled Torso on Ground (Y: 0..3, X: -4..3, Z: -3..3)
    for (let x = -4; x <= 3; x++) {
      for (let y = 0; y <= 3; y++) {
        for (let z = -3; z <= 3; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Back Curve/Spine (Y: 4, X: -3..2, Z: -2..2)
    for (let x = -3; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) addVoxel(x, 4, z, 'rock');
    }

    // Front/Rear Legs folded flat alongside (Y: 0..1)
    for (let z = -3; z <= 3; z++) {
      addVoxel(-5, 0, z, 'rock');
      addVoxel(-5, 1, z, 'rock');
      addVoxel(4, 0, z, 'rock');
      addVoxel(4, 1, z, 'rock');
    }

    // Head resting sideways on paws (X: -1..2, Y: 1..3, Z: 4..6)
    for (let x = -1; x <= 2; x++) {
      for (let y = 1; y <= 3; y++) {
        for (let z = 4; z <= 6; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Snout resting on ground paws (X: 0..1, Y: 1..2, Z: 7..8)
    for (let x = 0; x <= 1; x++) {
      for (let y = 1; y <= 2; y++) {
        for (let z = 7; z <= 8; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Folded Ears resting back
    addVoxel(-1, 4, 4, 'rock');
    addVoxel(-1, 4, 5, 'rock');
    addVoxel(2, 4, 4, 'rock');
    addVoxel(2, 4, 5, 'rock');

    // Tail wrapped around side (X: -5..-3, Y: 0..1, Z: -4..-2)
    for (let x = -5; x <= -3; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = -4; z <= -2; z++) addVoxel(x, y, z, 'rock');
      }
    }
  }

  // -------------------------------------------------------------
  // 3. HOWLING POSE (Rear seated, neck arched, head tilted up)
  // -------------------------------------------------------------
  else if (pose === 'howling') {
    // Seated Haunches / Hind Legs (X: -4..3, Y: 0..3, Z: -5..-2)
    for (let x = -4; x <= 3; x++) {
      for (let y = 0; y <= 3; y++) {
        for (let z = -5; z <= -2; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Upright Forelegs (Front Left: X: -3..-2, Y: 0..6, Z: 2..3 | Front Right: X: 1..2, Y: 0..6, Z: 2..3)
    for (let y = 0; y <= 6; y++) {
      for (let z = 2; z <= 3; z++) {
        addVoxel(-3, y, z, 'rock');
        addVoxel(-2, y, z, 'rock');
        addVoxel(1, y, z, 'rock');
        addVoxel(2, y, z, 'rock');
      }
    }

    // Arched Chest & Body (X: -3..2, Y: 4..9, Z: -3..3)
    for (let x = -3; x <= 2; x++) {
      for (let y = 4; y <= 9; y++) {
        for (let z = -3; z <= 3; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // High Arched Neck (X: -2..1, Y: 10..12, Z: -1..2)
    for (let x = -2; x <= 1; x++) {
      for (let y = 10; y <= 12; y++) {
        for (let z = -1; z <= 2; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Head Tilted Skyward (X: -2..1, Y: 13..15, Z: -2..1)
    for (let x = -2; x <= 1; x++) {
      for (let y = 13; y <= 15; y++) {
        for (let z = -2; z <= 1; z++) addVoxel(x, y, z, 'rock');
      }
    }

    // Open Howling Mouth / Upper & Lower Jaw pointing up (X: -1..0, Y: 16..18, Z: 0..1)
    for (let x = -1; x <= 0; x++) {
      for (let y = 16; y <= 18; y++) {
        addVoxel(x, y, 0, 'rock');
        addVoxel(x, y, 2, 'rock'); // Gap at z=1 represents open mouth box
      }
    }

    // Pinned Back Ears (X: -2 & 1, Y: 14..15, Z: -4..-3)
    for (let y = 14; y <= 15; y++) {
      for (let z = -4; z <= -3; z++) {
        addVoxel(-2, y, z, 'rock');
        addVoxel(1, y, z, 'rock');
      }
    }

    // Tail on ground behind (X: -1..0, Y: 0..1, Z: -7..-5)
    for (let x = -1; x <= 0; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = -7; z <= -5; z++) addVoxel(x, y, z, 'rock');
      }
    }
  }

  // -------------------------------------------------------------
  // MOSS SEAMS LOGIC (With optional slight per-view variation)
  // -------------------------------------------------------------
  if (mossDensity !== 'none') {
    let seamCoords: Array<[number, number, number]> = [];

    if (pose === 'standing') {
      seamCoords = [
        [-3, 4, 3], [-2, 4, 3], [1, 4, 3], [2, 4, 3],
        [-3, 4, -3], [-2, 4, -3], [1, 4, -3], [2, 4, -3],
        [-1, 9, -3], [0, 9, -2], [-1, 9, 0], [0, 9, 1], [-1, 9, 2],
        [-3, 8, 4], [2, 8, 4], [-2, 10, 5], [1, 10, 5],
        [-2, 11, 4], [1, 11, 4], [0, 13, 5], [-1, 13, 5],
        [-2, 13, 4], [1, 13, 4], [0, 8, -6], [-1, 8, -6]
      ];
    } else if (pose === 'sleeping') {
      seamCoords = [
        [-4, 2, 0], [-3, 2, 0], [2, 2, 0], [3, 2, 0],
        [-2, 4, -1], [1, 4, -1], [0, 4, 0], [-1, 4, 1],
        [-1, 2, 5], [0, 2, 5], [1, 2, 6], [-1, 3, 4],
        [-4, 1, -3], [-3, 1, -3], [-5, 1, 0], [4, 1, 0]
      ];
    } else if (pose === 'howling') {
      seamCoords = [
        [-3, 6, 2], [2, 6, 2], [-2, 3, -3], [1, 3, -3],
        [-1, 9, 0], [0, 9, 0], [-2, 12, 1], [1, 12, 1],
        [-1, 15, -1], [0, 15, -1], [-2, 14, -3], [1, 14, -3],
        [0, 1, -6], [-1, 1, -6]
      ];
    }

    if (mossDensity === 'medium' || mossDensity === 'lush') {
      seamCoords.push(
        [-3, 6, -1], [2, 6, -1], [-3, 7, 1], [2, 7, 1],
        [-1, 6, -5], [0, 6, -5], [-2, 12, 7], [1, 12, 7],
        [0, 12, 8], [-1, 12, 8]
      );
    }

    if (mossDensity === 'lush') {
      seamCoords.push(
        [-2, 9, -4], [1, 9, -4], [-2, 9, 3], [1, 9, 3],
        [-3, 5, 2], [2, 5, 2], [-1, 14, 5], [0, 14, 5],
        [-2, 11, 6], [1, 11, 6], [0, 7, -7]
      );
    }

    // Per-view variation adjustment if viewVariant specified
    if (viewVariant === 'front') {
      seamCoords = seamCoords.filter(([x, y, z]) => z >= -1 || (x >= -2 && x <= 1));
    } else if (viewVariant === 'left') {
      seamCoords = seamCoords.filter(([x, y, z]) => x <= 0 || (z >= -2 && z <= 2));
    } else if (viewVariant === 'back') {
      seamCoords = seamCoords.filter(([x, y, z]) => z <= 1 || (x >= -2 && x <= 1));
    }

    for (const [x, y, z] of seamCoords) {
      const key = `${x},${y},${z}`;
      if (voxelsMap.has(key)) {
        voxelsMap.set(key, { x, y, z, type: 'moss' });
      } else {
        voxelsMap.set(key, { x, y, z, type: 'moss' });
      }
    }
  }

  return Array.from(voxelsMap.values());
}
