require('esbuild').buildSync({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: ['zod', '@remix-run/server-runtime'],
  outfile: 'dist/index.js',
  platform: 'node',
  target: ['node16'],
});
