import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';
import pkg from 'next/dist/compiled/webpack/webpack.js';

const require = createRequire(import.meta.url);
const { webpack } = pkg;

const ASSETS_PREFIX = 'public/';

export function withEsbuildConfig(nextConfig) {
  return {
    ...nextConfig,
    webpack: (config, context) => {
      // Add wasm-loader for WebAssembly files for @vraksha/esbuild-browser
      config.module.rules.push({
        test: /\.wasm$/,
        use: 'wasm-loader',
      });

      // Copy service worker and worker files from @vraksha/esbuild-browser to public directory
      if (!config.isServer) {
        const { version: esbuildBrowserVersion } = JSON.parse(
          fs.readFileSync(
            require.resolve('@vraksha/esbuild-browser/package.json'),
            'utf-8'
          )
        );

        // Copy service worker
        const esbuildServiceWorkerPath = require.resolve(
          '@vraksha/esbuild-browser/service-worker'
        );
        const swTargetPath = path.join(ASSETS_PREFIX, 'service-worker.js');

        fs.rmSync(swTargetPath, { force: true });
        fs.cpSync(esbuildServiceWorkerPath, swTargetPath, { recursive: true });

        // Copy worker
        const esbuildWorker = path.dirname(
          require.resolve('@vraksha/esbuild-browser/worker')
        );
        const targetDir = path.join(
          process.cwd(),
          `${ASSETS_PREFIX}/esbuild-browser/${esbuildBrowserVersion}/`
        );
        fs.rmSync(targetDir, { recursive: true, force: true });
        fs.mkdirSync(targetDir, { recursive: true });
        const files = fs.readdirSync(esbuildWorker);
        for (const file of files) {
          const src = path.join(esbuildWorker, file);
          const dest = path.join(targetDir, file);
          if (src.endsWith('.js')) {
            fs.cpSync(src, dest, { recursive: true });
          }
        }

        config.plugins.push(
          new webpack.DefinePlugin({
            'process.env.ESBUILD_BROWSER_VERSION': JSON.stringify(
              esbuildBrowserVersion
            ),
          })
        );
      }

      return nextConfig.webpack?.(config, context) ?? config;
    },
  };
}
