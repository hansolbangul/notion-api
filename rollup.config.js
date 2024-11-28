import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: './dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [typescript()],
  },
  {
    input: './script/type-cli.ts',
    output: [
      {
        file: './dist/type-cli.cjs',
        format: 'cjs',
        sourcemap: true,
        banner: '#!/usr/bin/env node',
      },
    ],
    plugins: [typescript()],
  },
];
