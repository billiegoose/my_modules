fs = require('fs')
path = require('path')
exec = require('child_process').execSync
rimraf = require('rimraf')

function lsDirs (srcpath) {
  return fs.readdirSync(srcpath)
  .filter(function (file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory()
  })
}

function installDirs (my_modules) {
  var dirs = lsDirs(my_modules)
  var dir = dirs[0]
  for (var i = 0; i < dirs.length; i++) {
    dir = dirs[i]
    if (fs.existsSync(path.join(my_modules, dir, 'package.json'))) {
      exec('npm install ' + path.join(my_modules, dir), {stdio: 'inherit'})
      rimraf(path.join('node_modules', dir, '*'), function () {
        console.log(dir)
        fs.writeFileSync(path.join('node_modules', dir, 'index.js'),
          "path = require('path')" + '\n' +
          "var my_name = path.basename(__dirname)" + '\n' +
          "console.log(my_name)" + '\n' +
          "var my_location = path.resolve(__dirname, '..', '..', '" + my_modules + "', my_name)" + '\n' +
          "module.exports = require(my_location)"
        )
      })
    }
  }
}

installDirs('my_modules')
