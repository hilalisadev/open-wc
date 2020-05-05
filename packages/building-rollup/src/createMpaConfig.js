/* eslint-disable no-param-reassign */
/** @typedef {import('./types').SpaOptions} SpaOptions */
/** @typedef {import('polyfills-loader').PolyfillsLoaderConfig} PolyfillsLoaderConfig */

const merge = require('deepmerge');
const html = require('@open-wc/rollup-plugin-html');
const polyfillsLoader = require('@open-wc/rollup-plugin-polyfills-loader');
const path = require('path');
const { generateSW } = require('rollup-plugin-workbox');
const { createBasicConfig } = require('./createBasicConfig');
const {
  pluginWithOptions,
  applyServiceWorkerRegistration,
  isFalsy,
  listFiles,
} = require('./utils');
const { defaultPolyfills } = require('./polyfills');

/**
 * @param {SpaOptions} options
 */
async function createMpaConfig(options) {
  const basicConfig = createBasicConfig(options);
  const userOptions = merge(
    {
      html: true,
      polyfillsLoader: true,
      workbox: true,
      injectServiceWorker: false,
    },
    options,
  );
  let outputDir = basicConfig.output.dir;

  const htmlPlugins = [];

  if (!userOptions.inputGlob) {
    throw new Error('Cannot generate multi build outputs when html plugin is disabled');
  }

  const htmlFiles = await listFiles(userOptions.inputGlob);

  for (const inputPath of htmlFiles) {
    const name = inputPath.substring(userOptions.rootPath.length + 1);
    const htmlPlugin = pluginWithOptions(html, userOptions.html, {
      minify: !userOptions.developmentMode,
      transform: [userOptions.injectServiceWorker && applyServiceWorkerRegistration].filter(
        isFalsy,
      ),
      inject: false,
      inputPath,
      name,
    });
    htmlPlugins.push(htmlPlugin);
  }

  let polyfillsLoaderConfig = {
    polyfills: {},
    minify: !userOptions.developmentMode,
  };

  // if (userOptions.legacyBuild) {
  //   if (htmlPlugins.length < 1) {
  //     throw new Error('Cannot generate multi build outputs when html plugin is disabled');
  //   }
  //   outputDir = basicConfig.output[0].dir;

  //   basicConfig.output[0].plugins.push(htmlPlugin.addOutput('module'));
  //   basicConfig.output[1].plugins.push(htmlPlugin.addOutput('nomodule'));
  //   polyfillsLoaderConfig = {
  //     modernOutput: {
  //       name: 'module',
  //       type: 'module',
  //     },
  //     legacyOutput: {
  //       name: 'nomodule',
  //       type: 'systemjs',
  //       test:
  //         // test if browser supports dynamic imports (and thus modules). import.meta.url cannot be tested
  //         "(function(){try{Function('!function(){import(_)}').call();return false;}catch(_){return true}})()",
  //     },
  //     minify: !userOptions.developmentMode,
  //     polyfills: defaultPolyfills,
  //   };
  // }

  const workboxPlugin = pluginWithOptions(
    generateSW,
    userOptions.workbox,
    {
      // Keep 'legacy-*.js' just for retro compatibility
      globIgnores: ['polyfills/*.js', 'legacy-*.js', 'nomodule-*.js'],
      navigateFallback: '/index.html',
      // where to output the generated sw
      swDest: path.join(process.cwd(), outputDir, 'sw.js'),
      // directory to match patterns against to be precached
      globDirectory: path.join(process.cwd(), outputDir),
      // cache any html js and css by default
      globPatterns: ['**/*.{html,js,css,webmanifest}'],
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: 'polyfills/*.js',
          handler: 'CacheFirst',
        },
      ],
    },
    () => {},
  );

  // if (userOptions.workbox) {
  //   if (basicConfig.output.length > 1) {
  //     const lastOutput = basicConfig.output.length - 1;
  //     basicConfig.output[lastOutput].plugins.push(workboxPlugin);
  //   } else {
  //     basicConfig.output.plugins.push(workboxPlugin);
  //   }
  // }

  return merge(basicConfig, {
    plugins: [
      // create HTML file output
      ...htmlPlugins,

      // // inject polyfills loader into HTML
      // pluginWithOptions(polyfillsLoader, userOptions.polyfillsLoader, polyfillsLoaderConfig),
    ],
  });
}

module.exports = { createMpaConfig };
