# Porting & Voxel Data Architecture Guide

This document details the core architecture, data structures, model JSON schema, and step-by-step instructions for porting the Stone Wolf voxel models into external 3D software (Blender, Maya, MagicaVoxel), game engines (Unity, Unreal Engine, Godot), or web frameworks (Three.js, Babylon.js).

---

## 1. Core System Architecture

The repository `src/` directory contains the following files:

```
src/
├── App.tsx                      # Root application UI component
├── index.css                    # Tailwind CSS imports & global styles
├── main.tsx                     # DOM entry point
├── types.ts                      # Core interfaces (Voxel, WolfPose, MossDensity)
├── vite-env.d.ts                # Vite environment type declarations
├── components/
│   ├── Interactive3DViewer.tsx  # Interactive 3D orbit inspection canvas
│   ├── TurnaroundCanvas.tsx     # 4-Cell Orthographic/Isometric HTML5 Canvas with idle animation
│   └── VoxelInspector.tsx       # Model stats, pose switcher, color specs, & exporter
├── core/
│   ├── iso.ts                   # Isometric projection & neighbor face culling engine
│   ├── model.ts                 # VoxelModel, ModelPart, & Box schema interfaces/validator
│   ├── palette.ts               # Color palette calculation & petrify engine
│   ├── runCheck.ts              # CLI runner for self-check validations
│   └── selfCheck.ts             # Core self-check test suite
├── data/
│   └── stoneWolfModel.ts        # Parametric voxel generator for Standing, Sleeping, & Howling
└── utils/
    └── exportUtils.ts           # Exporters for PNG, SVG, .OBJ, and JSON
```

---

## 2. Model JSON Schema

The voxel matrix is exported and imported as a flat array of 3D integer coordinate objects with surface material classifications.

### Schema Definition (TypeScript)

```typescript
export type VoxelType = 'rock' | 'moss' | 'eye' | 'snout';

export interface Voxel {
  x: number; // Integer X axis coordinate (Left / Right)
  y: number; // Integer Y axis coordinate (Up / Down, 0 is ground plane)
  z: number; // Integer Z axis coordinate (Back / Front)
  type: VoxelType; // Material classification
}
```

### Sample Voxel JSON Payload

```json
[
  { "x": -3, "y": 0, "z": 3, "type": "rock" },
  { "x": -3, "y": 0, "z": 4, "type": "rock" },
  { "x": -2, "y": 4, "z": 3, "type": "moss" },
  { "x": 0, "y": 11, "z": 8, "type": "rock" }
]
```

### Exact Specification Color Palette

| Face / Direction | Rock Hex Code | Moss Hex Code | Purpose / Shading Role |
| :--- | :--- | :--- | :--- |
| **Top Faces (+Y)** | `#81888A` | `#6CA751` | Brightest highlight face |
| **Front/Back Faces (±Z)** | `#6E7476` | `#5C8F45` | Mid-tone reference face shade |
| **Left/Right Faces (±X)** | `#535758` | `#456B33` | Darkest side shadow face |
| **Background** | `#FFFDF7` | `#FFFDF7` | Warm off-white background |
| **Grid Lines** | `#DBD3C2` | `#DBD3C2` | Thin cell dividers |

---

## 3. Porting to External Engines & Software

### A. Importing Wavefront `.OBJ` Files
The application exports standard `.OBJ` files where each cube is constructed as an axis-aligned 8-vertex, 6-quad polygon mesh.

1. **Blender**:
   - Go to `File > Import > Wavefront (.obj)`.
   - Select `stone_wolf_standing_model.obj` (or sleeping/howling).
   - In the import options, set **Forward Axis** to `-Z` and **Up Axis** to `Y`.
   - Enable **Flat Shading** to preserve hard voxel edges without auto-smoothing.

2. **Unity / Unreal Engine**:
   - Drag the exported `.OBJ` directly into your project's `Assets` folder.
   - Set Mesh Compression to `Off` and Normals to `Calculate` (Flat).
   - Assign materials matching the hex codes listed in the color palette table.

---

### B. Loading Voxel Data in Three.js

You can load the raw JSON matrix directly into a Three.js scene using `InstancedMesh` for maximum performance:

```typescript
import * as THREE from 'three';
import voxelData from './stone_wolf_standing_voxels.json';

export function createVoxelWolfGroup() {
  const group = new THREE.Group();
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

  // Define materials matching specification
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: '#6E7476',
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  const mossMaterial = new THREE.MeshStandardMaterial({
    color: '#5C8F45',
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true,
  });

  const dummy = new THREE.Object3D();

  // Separate rock and moss voxels for instancing
  const rockVoxels = voxelData.filter(v => v.type === 'rock');
  const mossVoxels = voxelData.filter(v => v.type === 'moss');

  const rockMesh = new THREE.InstancedMesh(boxGeometry, rockMaterial, rockVoxels.length);
  rockVoxels.forEach((v, index) => {
    dummy.position.set(v.x, v.y, v.z);
    dummy.updateMatrix();
    rockMesh.setMatrixAt(index, dummy.matrix);
  });

  const mossMesh = new THREE.InstancedMesh(boxGeometry, mossMaterial, mossVoxels.length);
  mossVoxels.forEach((v, index) => {
    dummy.position.set(v.x, v.y, v.z);
    dummy.updateMatrix();
    mossMesh.setMatrixAt(index, dummy.matrix);
  });

  group.add(rockMesh);
  group.add(mossMesh);
  return group;
}
```

---

### C. Importing into MagicaVoxel

1. Convert the JSON file into a `.vox` file using a CLI converter such as `json2vox` or custom Python script.
2. Ensure grid dimensions are set to minimum `32x32x32`.
3. Set color palette entries #1 through #6 to `#6E7476`, `#585D5E`, `#424647`, and `#5C8F45`.

---

## 4. Animation & Pose Modifications

The parametric voxel generator in `src/data/stoneWolfModel.ts` accepts pose targets:
- `'standing'`: Upright 4-legged posture with friendly closed snout.
- `'sleeping'`: Curled-up resting posture flat on ground.
- `'howling'`: Seated haunches with head tilted skyward and open jaw.

To add new poses (e.g. `'running'`, `'sitting'`), extend `WolfPose` in `src/types.ts` and implement the parametric coordinate offset loop in `stoneWolfModel.ts`.

---

## Not yet implemented

The following architectural components and migrations are not yet implemented:
- The UI components (`src/components/TurnaroundCanvas.tsx`, `src/components/Interactive3DViewer.tsx`, `src/components/VoxelInspector.tsx`) still contain their own internal projection code and their own hex colours rather than using `src/core/iso.ts` and `src/core/palette.ts`.
- No model JSON files exist yet in the workspace (models are generated procedurally by `src/data/stoneWolfModel.ts`).
- The AI Studio scaffolding files (`metadata.json`, etc.) are still present in the repository.
