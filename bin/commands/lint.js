#! /usr/bin/env node

const { spawnSync } = require('child_process')

const args = ['.']

const lintResult = spawnSync('./node_modules/.bin/eslint', args, {stdio: 'inherit'})

if (lintResult.signal) {
  console.error('Lint script interrupted by signal, exiting\n')
  process.exit(1)
} else {
  process.exit(0)
}
