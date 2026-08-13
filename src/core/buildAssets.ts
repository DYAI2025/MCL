import fs from 'fs';
import path from 'path';
import { validateModel, loadModel, modelToVoxels } from './model';
import { projectModel, IsoVoxel } from './iso';
import { facesToSVG } from './svg';
import { contentHash } from './hash';
import { paper } from './palette';

function main() {
  const modelsDir = path.join(process.cwd(), 'src', 'assets', 'models');
  const outputDir = path.join(process.cwd(), 'public', 'assets');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (!fs.existsSync(modelsDir)) {
    console.error(`Models directory not found: ${modelsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.json'));
  const indexEntries: Array<{
    id: string;
    name: string;
    category: string;
    truthStatus: string;
    hash: string;
    image512: string;
    image128: string;
    materials: string[];
    voxelCount: number;
  }> = [];

  for (const file of files) {
    const filePath = path.join(modelsDir, file);
    const jsonStr = fs.readFileSync(filePath, 'utf-8');

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (err) {
      console.error(`JSON parse error in file ${file}: ${(err as Error).message}`);
      process.exit(1);
    }

    const val = validateModel(parsed);
    if (!val.valid) {
      console.error(`Validation failed for file ${file}:\n- ${val.errors.join('\n- ')}`);
      process.exit(1);
    }

    const model = loadModel(parsed);
    const hash = contentHash(jsonStr);
    const voxels = modelToVoxels(model);

    const isoVoxels: IsoVoxel[] = voxels.map((v) => ({
      x: v.x,
      y: v.y,
      z: v.z,
      material: v.type,
    }));

    const faces512 = projectModel(isoVoxels, 512, 512);
    const svg512 = facesToSVG(faces512, 512, 512, paper);

    const faces128 = projectModel(isoVoxels, 128, 128);
    const svg128 = facesToSVG(faces128, 128, 128, paper);

    const fileName512 = `${model.id}-${hash}-512.svg`;
    const fileName128 = `${model.id}-${hash}-128.svg`;

    fs.writeFileSync(path.join(outputDir, fileName512), svg512, 'utf-8');
    fs.writeFileSync(path.join(outputDir, fileName128), svg128, 'utf-8');

    const materialsUsed = Array.from(new Set(voxels.map((v) => v.type)));

    indexEntries.push({
      id: model.id,
      name: model.name,
      category: model.category,
      truthStatus: model.truthStatus,
      hash,
      image512: `/assets/${fileName512}`,
      image128: `/assets/${fileName128}`,
      materials: materialsUsed,
      voxelCount: voxels.length,
    });
  }

  const indexPath = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexEntries, null, 2), 'utf-8');
  console.log(`Assets built successfully: ${indexEntries.length} model(s) processed.`);
}

main();
