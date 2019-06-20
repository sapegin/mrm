const path = require('path')
const fs = require('fs')
const globalDirs = require('global-dirs')

// TODO: support yarn
// console.log('globalDirs:', globalDirs)

const globalPackagesPath = globalDirs.npm.packages

function isModule (name) {
  return fs.existsSync(path.join(globalPackagesPath, name, 'package.json'))
}

function requireGlobal (moduleName) {
  return require(path.join(globalPackagesPath, moduleName))
}

function getModules () {
  const packs = fs.readdirSync(globalPackagesPath)
  const modules = []
  packs.forEach(pack => {
    if (pack[0] === '@') {
      const privatePacks = fs.readdirSync(path.join(globalPackagesPath, pack))
      privatePacks.forEach(privatePack => {
        const name = `${pack}/${privatePack}`
        if (isModule(name)) {
          modules.push(name)
        }
      })
    } else if (isModule(pack)) {
      modules.push(pack)
    }
  })

  return modules
}

Object.defineProperty(
  requireGlobal,
  'modules',
  { get: getModules }
)

module.exports = requireGlobal
