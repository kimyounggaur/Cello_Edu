import * as esbuild from 'esbuild';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

try {
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const assets = join(dist, 'assets');

console.info('build: preparing dist');
mkdirSync(assets, { recursive: true });

const publicDir = join(root, 'public');
if (existsSync(publicDir)) {
  console.info('build: copying public assets');
  for (const file of ['manifest.webmanifest', 'icon.svg', 'sw.js']) {
    copyFileSync(join(publicDir, file), join(dist, file));
  }
}

console.info('build: compiling Tailwind CSS');
execFileSync(
  process.execPath,
  [
    join(root, 'node_modules', 'tailwindcss', 'lib', 'cli.js'),
    '-i',
    join(root, 'src', 'styles', 'tokens.css'),
    '-o',
    join(assets, 'index.css'),
    '--minify',
  ],
  { cwd: root, stdio: 'inherit' },
);

console.info('build: bundling React app with esbuild');
await esbuild.build({
  entryPoints: [join(root, 'src', 'main.tsx')],
  bundle: true,
  outfile: join(assets, 'index.js'),
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  sourcemap: false,
  minify: true,
  loader: { '.css': 'empty' },
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
    'import.meta.env.MODE': '"production"',
  },
  logLevel: 'info',
});

console.info('build: writing index.html');
writeFileSync(
  join(dist, 'index.html'),
  `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#1b1712" />
    <meta name="description" content="첼로 운지법과 계이름을 모바일에서 보고, 듣고, 눌러 배우는 지판온 앱" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&family=Noto+Serif+KR:wght@600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/index.css" />
    <title>지판온 · 첼로 운지법 배우기</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>
`,
);

copyFileSync(join(root, 'README.md'), join(dist, 'README.md'));
console.info('Built dist/ with esbuild + Tailwind.');
} catch (error) {
  console.error('Build failed:');
  console.error(error);
  process.exitCode = 1;
}
