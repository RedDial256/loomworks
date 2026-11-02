const { getDefaultConfig } = require('expo/metro-config');

const fs = require('node:fs');
const path = require('node:path');

// Expo already watches every workspace package, so edits in packages/ui hot reload.
const config = getDefaultConfig(__dirname);

// Monorepo only: the kit comes from packages/ui (the `@/*` fallback in
// tsconfig.json). Its imports resolve from this app, as they do once copied,
// so React, React Native and Unistyles stay single copies.
const ui = path.resolve(__dirname, '../../packages/ui/src');
if (fs.existsSync(ui)) {
  const entry = path.join(__dirname, 'index.ts');
  const resolve = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, name, platform) => {
    const bare = !name.startsWith('.') && !name.startsWith('@/');
    const fromUi = bare && context.originModulePath.startsWith(ui);
    const next = fromUi ? { ...context, originModulePath: entry } : context;
    return (resolve ?? context.resolveRequest)(next, name, platform);
  };
}

module.exports = config;
