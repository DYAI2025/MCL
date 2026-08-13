import React, { useEffect, useRef } from 'react';
import { Voxel, WolfPose, MossDensity } from '../types';
import { faceColor } from '../core/palette';

interface TurnaroundCanvasProps {
  voxels: Voxel[];
  pose?: WolfPose;
  mossDensity?: MossDensity;
  isAnimated?: boolean;
  width?: number;
  height?: number;
  showDividers?: boolean;
  className?: string;
}

export const TurnaroundCanvas: React.FC<TurnaroundCanvasProps> = ({
  voxels,
  pose = 'standing',
  mossDensity = 'seams',
  isAnimated = true,
  width = 1600,
  height = 500,
  showDividers = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let animFrameId: number;
    let startTime: number | null = null;

    // Pre-calculate view-specific voxel variations if pose is provided
    const frontVoxels = voxels;
    const leftVoxels = voxels;
    const backVoxels = voxels;
    const isoVoxelsModel = voxels;

    const render = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = isAnimated ? timestamp - startTime : 0;

      // Gentle, slow loopable breathing & rocking parameters
      // Breathing vertical movement: ~2px sine wave at 2.5s cycle
      const breatheY = isAnimated ? Math.sin(elapsed * 0.0025) * 2.5 : 0;
      // Gentle side-to-side sway: ~1.5px cosine wave at 3.5s cycle
      const swayX = isAnimated ? Math.cos(elapsed * 0.0018) * 1.5 : 0;

      // 1. Plain Warm Off-White Background (#FFFDF7)
      ctx.fillStyle = '#FFFDF7';
      ctx.fillRect(0, 0, width, height);

      const cellWidth = width / 4;
      const cellHeight = height;

      // 2. Thin Grey Dividers (#D1CFCA)
      if (showDividers) {
        ctx.strokeStyle = '#D1CFCA';
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
          const x = Math.floor(i * cellWidth);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, cellHeight);
          ctx.stroke();
        }
      }

      // Shading colors
      const getColor = (type: Voxel['type'], face: 'top' | 'front_back' | 'side') => {
        const faceType = face === 'front_back' ? 'front' : face;
        return faceColor(type, faceType);
      };

      // Helper to compute model bounds
      const getBounds = (vList: Voxel[]) => {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        for (const v of vList) {
          if (v.x < minX) minX = v.x;
          if (v.x > maxX) maxX = v.x;
          if (v.y < minY) minY = v.y;
          if (v.y > maxY) maxY = v.y;
          if (v.z < minZ) minZ = v.z;
          if (v.z > maxZ) maxZ = v.z;
        }
        return { minX, maxX, minY, maxY, minZ, maxZ };
      };

      const bounds = getBounds(voxels);
      const modelWidthX = bounds.maxX - bounds.minX + 1;
      const modelHeightY = bounds.maxY - bounds.minY + 1;
      const modelLengthZ = bounds.maxZ - bounds.minZ + 1;

      const cubePixelSize = Math.min(
        (cellWidth * 0.62) / Math.max(modelWidthX, modelLengthZ),
        (cellHeight * 0.62) / modelHeightY
      );

      // CELL 1: FRONT VIEW
      {
        const centerX = cellWidth * 0.5 + swayX;
        const centerY = cellHeight * 0.5 + breatheY;
        const sorted = [...frontVoxels].sort((a, b) => a.z - b.z);
        const offsetX = (bounds.minX + bounds.maxX) / 2;
        const offsetY = (bounds.minY + bounds.maxY) / 2;

        for (const v of sorted) {
          const px = centerX + (v.x - offsetX) * cubePixelSize;
          const py = centerY - (v.y - offsetY) * cubePixelSize - cubePixelSize;
          ctx.fillStyle = getColor(v.type, 'front_back');
          ctx.fillRect(Math.floor(px), Math.floor(py), Math.ceil(cubePixelSize), Math.ceil(cubePixelSize));
        }
      }

      // CELL 2: LEFT SIDE VIEW
      {
        const centerX = cellWidth * 1.5 + swayX * 0.5;
        const centerY = cellHeight * 0.5 + breatheY;
        const sorted = [...leftVoxels].sort((a, b) => b.x - a.x);
        const offsetZ = (bounds.minZ + bounds.maxZ) / 2;
        const offsetY = (bounds.minY + bounds.maxY) / 2;

        for (const v of sorted) {
          const px = centerX + (v.z - offsetZ) * cubePixelSize;
          const py = centerY - (v.y - offsetY) * cubePixelSize - cubePixelSize;
          ctx.fillStyle = getColor(v.type, 'side');
          ctx.fillRect(Math.floor(px), Math.floor(py), Math.ceil(cubePixelSize), Math.ceil(cubePixelSize));
        }
      }

      // CELL 3: BACK VIEW
      {
        const centerX = cellWidth * 2.5 - swayX;
        const centerY = cellHeight * 0.5 + breatheY;
        const sorted = [...backVoxels].sort((a, b) => b.z - a.z);
        const offsetX = (bounds.minX + bounds.maxX) / 2;
        const offsetY = (bounds.minY + bounds.maxY) / 2;

        for (const v of sorted) {
          const px = centerX - (v.x - offsetX) * cubePixelSize;
          const py = centerY - (v.y - offsetY) * cubePixelSize - cubePixelSize;
          ctx.fillStyle = getColor(v.type, 'front_back');
          ctx.fillRect(Math.floor(px), Math.floor(py), Math.ceil(cubePixelSize), Math.ceil(cubePixelSize));
        }
      }

      // CELL 4: ISOMETRIC 30° VIEW
      {
        const centerX = cellWidth * 3.5 + swayX * 0.7;
        const centerY = cellHeight * 0.55 + breatheY;
        const isoScale = cubePixelSize * 0.82;
        const cos30 = Math.cos(Math.PI / 6);
        const sin30 = Math.sin(Math.PI / 6);

        const sorted = [...isoVoxelsModel].sort((a, b) => {
          const depthA = a.x - a.z + a.y;
          const depthB = b.x - b.z + b.y;
          if (depthA !== depthB) return depthA - depthB;
          return a.y - b.y;
        });

        const offsetX = (bounds.minX + bounds.maxX) / 2;
        const offsetY = (bounds.minY + bounds.maxY) / 2;
        const offsetZ = (bounds.minZ + bounds.maxZ) / 2;

        for (const v of sorted) {
          const dx = v.x - offsetX;
          const dy = v.y - offsetY;
          const dz = v.z - offsetZ;

          const sx = centerX + (dx - dz) * cos30 * isoScale;
          const sy = centerY - dy * isoScale + (dx + dz) * sin30 * isoScale;

          // Top
          ctx.fillStyle = getColor(v.type, 'top');
          ctx.beginPath();
          ctx.moveTo(sx, sy - isoScale);
          ctx.lineTo(sx + cos30 * isoScale, sy - isoScale + sin30 * isoScale);
          ctx.lineTo(sx, sy - isoScale + 2 * sin30 * isoScale);
          ctx.lineTo(sx - cos30 * isoScale, sy - isoScale + sin30 * isoScale);
          ctx.closePath();
          ctx.fill();

          // Front
          ctx.fillStyle = getColor(v.type, 'front_back');
          ctx.beginPath();
          ctx.moveTo(sx, sy - isoScale + 2 * sin30 * isoScale);
          ctx.lineTo(sx - cos30 * isoScale, sy - isoScale + sin30 * isoScale);
          ctx.lineTo(sx - cos30 * isoScale, sy + sin30 * isoScale);
          ctx.lineTo(sx, sy + 2 * sin30 * isoScale);
          ctx.closePath();
          ctx.fill();

          // Side
          ctx.fillStyle = getColor(v.type, 'side');
          ctx.beginPath();
          ctx.moveTo(sx, sy - isoScale + 2 * sin30 * isoScale);
          ctx.lineTo(sx + cos30 * isoScale, sy - isoScale + sin30 * isoScale);
          ctx.lineTo(sx + cos30 * isoScale, sy + sin30 * isoScale);
          ctx.lineTo(sx, sy + 2 * sin30 * isoScale);
          ctx.closePath();
          ctx.fill();
        }
      }

      if (isAnimated) {
        animFrameId = requestAnimationFrame(render);
      }
    };

    if (isAnimated) {
      animFrameId = requestAnimationFrame(render);
    } else {
      render(0);
    }

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [voxels, pose, mossDensity, isAnimated, width, height, showDividers]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto block rounded-none shadow-sm transition-all bg-[#FFFDF7]"
        style={{ aspectRatio: `${width}/${height}` }}
      />
    </div>
  );
};
