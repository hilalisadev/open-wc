import fs from 'fs';
import path from 'path';
import { createMpaConfig } from '@open-wc/building-rollup';

export default async () => {
  const mpaConfig = await createMpaConfig({
    outputDir: '_site',

    inputGlob: '_site-dev/**/*.html',

    rootPath: path.resolve('_site-dev'),

    // development mode creates a non-minified build for debugging or development
    developmentMode: false, // process.env.ROLLUP_WATCH === 'true',

    // set to true to inject the service worker registration into your index.html
    injectServiceWorker: false,
  });

  mpaConfig.plugins.push({
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'styles.css',
        source: fs.readFileSync(path.join(__dirname, './styles.css')),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'logo.png',
        source: fs.readFileSync(path.join(__dirname, './logo.png')),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'hero.png',
        source: fs.readFileSync(path.join(__dirname, './hero.png')),
      });
      // this.emitFile({
      //   type: 'asset',
      //   fileName: 'manifest.json',
      //   source: fs.readFileSync(path.join(__dirname, './manifest.json')),
      // });
    },
  });
  return mpaConfig;
};
