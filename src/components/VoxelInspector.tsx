import React, { useState } from 'react';
import { Voxel, MossDensity, WolfPose } from '../types';
import { faceColor, paper } from '../core/palette';
import { Download, Copy, Check, Info, Sparkles, Layers, Sliders, Activity } from 'lucide-react';

interface VoxelInspectorProps {
  voxels: Voxel[];
  pose: WolfPose;
  onChangePose: (pose: WolfPose) => void;
  mossDensity: MossDensity;
  onChangeMossDensity: (density: MossDensity) => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onExportOBJ: () => void;
  onExportJSON: () => void;
}

export const VoxelInspector: React.FC<VoxelInspectorProps> = ({
  voxels,
  pose,
  onChangePose,
  mossDensity,
  onChangeMossDensity,
  onExportPNG,
  onExportSVG,
  onExportOBJ,
  onExportJSON,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const rockCount = voxels.filter((v) => v.type === 'rock').length;
  const mossCount = voxels.filter((v) => v.type === 'moss').length;
  const totalCount = voxels.length;

  const colorPalette = [
    { name: 'Rock Grey Base (Front)', hex: faceColor('rock', 'front'), desc: 'Front face rock surface' },
    { name: 'Rock Top Highlight', hex: faceColor('rock', 'top'), desc: 'Top face rock surface' },
    { name: 'Rock Side Shadow', hex: faceColor('rock', 'side'), desc: 'Side face dark shade' },
    { name: 'Moss Green Base', hex: faceColor('moss', 'front'), desc: 'Living moss in seams' },
    { name: 'Warm Background', hex: paper, desc: 'Plain off-white background' },
  ];

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Model Stats, Pose & Moss Controls */}
      <div className="bg-[#FFFDF7] border border-[#D1CFCA] p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#D1CFCA] pb-3">
          <Info className="w-4 h-4 text-[#2C2E2F]" />
          <h3 className="font-serif font-medium text-base text-[#1A1C1D]">Model Specifications</h3>
        </div>

        {/* Pose Selection */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-3.5 h-3.5 text-[#2C2E2F]" />
            <label className="text-xs font-mono uppercase tracking-wider text-[#3D4042] font-semibold">
              Model Pose
            </label>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['standing', 'sleeping', 'howling'] as WolfPose[]).map((p) => (
              <button
                key={p}
                onClick={() => onChangePose(p)}
                className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider transition-colors border text-center ${
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

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#F4F2EB] border border-[#D1CFCA] p-2.5">
            <span className="block font-serif text-xl font-bold text-[#1A1C1D]">{totalCount}</span>
            <span className="text-[9px] font-mono text-[#787D80] uppercase tracking-wider">Total Cubes</span>
          </div>
          <div className="bg-[#F4F2EB] border border-[#D1CFCA] p-2.5">
            <span className="block font-serif text-xl font-bold text-[#585D5E]">{rockCount}</span>
            <span className="text-[9px] font-mono text-[#787D80] uppercase tracking-wider">Rock Cubes</span>
          </div>
          <div className="bg-[#F4F2EB] border border-[#D1CFCA] p-2.5">
            <span className="block font-serif text-xl font-bold text-[#5C8F45]">{mossCount}</span>
            <span className="text-[9px] font-mono text-[#5C8F45] uppercase tracking-wider">Moss Cubes</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#D1CFCA]">
          <div className="flex items-center space-x-2 mb-2">
            <Sliders className="w-3.5 h-3.5 text-[#2C2E2F]" />
            <label className="text-xs font-mono uppercase tracking-wider text-[#3D4042] font-semibold">
              Moss Seam Density
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['none', 'seams', 'medium', 'lush'] as MossDensity[]).map((d) => (
              <button
                key={d}
                onClick={() => onChangeMossDensity(d)}
                className={`py-2 px-3 text-xs font-mono uppercase tracking-wider transition-colors border ${
                  mossDensity === d
                    ? 'bg-[#5C8F45] text-[#FFFDF7] border-[#5C8F45] font-bold'
                    : 'bg-[#FFFDF7] text-[#585D5E] border-[#D1CFCA] hover:bg-[#F4F2EB]'
                }`}
              >
                {d === 'none' ? 'Clean' : d === 'seams' ? 'In Seams' : d}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* 2. Color Palette */}
      <div className="bg-[#FFFDF7] border border-[#D1CFCA] p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#D1CFCA] pb-3">
          <Sparkles className="w-4 h-4 text-[#2C2E2F]" />
          <h3 className="font-serif font-medium text-base text-[#1A1C1D]">Specification Palette</h3>
        </div>

        <div className="space-y-2">
          {colorPalette.map((color) => (
            <div
              key={color.hex}
              className="flex items-center justify-between bg-[#F4F2EB] border border-[#D1CFCA] p-2.5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 border border-[#1A1C1D]/20 shadow-2xs"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <div className="text-xs font-medium text-[#1A1C1D]">{color.name}</div>
                  <div className="text-[10px] font-mono text-[#787D80]">{color.desc}</div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(color.hex)}
                className="flex items-center space-x-1 text-[11px] font-mono text-[#3D4042] hover:text-[#1A1C1D] bg-[#FFFDF7] border border-[#D1CFCA] px-2 py-1 transition-colors"
                title="Copy Hex Code"
              >
                {copiedHex === color.hex ? (
                  <>
                    <Check className="w-3 h-3 text-[#5C8F45]" />
                    <span className="text-[#5C8F45]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{color.hex}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Export Assets */}
      <div className="bg-[#FFFDF7] border border-[#D1CFCA] p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#D1CFCA] pb-3">
          <Download className="w-4 h-4 text-[#2C2E2F]" />
          <h3 className="font-serif font-medium text-base text-[#1A1C1D]">Export Technical Assets</h3>
        </div>

        <div className="space-y-2">
          <button
            onClick={onExportPNG}
            className="w-full flex items-center justify-between bg-[#FFFDF7] border border-[#D1CFCA] hover:bg-[#F4F2EB] p-3 text-left transition-colors group"
          >
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1C1D]">
                Turnaround Sheet (PNG)
              </div>
              <div className="text-[11px] text-[#787D80]">4-View cell layout @ 1600x500</div>
            </div>
            <Download className="w-4 h-4 text-[#585D5E] group-hover:text-[#1A1C1D]" />
          </button>

          <button
            onClick={onExportSVG}
            className="w-full flex items-center justify-between bg-[#FFFDF7] border border-[#D1CFCA] hover:bg-[#F4F2EB] p-3 text-left transition-colors group"
          >
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1C1D]">
                Vector Sheet (SVG)
              </div>
              <div className="text-[11px] text-[#787D80]">Scalable vector format with crisp paths</div>
            </div>
            <Download className="w-4 h-4 text-[#585D5E] group-hover:text-[#1A1C1D]" />
          </button>

          <button
            onClick={onExportOBJ}
            className="w-full flex items-center justify-between bg-[#FFFDF7] border border-[#D1CFCA] hover:bg-[#F4F2EB] p-3 text-left transition-colors group"
          >
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1C1D]">
                3D Mesh File (.OBJ)
              </div>
              <div className="text-[11px] text-[#787D80]">Blender, Unity, or Unreal mesh</div>
            </div>
            <Layers className="w-4 h-4 text-[#585D5E] group-hover:text-[#1A1C1D]" />
          </button>

          <button
            onClick={onExportJSON}
            className="w-full flex items-center justify-between bg-[#FFFDF7] border border-[#D1CFCA] hover:bg-[#F4F2EB] p-3 text-left transition-colors group"
          >
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1C1D]">
                Voxel Matrix (.JSON)
              </div>
              <div className="text-[11px] text-[#787D80]">3D coordinate list for voxel engines</div>
            </div>
            <Download className="w-4 h-4 text-[#585D5E] group-hover:text-[#1A1C1D]" />
          </button>
        </div>
      </div>
    </div>
  );
};
