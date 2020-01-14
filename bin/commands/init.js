#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const scriptPackageJSON = require('../../package.json')

const [executor, ignoredBin, ...options] = process.argv

checkAndInstallPeerDeps(scriptPackageJSON.peerDependencies)

let packageJSON = getPackageJSON()

addEslintConfig(packageJSON)
addPrettierConfig(packageJSON)
addNpmScripts(packageJSON)
writePackageJSON(packageJSON)

function addNpmScripts(pJSON) {
  let currentScripts = pJSON.scripts

  const scriptsToAdd = {
    format: 'boom-scripts format',
    lint: 'boom-scripts lint',
  }

  pJSON.scripts = Object.assign(currentScripts, scriptsToAdd)
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
    console.error('prettier config already included, skipping')
    return
  }

  pJSON.prettier = configPath
}

function extendEslintConfig(configPath, config) {
  // Don't add the config if it's already inlcuded
  if (config.extends && config.extends.includes(configPath)) {
    console.error('eslint config already included, skipping')
    return
  }

  config.extends = config.extends.concat(configPath)
}

function writePackageJSON(pJSON) {
  fs.writeFileSync('package.json', JSON.stringify(pJSON, null, 2), 'utf8')
}

function checkAndInstallPeerDeps(peerDeps = {}) {
  let pJSON = getPackageJSON()

  if (!pJSON.devDependencies) {
    pJSON.devDependencies = {}
  }

  const depKeys = Object.keys(peerDeps)
  const missingDeps = depKeys.filter(d => !pJSON.devDependencies[d])

  if (missingDeps.length) {
    const message = `
You are missing peer dependencies that boom-scripts requires:
${missingDeps.join('\n')}

Installing required peer dependencies
`
    console.error(message)

    const installResult = spawnSync('npm', ['install', '--save-dev', ...missingDeps], {
      cwd: process.cwd(),
      stdio: 'inherit',
    })

    if (installResult.signal) {
      console.error('This process was interrupted by a signal, exiting early')
      process.exit(1)
    }
  }
}

function getPackageJSON() {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))
}
