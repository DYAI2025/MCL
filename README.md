# Voxel Model Core Runtime

A portable, dependency-free core engine for loading, validating, and projecting 3D voxel models with face culling, consistent palette shading, and SVG rendering.

---

## Features & Core Modules

- **Palette & Shading (`src/core/palette.ts`)**:
  - Catalogue of materials (`rock`, `stone`, `timber`, `steel`, `gold`, `fur`, `moss`, `soil`, `druhen`, `eye`, `snout`) and elemental overlays (`fire`, `ice`, `earth`, `air`).
  - Face color computation with consistent `Math.round()` shading across `top`, `front`, and `side` faces.
  - Strict validation that throws errors on unknown material or element IDs.

- **Isometric Projection & Culling (`src/core/iso.ts`)**:
  - `projectModel()` projects 3D voxel matrices onto 2D isometric planes with O(1) neighbor face culling and depth sorting (painter's algorithm).

- **Model Hierarchy & Validation (`src/core/model.ts`)**:
  - Strict `VoxelModel` schema with parts, boxes, pivots, offset inheritance, and variant overrides.
  - `validateModel()` checks structural constraints (positive integer dimensions, valid materials, non-empty parts, pivot inside part bounding box, element mask coverage).
  - `modelToVoxels()` extracts voxel coordinate matrices for base models and pose variants.

- **SVG Renderer (`src/core/svg.ts`)**:
  - `facesToSVG()` converts projected face arrays into pure SVG string output with crisp-edges rendering.

- **Deterministic Content Hashing (`src/core/hash.ts`)**:
  - FNV-1a 32-bit hash algorithm rendering 8-character lowercase hex hashes for asset versioning.

- **Asset Builder Script (`src/core/buildAssets.ts`)**:
  - Validates model JSON files in `src/assets/models/`, computes content hashes, generates 512×512 and 128×128 SVG previews in `public/assets/`, and produces `public/assets/index.json`.

- **Self Check Validation (`src/core/selfCheck.ts`, `src/core/runCheck.ts`)**:
  - Verification suite checking color formulas, culling logic, determinism, error handling, and voxel counts.

---

## CLI Commands

- **Run Self Check Suite**:
  ```bash
  npm run check
  ```

- **Build Public Assets**:
  ```bash
  npm run build:assets
  ```

- **Type Check**:
  ```bash
  npm run lint
  ```

- **Development Server**:
  ```bash
  npm run dev
  ```
