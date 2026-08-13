# Voxel Core Architecture & Porting Guide

This document describes the portable core runtime architecture, data structures, model JSON schema, and exporter logic.

---

## 1. Directory Structure

Below is the complete project directory layout under `src/`:

```
src/
├── App.tsx
├── index.css
├── main.tsx
├── types.ts
├── vite-env.d.ts
├── assets/
│   ├── images/
│   │   ├── stone_wolf_howling_turnaround_1786564304196.jpg
│   │   ├── stone_wolf_sleeping_turnaround_1786564292886.jpg
│   │   └── stone_wolf_turnaround_1786563939032.jpg
│   └── models/
│       └── stone-wolf.json
├── components/
│   ├── Interactive3DViewer.tsx
│   ├── TurnaroundCanvas.tsx
│   └── VoxelInspector.tsx
├── core/
│   ├── buildAssets.ts
│   ├── hash.ts
│   ├── iso.ts
│   ├── model.ts
│   ├── palette.ts
│   ├── runCheck.ts
│   ├── selfCheck.ts
│   └── svg.ts
└── utils/
    └── exportUtils.ts
```

The portable core logic resides entirely in `src/core/`:
- `palette.ts`: Material/Element color catalogues, face shading, and petrify transform
- `iso.ts`: Isometric projection, face culling, and depth sorting
- `model.ts`: VoxelModel schema, validation rules, and modelToVoxels extractor
- `svg.ts`: Standalone SVG renderer converting face arrays into SVG strings
- `hash.ts`: FNV-1a 32-bit deterministic content hash function
- `buildAssets.ts`: Node script to validate models, generate SVG previews, and write index.json
- `selfCheck.ts`: Core verification checks suite
- `runCheck.ts`: CLI runner for selfCheck.ts

Asset models are stored in `src/assets/models/`:
- `stone-wolf.json`: Stone wolf model specification with pose variants and seam accents

---

## 2. Model JSON Schema

A model JSON file defines a hierarchical voxel assembly:

```json
{
  "id": "stone-wolf",
  "name": "Stone Wolf",
  "category": "creature",
  "truthStatus": "STATED",
  "up": "y",
  "unit": 16,
  "parts": [
    {
      "name": "head",
      "pivot": [0, 12, 5],
      "boxes": [
        { "x": -2, "y": -1, "z": -1, "width": 4, "height": 3, "depth": 4, "material": "rock" }
      ]
    }
  ],
  "accents": [
    { "at": [0, 9, -4], "material": "moss" }
  ],
  "variants": {
    "sleeping": {
      "parts": [...],
      "accents": [...]
    }
  }
}
```

### Key Schema Constraints
1. Every part must have a non-empty `boxes` array and a `pivot` `[x, y, z]`.
2. Box dimensions (`width`, `height`, `depth`) must be positive integers.
3. Box `material` must exist in `MATERIALS` catalogue (`src/core/palette.ts`).
4. In local space, the part pivot `[0,0,0]` must lie within the bounding box formed by its boxes.
5. `accents` array allows overriding base voxels with secondary materials (e.g., moss seam details).
6. `variants` can override specific part arrays and accents for alternative poses or states.

---

## 3. Projection & Culling Pipeline

1. **`loadModel(data)`**: Parses and converts raw JSON into a typed `VoxelModel`.
2. **`modelToVoxels(model, variantName?)`**: Flattens parts and boxes into a 3D coordinate array of voxels, applying accent overrides.
3. **`projectModel(voxels, width, height)`**:
   - Builds an O(1) coordinate map (`x,y,z`).
   - Culls hidden interior faces by checking neighbor existence.
   - Applies orthographic 30° isometric transformation.
   - Computes depth and sorts faces back-to-front.
4. **`facesToSVG(faces, width, height, background)`**: Emits pure SVG polygon strings with `shape-rendering="crispEdges"`.

---

## 4. Asset Build System

Running `npm run build:assets`:
1. Reads all `.json` files in `src/assets/models/`.
2. Validates each model with `validateModel()`.
3. Computes 8-character hex hash with `contentHash()`.
4. Generates 512×512 and 128×128 SVG previews into `public/assets/`.
5. Writes `public/assets/index.json` containing model metadata, hash, SVG asset paths, material list, and voxel count.

---

## 5. Not yet implemented

`src/App.tsx` and the three components in `src/components/` (`Interactive3DViewer.tsx`, `TurnaroundCanvas.tsx`, `VoxelInspector.tsx`) still contain their own hex colours — roughly 209 literals — and are awaiting a separate redesign.
