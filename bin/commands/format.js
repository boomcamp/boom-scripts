#! /usr/bin/env node

const { spawnSync } = require('child_process')

const filesToFormat = ['**/*.+(js|json|less|css|ts|tsx|md)']
const args = [
  ...['--write'],
  ...['--ignore-path', './node_modules/boom-scripts/config/prettier/prettierignore'],
  ...['--config', './node_modules/boom-scripts/config/prettier/index.js'],
  ...filesToFormat,
]

const formatResult = spawnSync('./node_modules/.bin/prettier', args, { stdio: 'inherit' })

if (formatResult.signal) {
  console.error('Format script interrupted by signal, exiting\n')
  process.exit(1)
} else {
  process.exit(0)
}
