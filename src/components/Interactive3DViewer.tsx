import React, { useEffect, useRef, useState } from 'react';
import { Voxel } from '../types';
import { RotateCcw, ZoomIn, ZoomOut, Box, Layers } from 'lucide-react';

interface Interactive3DViewerProps {
  voxels: Voxel[];
  onSelectVoxel?: (voxel: Voxel | null) => void;
}

export const Interactive3DViewer: React.FC<Interactive3DViewerProps> = ({
  voxels,
  onSelectVoxel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState<number>(0.45); // Pitch angle (radians)
  const [rotY, setRotY] = useState<number>(-0.65); // Yaw angle (radians)
  const [zoom, setZoom] = useState<number>(18);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredVoxel, setHoveredVoxel] = useState<Voxel | null>(null);
  const [highlightMoss, setHighlightMoss] = useState<boolean>(false);

  // Compute model center
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

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.height = 550;

    // Fill background
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(0, 0, width, height);

    // 3D rotation matrix calculation
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    // Project 3D voxel coordinate to 2D screen space
    const project = (x: number, y: number, z: number) => {
      // Center model
      const dx = x - centerX;
      const dy = y - centerY;
      const dz = z - centerZ;

      // Rotate around Y
      const x1 = dx * cosY - dz * sinY;
      const z1 = dx * sinY + dz * cosY;

      // Rotate around X
      const y2 = dy * cosX - z1 * sinX;
      const z2 = dy * sinX + z1 * cosX;

      const scale = zoom;
      const screenX = width / 2 + x1 * scale;
      const screenY = height / 2 - y2 * scale;

      return { screenX, screenY, depth: z2, x1, y2 };
    };

    // Painter's algorithm: sort voxels by depth (furthest z2 first)
    const projectedVoxels = voxels.map((v) => {
      const p = project(v.x, v.y, v.z);
      return { voxel: v, ...p };
    });

    projectedVoxels.sort((a, b) => a.depth - b.depth);

    // Render voxels
    for (const item of projectedVoxels) {
      const { voxel: v, screenX: sx, screenY: sy } = item;
      const s = zoom * 0.5; // Cube size in pixels

      const isMoss = v.type === 'moss';
      const isSelected = hoveredVoxel && hoveredVoxel.x === v.x && hoveredVoxel.y === v.y && hoveredVoxel.z === v.z;

      // Base shading colors
      let topColor = isMoss ? '#6BA351' : '#818789';
      let frontColor = isMoss ? '#5C8F45' : '#585D5E';
      let sideColor = isMoss ? '#4A7537' : '#424647';

      if (highlightMoss && isMoss) {
        topColor = '#A2E38B';
        frontColor = '#7BC960';
        sideColor = '#5FA847';
      }

      if (isSelected) {
        topColor = '#FFF176';
        frontColor = '#FBC02D';
        sideColor = '#F57F17';
      }

      // Render 3 faces for 3D cube projection
      // Top face
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.moveTo(sx, sy - s);
      ctx.lineTo(sx + s, sy - s * 0.5);
      ctx.lineTo(sx, sy);
      ctx.lineTo(sx - s, sy - s * 0.5);
      ctx.closePath();
      ctx.fill();

      // Front face
      ctx.fillStyle = frontColor;
      ctx.beginPath();
      ctx.moveTo(sx - s, sy - s * 0.5);
      ctx.lineTo(sx, sy);
      ctx.lineTo(sx, sy + s);
      ctx.lineTo(sx - s, sy + s * 0.5);
      ctx.closePath();
      ctx.fill();

      // Side face
      ctx.fillStyle = sideColor;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + s, sy - s * 0.5);
      ctx.lineTo(sx + s, sy + s * 0.5);
      ctx.lineTo(sx, sy + s);
      ctx.closePath();
      ctx.fill();
    }
  }, [rotX, rotY, zoom, voxels, hoveredVoxel, highlightMoss, centerX, centerY, centerZ]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;

    setRotY((prev) => prev + dx * 0.008);
    setRotX((prev) => Math.max(-1.4, Math.min(1.4, prev + dy * 0.008)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setRotX(0.45);
    setRotY(-0.65);
    setZoom(18);
  };

  return (
    <div className="relative bg-[#FFFDF7] border border-[#D1CFCA] p-5 select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-[#D1CFCA] pb-3">
        <div className="flex items-center space-x-2">
          <Box className="w-4 h-4 text-[#2C2E2F]" />
          <span className="font-serif font-medium text-base text-[#1A1C1D]">3D Interactive Orbit Inspection</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setHighlightMoss(!highlightMoss)}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors flex items-center space-x-1.5 border ${
              highlightMoss
                ? 'bg-[#5C8F45] text-[#FFFDF7] border-[#5C8F45]'
                : 'bg-[#FFFDF7] text-[#3D4042] border-[#D1CFCA] hover:bg-[#F4F2EB]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Highlight Moss</span>
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(30, z + 2))}
            className="p-1.5 bg-[#FFFDF7] border border-[#D1CFCA] hover:bg-[#F4F2EB] text-[#2C2E2F]"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(8, z - 2))}
            className="p-1.5 bg-[#FFFDF7] border border-[#D1CFCA] hover:bg-[#F4F2EB] text-[#2C2E2F]"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 bg-[#FFFDF7] border border-[#D1CFCA] hover:bg-[#F4F2EB] text-[#2C2E2F]"
            title="Reset Camera Angle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative cursor-grab active:cursor-grabbing overflow-hidden border border-[#D1CFCA]">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-[480px] block bg-[#FFFDF7]"
        />

        <div className="absolute bottom-3 left-3 bg-[#FFFDF7]/95 px-3 py-1.5 border border-[#D1CFCA] text-xs font-mono text-[#585D5E] flex items-center space-x-4">
          <span>Click & Drag Orbit</span>
          <span className="text-[#D1CFCA]">|</span>
          <span>Pitch: {(rotX * (180 / Math.PI)).toFixed(0)}°</span>
          <span>Yaw: {(rotY * (180 / Math.PI)).toFixed(0)}°</span>
        </div>
      </div>
    </div>
  );
};
