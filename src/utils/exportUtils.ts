import { Voxel } from '../types';

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateSVGTurnaround(voxels: Voxel[], width = 1600, height = 500, showDividers = true): string {
  const cellWidth = width / 4;
  const cellHeight = height;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  
  // Background
  svg += `  <rect width="${width}" height="${height}" fill="#FFFDF7" />\n`;

  // Dividers
  if (showDividers) {
    for (let i = 1; i < 4; i++) {
      const x = i * cellWidth;
      svg += `  <line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#D5D2C8" stroke-width="1" />\n`;
    }
  }

  const getColor = (type: Voxel['type'], face: 'top' | 'front_back' | 'side') => {
    if (type === 'moss') {
      if (face === 'top') return '#6BA351';
      if (face === 'front_back') return '#5C8F45';
      return '#4A7537';
    } else {
      if (face === 'top') return '#818789';
      if (face === 'front_back') return '#585D5E';
      return '#424647';
    }
  };

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const v of voxels) {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;
  }

  const modelWidthX = maxX - minX + 1;
  const modelHeightY = maxY - minY + 1;
  const modelLengthZ = maxZ - minZ + 1;

  const cubeSize = Math.min(
    (cellWidth * 0.65) / Math.max(modelWidthX, modelLengthZ),
    (cellHeight * 0.65) / modelHeightY
  );

  const offsetX = (minX + maxX) / 2;
  const offsetY = (minY + maxY) / 2;
  const offsetZ = (minZ + maxZ) / 2;

  // Cell 1: Front
  {
    const centerX = cellWidth * 0.5;
    const centerY = cellHeight * 0.5;
    const sorted = [...voxels].sort((a, b) => a.z - b.z);
    for (const v of sorted) {
      const px = centerX + (v.x - offsetX) * cubeSize;
      const py = centerY - (v.y - offsetY) * cubeSize - cubeSize;
      const c = getColor(v.type, 'front_back');
      svg += `  <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${cubeSize.toFixed(2)}" height="${cubeSize.toFixed(2)}" fill="${c}" stroke="${c}" stroke-width="0.5" />\n`;
    }
  }

  // Cell 2: Left Side
  {
    const centerX = cellWidth * 1.5;
    const centerY = cellHeight * 0.5;
    const sorted = [...voxels].sort((a, b) => b.x - a.x);
    for (const v of sorted) {
      const px = centerX + (v.z - offsetZ) * cubeSize;
      const py = centerY - (v.y - offsetY) * cubeSize - cubeSize;
      const c = getColor(v.type, 'side');
      svg += `  <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${cubeSize.toFixed(2)}" height="${cubeSize.toFixed(2)}" fill="${c}" stroke="${c}" stroke-width="0.5" />\n`;
    }
  }

  // Cell 3: Back View
  {
    const centerX = cellWidth * 2.5;
    const centerY = cellHeight * 0.5;
    const sorted = [...voxels].sort((a, b) => b.z - a.z);
    for (const v of sorted) {
      const px = centerX - (v.x - offsetX) * cubeSize;
      const py = centerY - (v.y - offsetY) * cubeSize - cubeSize;
      const c = getColor(v.type, 'front_back');
      svg += `  <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${cubeSize.toFixed(2)}" height="${cubeSize.toFixed(2)}" fill="${c}" stroke="${c}" stroke-width="0.5" />\n`;
    }
  }

  // Cell 4: Isometric
  {
    const centerX = cellWidth * 3.5;
    const centerY = cellHeight * 0.55;
    const isoScale = cubeSize * 0.82;
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);

    const sorted = [...voxels].sort((a, b) => {
      const depthA = a.x - a.z + a.y;
      const depthB = b.x - b.z + b.y;
      if (depthA !== depthB) return depthA - depthB;
      return a.y - b.y;
    });

    for (const v of sorted) {
      const dx = v.x - offsetX;
      const dy = v.y - offsetY;
      const dz = v.z - offsetZ;

      const sx = centerX + (dx - dz) * cos30 * isoScale;
      const sy = centerY - dy * isoScale + (dx + dz) * sin30 * isoScale;

      const topC = getColor(v.type, 'top');
      const frontC = getColor(v.type, 'front_back');
      const sideC = getColor(v.type, 'side');

      // Top face
      svg += `  <polygon points="${sx.toFixed(2)},${(sy - isoScale).toFixed(2)} ${(sx + cos30 * isoScale).toFixed(2)},${(sy - isoScale + sin30 * isoScale).toFixed(2)} ${sx.toFixed(2)},${(sy - isoScale + 2 * sin30 * isoScale).toFixed(2)} ${(sx - cos30 * isoScale).toFixed(2)},${(sy - isoScale + sin30 * isoScale).toFixed(2)}" fill="${topC}" />\n`;
      // Front face
      svg += `  <polygon points="${(sx - cos30 * isoScale).toFixed(2)},${(sy - isoScale + sin30 * isoScale).toFixed(2)} ${sx.toFixed(2)},${(sy - isoScale + 2 * sin30 * isoScale).toFixed(2)} ${sx.toFixed(2)},${(sy + 2 * sin30 * isoScale).toFixed(2)} ${(sx - cos30 * isoScale).toFixed(2)},${(sy + sin30 * isoScale).toFixed(2)}" fill="${frontC}" />\n`;
      // Side face
      svg += `  <polygon points="${sx.toFixed(2)},${(sy - isoScale + 2 * sin30 * isoScale).toFixed(2)} ${(sx + cos30 * isoScale).toFixed(2)},${(sy - isoScale + sin30 * isoScale).toFixed(2)} ${(sx + cos30 * isoScale).toFixed(2)},${(sy + sin30 * isoScale).toFixed(2)} ${sx.toFixed(2)},${(sy + 2 * sin30 * isoScale).toFixed(2)}" fill="${sideC}" />\n`;
    }
  }

  svg += `</svg>`;
  return svg;
}

export function generateOBJModel(voxels: Voxel[]): string {
  let obj = `# Stone Wolf Voxel Model (.OBJ)\n`;
  obj += `# Generated by Stone Wolf Turnaround Studio\n\n`;

  let vertIndex = 1;

  for (const v of voxels) {
    const x = v.x;
    const y = v.y;
    const z = v.z;

    // 8 vertices for a cube at (x,y,z) with size 1
    obj += `v ${x} ${y} ${z}\n`;
    obj += `v ${x + 1} ${y} ${z}\n`;
    obj += `v ${x + 1} ${y + 1} ${z}\n`;
    obj += `v ${x} ${y + 1} ${z}\n`;
    obj += `v ${x} ${y} ${z + 1}\n`;
    obj += `v ${x + 1} ${y} ${z + 1}\n`;
    obj += `v ${x + 1} ${y + 1} ${z + 1}\n`;
    obj += `v ${x} ${y + 1} ${z + 1}\n`;

    const i = vertIndex;
    // 6 faces
    obj += `f ${i} ${i + 1} ${i + 2} ${i + 3}\n`; // Back
    obj += `f ${i + 5} ${i + 4} ${i + 7} ${i + 6}\n`; // Front
    obj += `f ${i + 4} ${i} ${i + 3} ${i + 7}\n`; // Left
    obj += `f ${i + 1} ${i + 5} ${i + 6} ${i + 2}\n`; // Right
    obj += `f ${i + 4} ${i + 5} ${i + 1} ${i}\n`; // Bottom
    obj += `f ${i + 3} ${i + 2} ${i + 6} ${i + 7}\n`; // Top

    vertIndex += 8;
  }

  return obj;
}
