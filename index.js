var assert = require('assert')
var fs = require('fs')
var path = require('path')
var sh = require('shelljs')
var tmp = require('tmp')

function isModuleDir (dir) {
  if (sh.test('-d', dir)) {
    if (sh.test('-f', path.join(dir, 'package.json'))) {
      return true
    }
  }
  return false
}

function withProperSlashes (dir) {
  return dir.split(path.sep).join('/')
}

function pseudolink (target, link_path) {
  // Extract some info from the target
  assert.ok(sh.test('-d', target), target + ' is not a directory')
  assert.ok(sh.test('-f', path.join(target, 'package.json')), 'Missing package.json in ' + target)
  var data = fs.readFileSync(path.join(target, 'package.json'), 'utf8')
  try {
    var data = JSON.parse(data)
  } catch (e) {
    assert.fail('Invalid package.json in ' + target)
  }
  assert.ok(data.name, 'Missing package name')
  assert.ok(data.version, 'Missing package version')
  // Create a pointer module
  sh.mkdir('-p', link_path)
  fs.writeFileSync(path.join(link_path, 'index.js'), "module.exports = require('" + withProperSlashes(path.resolve(target)) + "')\n")
  fs.writeFileSync(path.join(link_path, 'package.json'), '{"name": "' + data.name + '", "private": true, "version": "' + data.version + '", "pointer": true}\n')
}

function install (my_modules, options) {
  var defaults = {
    exec: 'npm'
  }
  var opts = Object.assign({}, defaults, options)
  sh.ls(my_modules).forEach(function(dir) {
    var src = path.join(my_modules, dir)
    var dest = path.join('node_modules', dir)
    if (isModuleDir(src)) {
      // Perform a LOCAL installation
      sh.mkdir('-p', path.join(my_modules, dir, 'node_modules'))
      var proc = sh.exec( opts.exec + ' install', {cwd: path.join(my_modules, dir)},
        function exec(code, stdout, stderr){
        // Now create a pointer module
        tmp.dir(function tmpdir(err, link_path, cleanup){
          pseudolink(path.join(my_modules, dir), link_path)
          // And install it.
          sh.exec(opts.exec + ' install ' + link_path)
          sh.rm(path.join(link_path, 'index.js'))
          sh.rm(path.join(link_path, 'package.json'))
          cleanup()
        })
      })
      proc.on('data', console.log)
    }
  })
}

module.exports = {
  install: install
}
