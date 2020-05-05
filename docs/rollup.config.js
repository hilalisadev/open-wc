import path from 'path';
import { createMpaConfig } from '@open-wc/building-rollup';
import copy from 'rollup-plugin-copy';

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

  const dest = '_site/';
  mpaConfig.plugins.push(
    copy({
      targets: [
        { src: '_site-dev/styles.css', dest },
        { src: '_site-dev/demoing/demo/custom-elements.json', dest },
        { src: '_site-dev/manifest.json', dest },
        { src: '_site-dev/**/*.{png,gif}', dest },
      ],
      flatten: false,
    }),
  );

  return mpaConfig;
};
