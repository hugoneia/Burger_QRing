const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Buscamos la raíz real del monorrepo (dos niveles arriba de artifacts/mobile)
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Forzar a Metro a vigilar tanto la carpeta de la app como la raíz del monorrepo (node_modules global)
config.watchFolders = [projectRoot, workspaceRoot];

// 2. Hacer que el resolver busque las dependencias prioritariamente en el orden del monorrepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
