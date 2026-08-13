import React, { useState, useMemo } from 'react';
import { loadModel, modelToVoxels } from './core/model';
import stoneWolfData from './assets/models/stone-wolf.json';
import { TurnaroundCanvas } from './components/TurnaroundCanvas';
import { Interactive3DViewer } from './components/Interactive3DViewer';
import { VoxelInspector } from './components/VoxelInspector';
import { ViewMode, MossDensity, WolfPose } from './types';
import { generateSVGTurnaround, generateOBJModel, downloadFile } from './utils/exportUtils';

import standingImageSrc from './assets/images/stone_wolf_turnaround_1786563939032.jpg';
import sleepingImageSrc from './assets/images/stone_wolf_sleeping_turnaround_1786564292886.jpg';
import howlingImageSrc from './assets/images/stone_wolf_howling_turnaround_1786564304196.jpg';

import { Eye, Box, Image as ImageIcon, Download, Sparkles, Activity, Play, Pause } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('turnaround');
  const [pose, setPose] = useState<WolfPose>('standing');
  const [mossDensity, setMossDensity] = useState<MossDensity>('seams');
  const [showDividers, setShowDividers] = useState<boolean>(true);
  const [isAnimated, setIsAnimated] = useState<boolean>(true);

  const model = useMemo(() => loadModel(stoneWolfData), []);
  const voxels = useMemo(() => modelToVoxels(model, pose), [model, pose]);

  const activeImageSrc = useMemo(() => {
    if (pose === 'sleeping') return sleepingImageSrc;
    if (pose === 'howling') return howlingImageSrc;
    return standingImageSrc;
  }, [pose]);

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `stone_wolf_${pose}_turnaround_sheet.png`;
      a.click();
    }
  };

  const handleExportSVG = () => {
    const svgStr = generateSVGTurnaround(voxels, 1600, 500, showDividers);
    downloadFile(svgStr, `stone_wolf_${pose}_turnaround_sheet.svg`, 'image/svg+xml');
  };

  const handleExportOBJ = () => {
    const objStr = generateOBJModel(voxels);
    downloadFile(objStr, `stone_wolf_${pose}_model.obj`, 'text/plain');
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(voxels, null, 2);
    downloadFile(jsonStr, `stone_wolf_${pose}_voxels.json`, 'application/json');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#2C2E2F] font-sans antialiased selection:bg-[#5C8F45]/20">
      <header className="bg-[#FFFDF7] border-b border-[#D1CFCA] sticky top-0 z-20 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 border border-[#2C2E2F] bg-[#2C2E2F] text-[#FFFDF7] flex items-center justify-center font-mono font-bold text-xs tracking-wider">
              VOX
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#5C8F45] font-semibold">
                Editorial Turnaround Studio
              </div>
              <h1 className="font-serif font-medium text-xl sm:text-2xl text-[#1A1C1D] tracking-tight">
                Stone Wolf Voxel Model
              </h1>
            </div>
          </div>

          <div className="flex items-center bg-[#F4F2EB] p-1 border border-[#D1CFCA]">
            <button
              onClick={() => setViewMode('turnaround')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-mono tracking-wide uppercase transition-all ${
                viewMode === 'turnaround'
                  ? 'bg-[#FFFDF7] text-[#1A1C1D] border border-[#D1CFCA] font-bold shadow-2xs'
                  : 'text-[#686D70] hover:text-[#1A1C1D]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>4-View Sheet</span>
            </button>

            <button
              onClick={() => setViewMode('interactive3d')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-mono tracking-wide uppercase transition-all ${
                viewMode === 'interactive3d'
                  ? 'bg-[#FFFDF7] text-[#1A1C1D] border border-[#D1CFCA] font-bold shadow-2xs'
                  : 'text-[#686D70] hover:text-[#1A1C1D]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Orbit</span>
            </button>

            <button
              onClick={() => setViewMode('generated_image')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-mono tracking-wide uppercase transition-all ${
                viewMode === 'generated_image'
                  ? 'bg-[#FFFDF7] text-[#1A1C1D] border border-[#D1CFCA] font-bold shadow-2xs'
                  : 'text-[#686D70] hover:text-[#1A1C1D]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>AI Rendered</span>
            </button>
          </div>
        </div>
      </header>

      <div className="bg-[#F4F2EB] border-b border-[#D1CFCA] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-[#787D80] uppercase tracking-wider text-[11px] font-semibold flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-[#5C8F45]" />
              <span>Select Pose:</span>
            </span>
            <div className="flex items-center space-x-1.5">
              {(['standing', 'sleeping', 'howling'] as WolfPose[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPose(p)}
                  className={`px-3 py-1 uppercase tracking-wider text-[11px] transition-all border ${
                    pose === p
                      ? 'bg-[#2C2E2F] text-[#FFFDF7] border-[#2C2E2F] font-bold'
                      : 'bg-[#FFFDF7] text-[#585D5E] border-[#D1CFCA] hover:bg-[#F4F2EB]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAnimated(!isAnimated)}
              className={`flex items-center space-x-1.5 px-3 py-1 border text-[11px] uppercase tracking-wider transition-all ${
                isAnimated
                  ? 'bg-[#5C8F45] text-[#FFFDF7] border-[#5C8F45] font-bold'
                  : 'bg-[#FFFDF7] text-[#585D5E] border-[#D1CFCA] hover:bg-[#F4F2EB]'
              }`}
            >
              {isAnimated ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isAnimated ? 'Idle Breathing: ON' : 'Idle Breathing: OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {viewMode === 'turnaround' && (
          <div className="space-y-4">
            <div className="bg-[#FFFDF7] border border-[#D1CFCA] p-3">
              <div className="grid grid-cols-4 w-full text-center divide-x divide-[#D1CFCA] text-[11px] font-mono tracking-widest text-[#585D5E] uppercase font-medium">
                <div>Cell 1: Front</div>
                <div>Cell 2: Left Side</div>
                <div>Cell 3: Back</div>
                <div>Cell 4: Isometric 30°</div>
              </div>
            </div>

            <div className="bg-[#FFFDF7] border border-[#D1CFCA] p-2 sm:p-4 overflow-hidden">
              <TurnaroundCanvas
                voxels={voxels}
                pose={pose}
                mossDensity={mossDensity}
                isAnimated={isAnimated}
                width={1600}
                height={500}
                showDividers={showDividers}
              />
            </div>

            <div className="bg-[#FFFDF7] border border-[#D1CFCA] p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center space-x-5">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDividers}
                    onChange={(e) => setShowDividers(e.target.checked)}
                    className="accent-[#5C8F45]"
                  />
                  <span className="text-[#3D4042]">Thin Grey Dividers (#D1CFCA)</span>
                </label>

                <div className="text-[#D1CFCA]">|</div>

                <div className="flex items-center space-x-2">
                  <span className="text-[#787D80]">Background:</span>
                  <div className="flex items-center space-x-1.5 border border-[#D1CFCA] px-2 py-0.5 bg-[#FFFDF7] text-[11px]">
                    <div className="w-3 h-3 bg-[#FFFDF7] border border-[#D1CFCA]" />
                    <span>#FFFDF7</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportPNG}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#2C2E2F] text-[#FFFDF7] hover:bg-[#404345] transition-colors text-xs font-mono uppercase tracking-wider font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res PNG</span>
                </button>
                <button
                  onClick={handleExportSVG}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#FFFDF7] text-[#2C2E2F] border border-[#D1CFCA] hover:bg-[#F4F2EB] transition-colors text-xs font-mono uppercase tracking-wider font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5C8F45]" />
                  <span>Export Vector SVG</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'interactive3d' && (
          <Interactive3DViewer voxels={voxels} />
        )}

        {viewMode === 'generated_image' && (
          <div className="bg-[#FFFDF7] border border-[#D1CFCA] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D1CFCA] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#5C8F45]">
                  AI Render Output ({pose.toUpperCase()} POSE)
                </span>
                <h3 className="font-serif font-medium text-lg text-[#1A1C1D]">
                  High-Resolution Turnaround Sheet — {pose.toUpperCase()} POSE
                </h3>
              </div>
              <a
                href={activeImageSrc}
                download={`stone_wolf_${pose}_ai_turnaround.jpg`}
                className="flex items-center space-x-2 px-4 py-2 bg-[#FFFDF7] text-[#2C2E2F] border border-[#D1CFCA] hover:bg-[#F4F2EB] text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Asset</span>
              </a>
            </div>

            <div className="border border-[#D1CFCA] bg-[#FFFDF7] p-2">
              <img
                src={activeImageSrc}
                alt={`Stone Wolf Voxel Model Turnaround Sheet (${pose})`}
                referrerPolicy="no-referrer"
                className="w-full h-auto block"
              />
            </div>
          </div>
        )}

        <VoxelInspector
          voxels={voxels}
          pose={pose}
          onChangePose={setPose}
          mossDensity={mossDensity}
          onChangeMossDensity={setMossDensity}
          onExportPNG={handleExportPNG}
          onExportSVG={handleExportSVG}
          onExportOBJ={handleExportOBJ}
          onExportJSON={handleExportJSON}
        />
      </main>
    </div>
  );
}
