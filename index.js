fs = require('fs')
path = require('path')
sh = require('shelljs')

function install (my_modules) {
  sh.ls(my_modules).forEach(function(dir) {
    var src = path.join(my_modules, dir)
    if (sh.test('-d', src)) {
      if (sh.test('-f', path.join(src, 'package.json'))) {
        var dest = path.join('node_modules', dir)
        sh.exec('npm install ' + src)
        sh.rm('-rf', dest)
        sh.mkdir('-p', dest)
        fs.writeFileSync(path.join(dest, 'index.js'), "module.exports = require('" + path.relative(dest, src).split(path.sep).join('/') + "')\n")
        fs.writeFileSync(path.join(dest, 'package.json'), '{"name": "' + dir + '", "private": true}\n')
      }
    }
  })
}

module.exports = {
  install: install
}
