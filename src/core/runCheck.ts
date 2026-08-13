import fs from 'fs';
import path from 'path';
import { runSelfCheck } from './selfCheck';

function main() {
  const modelPath = path.join(process.cwd(), 'src', 'assets', 'models', 'stone-wolf.json');
  let modelData: unknown;
  if (fs.existsSync(modelPath)) {
    modelData = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
  }

  const results = runSelfCheck(modelData);
  let failed = false;

  console.log('--- Running Core Self Checks ---');
  for (const res of results) {
    const status = res.ok ? '[OK]' : '[FAIL]';
    console.log(`${status} ${res.name}${res.detail ? ` (${res.detail})` : ''}`);
    if (!res.ok) {
      failed = true;
    }
  }

  if (failed) {
    console.error('\nOne or more self-checks failed!');
    process.exit(1);
  } else {
    console.log('\nAll self-checks passed successfully.');
    process.exit(0);
  }
}

main();
