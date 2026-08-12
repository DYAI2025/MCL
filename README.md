# Stone Wolf Voxel Turnaround Studio

An interactive studio and technical exporter for blocky stone wolf voxel models. Designed in an **Editorial Aesthetic** with a plain warm off-white canvas (`#FFFDF7`), crisp cell dividers (`#D1CFCA`), and parametric pose generation.

---

## Features

- **4-View Turnaround Sheet**: High-resolution 4-cell horizontal layout featuring Front, Left Side, Back, and 30-degree Isometric orthographic views.
- **Subtle Idle Animation**: Loopable breathing and gentle side-to-side swaying motion with a toggle control.
- **Multiple Poses**: Switch seamlessly between **Standing**, **Sleeping** (curled up resting), and **Howling** (seated haunches with head skyward).
- **Moss Seam Density**: Adjust living moss seam distribution from clean rock up to lush moss coverage.
- **3D Orbit Inspector**: Interactive drag-to-rotate canvas to inspect voxel geometry from any angle with moss seam highlighting.
- **Technical Asset Exporters**:
  - High-Res Image (`.PNG`)
  - Vector Graphic (`.SVG`)
  - 3D Polygon Mesh (`.OBJ`)
  - Voxel Coordinate Matrix (`.JSON`)

---

## Quick Start (Local Environment Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Run

1. **Clone or Extract Project**:
   ```bash
   cd stone-wolf-voxel-studio
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Lint & Verify Codebase**:
   ```bash
   npm run lint
   ```

5. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## Specification Palette & Shading

- **Top Faces (+Y)**: Brightest Highlight (`#818789` Rock / `#6BA351` Moss)
- **Front/Back Faces (±Z)**: Mid-tone Shade (`#585D5E` Rock / `#5C8F45` Moss)
- **Left/Right Faces (±X)**: Darkest Shadow (`#424647` Rock / `#4A7537` Moss)
- **Background**: Warm Off-White (`#FFFDF7`)
- **Cell Dividers**: Thin Grey Line (`#D1CFCA`)

---

## Documentation & Porting

For detailed model JSON schema specifications and porting instructions into **Blender**, **Unity**, **Unreal Engine**, or **Three.js**, view [docs/PORTING.md](docs/PORTING.md).
