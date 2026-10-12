export { init, type InitOptions, type InitResult } from './commands/init';
export {
  CONFIG_FILE,
  configSchema,
  type LoomConfig,
  readConfig,
} from './project/config';
export {
  type Conflict,
  type ConflictChoice,
  ConflictError,
  type ConflictOptions,
  type WriteReport,
} from './project/files';
export { type RunCommand } from './project/packages';
export { embedRegistry } from './registry/embed';
export {
  type Manifest,
  manifestFiles,
  type ManifestItem,
  manifestSchema,
  parseManifest,
} from './registry/schema';
export {
  createEmbeddedSource,
  createFsSource,
  type RegistrySource,
} from './registry/source';
export { LOOM_VERSION } from './version';
