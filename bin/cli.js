#! /usr/bin/env node
var my_modules = require('..')

switch (process.argv[2]) {
  case 'install':
    var dir = process.argv[3] || 'my_modules'
    my_modules.install(dir)
    break;
  default:
    console.log('Usage: my_modules install <directory> (default is "my_modules")')
}
