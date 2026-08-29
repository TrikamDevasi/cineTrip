// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable require.context for Expo Router automatic route resolution
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

const path = require('path');

// Prioritize 'react-native' condition and map zustand modules to CJS for web compatibility
config.resolver = {
  ...config.resolver,
  unstable_conditionsByPlatform: {
    ...config.resolver.unstable_conditionsByPlatform,
    web: ['react-native', 'browser'],
  },
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web' && moduleName.startsWith('zustand')) {
      const subpath = moduleName === 'zustand' ? 'index.js' : moduleName.replace(/^zustand\//, '') + '.js';
      const targetPath = path.resolve(__dirname, 'node_modules/zustand', subpath);
      try {
        if (require('fs').existsSync(targetPath)) {
          return {
            filePath: targetPath,
            type: 'sourceFile',
          };
        }
      } catch {}
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
