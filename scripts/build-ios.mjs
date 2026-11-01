import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const staging = await mkdtemp(join(tmpdir(), 'mina-ios-export-'));
try {
  await cp(join(root, 'src'), join(staging, 'src'), {
    recursive: true,
    // The retired paid server route is web-only. The iOS bundle has no server/API dependency.
    filter: source => source !== resolve(root, 'src/app/api'),
  });
  await mkdir(join(staging, 'public'), { recursive: true });
  await cp(join(root, 'public/models'), join(staging, 'public/models'), { recursive: true });
  for (const name of ['package.json', 'tsconfig.json', 'tailwind.config.js', 'postcss.config.js']) {
    await cp(join(root, name), join(staging, name));
  }
  await symlink(join(root, 'node_modules'), join(staging, 'node_modules'), 'dir');
  await writeFile(join(staging, 'next.config.mjs'), 'export default { output: "export", trailingSlash: true, images: { unoptimized: true } };\n');
  const result = spawnSync(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'build'], {
    cwd: staging, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1' },
  });
  if (result.status !== 0) throw new Error(`iOS web export failed (${result.status}). Existing app assets were retained.`);
  const destination = join(root, 'dist-ios');
  await rm(destination, { recursive: true, force: true });
  await cp(join(staging, 'out'), destination, { recursive: true });
  console.log('Offline iOS assets exported to dist-ios. No .env files or server routes were copied.');
} finally {
  await rm(staging, { recursive: true, force: true });
}
