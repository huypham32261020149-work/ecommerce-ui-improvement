'use strict';

// Portable syntax checks for every shipped JavaScript file.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const files = ['server.js'];
for (const directory of ['lib', 'public', 'tests', 'scripts']) {
  for (const name of fs.readdirSync(path.join(root, directory))) {
    if (name.endsWith('.js')) files.push(path.join(directory, name));
  }
}
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Syntax OK: ${files.length} JavaScript files.`);
