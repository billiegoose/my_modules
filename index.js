fs = require('fs')
path = require('path')
sh = require('shelljs')

function isModuleDir (dir) {
  if (sh.test('-d', dir)) {
    if (sh.test('-f', path.join(dir, 'package.json'))) {
      return true
    }
  }
  return false
}

function install (my_modules) {
  var cwd = sh.pwd()
  sh.ls(my_modules).forEach(function(dir) {
    console.log(sh.pwd())
    var src = path.join(my_modules, dir)
    var dest = path.join('node_modules', dir)
    console.log(src)
    console.log(dest)
    if (isModuleDir(src)) {
      // Perform a LOCAL installation
      sh.cd(src)
      sh.mkdir('-p', 'node_modules')
      sh.exec('npm install')
      sh.cd(cwd)
      // Now "install" a link to the local installation.
      sh.cd(cwd)
      var tmp = '.my_modules.tmp'
      sh.mkdir('-p', tmp)
      fs.writeFileSync(path.join(tmp, 'index.js'), "module.exports = require('" + path.resolve(src).split(path.sep).join('/') + "')\n")
      fs.writeFileSync(path.join(tmp, 'package.json'), '{"name": "' + dir + '", "private": true, "version": "0.0.1"}\n')
      sh.exec('npm install ' + tmp)
      sh.cd(cwd)
      sh.rm('-rf', tmp)
    }
  })
}

module.exports = {
  install: install
}
