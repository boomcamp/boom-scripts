#! /usr/bin/env node

const path = require('path')
const fs = require('fs')
const { spawnSync }= require('child_process')

const [ executor, ignoredBin, command ] = process.argv

if (command) {
  spawnScript()
} else {
  printAvailableCommands()
  process.exit(1)
}

function spawnScript() {
  const args = process.argv.slice(2)
  const commandIndex = args.findIndex(
    command =>
      command === 'init'
  )

  const buildCommand = commandIndex === -1 ? null : args[commandIndex]
  const commandArgs = buildCommand ? args.slice(commandIndex + 1) : []

  if (!buildCommand) {
    console.error(`\nUnknown command: ${command}`)
    printAvailableCommands()
    process.exit(1)
  }

  const commandPath = path.join(__dirname, './commands', buildCommand)

  const spawnProc= spawnSync(
    executor,
    [commandPath].concat(commandArgs),
    {
      stdio: 'inherit'
    }
  )

  if (spawnProc.signal) {
    console.error('This process was interrupted by a signal, exiting early')
    process.exit(1)
  } else {
    process.exit(spawnProc.status)
  }
}

function printAvailableCommands() {
  const scriptsPath = path.join(__dirname, 'commands/')
  const availableCommands = fs.readdirSync(scriptsPath)
    .map(script => path.parse(script).name)
    .join('\n')
    .trim()

  const fullMessage = `
  Usage: ${ignoredBin} [command] [--flags]

  Available Commands:
    ${availableCommands}

  Options:
    All options depend on the command. But args you pass will be forwarded to the respective command.
  `.trim()
  console.error(`\n${fullMessage}\n`)
}
