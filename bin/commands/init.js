#! /usr/bin/env node

const fs = require('fs')
const path = require('path')

const [executor, ignoredBin, ...options] = process.argv

if (!options.length) {
  let packageJSON = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))
  addEslintConfig(packageJSON)
  addPrettierConfig(packageJSON)
  writePackageJSON(packageJSON)
}

function addEslintConfig(pJSON) {
  const configPath = './node_modules/boom-scripts/eslint.js'

  if (pJSON.eslintConfig) {
    extendEslintConfig(configPath, pJSON.eslintConfig)
  } else {
    pJSON.eslintConfig = {
      extends: [configPath],
    }
  }
}

function addPrettierConfig(pJSON) {
  const configPath = './node_modules/boom-scripts/config/prettier'

  if (pJSON.prettier) {
    console.error('\nprettier config already included, skipping\n')
    return
  }

  pJSON.prettier = configPath
}

function extendEslintConfig(configPath, config) {
  // Don't add the config if it's already inlcuded
  if (config.extends && config.extends.includes(configPath)) {
  }

  config.extends = config.extends.concat(configPath)
}


function writePackageJSON(pJSON) {
  fs.writeFileSync('package.json', JSON.stringify(pJSON, null, 2), 'utf8')
}
