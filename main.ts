// DanaRumah — make.fun entry program (Node 22, standard library only).
// Copies app/ and screenshots/ from this repository into the output directory
// and writes /output/dossier.json with buildDossier from the kit's
// vendor/makefun-frontend.ts. Output is deterministic: same files in, same
// bytes out, on every run.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function copyTree(name: string): void {
  const src = join(repoRoot, name);
  const dst = join(outDir, name);
  if (!existsSync(src)) throw new Error('missing directory in repository: ' + name);
  cpSync(src, dst, { recursive: true });
}

function countFiles(dir: string): number {
  let n = 0;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    n += statSync(p).isDirectory() ? countFiles(p) : 1;
  }
  return n;
}

// Start from a clean output directory so stale files can never leak in.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

copyTree('app');
copyTree('screenshots');

// The gate requires app/index.html to exist; fail loudly here, not in the grader.
if (!existsSync(join(outDir, 'app', 'index.html'))) {
  throw new Error('app/index.html missing after copy');
}
console.log('copied app/ (' + countFiles(join(outDir, 'app')) + ' files) and screenshots/ (' +
  countFiles(join(outDir, 'screenshots')) + ' files)');

const dossier = buildDossier(outDir, caps);
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('wrote ' + outDir + '/dossier.json (' + dossier.length + ' bytes)');
