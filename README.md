# my_modules
Keeps local modules out of node_modules, but still have working 'npm install' and 'require()'.

**Install the my_modules command with npm:**

```
$ npm install -g my_modules
```

**Use with a custom directory:**

Install npm packages from 'lib', 'local_modules', 'bower_components', etc.

```
$ cd my/nodejs/project
$ my_modules install lib
```

**Use with default 'my_modules' directory:**

```
$ cd my/nodejs/project
$ my_modules install
```

## Recommended usage

Add this module as a dependency in your `package.json` file and add a postinstall script to run the command right after `npm install`.

```
{
  "name": "your-project",
  "version": "1.0.0",
  "scripts": {
    "postinstall": "my_modules install"
  },
  "dependencies": {
    "my_modules": "^1.0.0"
  }
}
```

## Motivation

Say your project layout looks something like:
```
`-- app.js
`-- package.json
`-- lib
|   `-- main.js
|   `-- logger
|   |   `-- package.json
|   |   `-- logger.js
|   `-- router
|   |   `-- package.json
|   |   `-- router.js
|   |   `-- routes
|   `-- api
|       `-- package.json
|       `-- index.js
`-- node_modules
```

You like having your project in modules (`logger`, `router`, and `api`) because it aids in unit testing and separation of concerns, but don't like publishing every module separately as its own git repository or on npmjs.org. But you end up with a workflow like:

```
$ npm install
$ cd lib/logger
$ npm install
$ cd ../router
$ npm install
$ cd ../api
$ npm install
```

and you start to go crazy. Maybe you try moving them to the `node_modules` folder, possibly in their own @scope, and then fight with git and npm only to have it still act wonky. Maybe you try `npm link` and all the options for local require() paths from [this article](https://gist.github.com/branneman/8048520) but nothing is perfect so nothing sticks.

So you get fed up and you write this module.

## How it works

Here's the pseudocode:

```
for path in 'my_modules'
  if path is directory && path contains 'package.json'
    # Install the module and its dependencies into node_modules
    exec npm install my_modules/path
    # This leaves a copy of the module in node_modules that we don't want
    rm -rf node_modules/path/*
    # In its place install a shim module that loads the real module
    echo "module.exports = require('../../my_modules/path')" > node_modules/path/index.js
  end
end
```

## Status

Under development! Contributions welcome.

## Changelog

2.0.0 - Bumped major version because my_modules will now force npm to install packages locally inside each package (my_modules/*/node_modules) instead of letting npm3 do its flattened top-level install. This was necessary to allow running multiple "npm install"s in parallel without race conditions. Switching to parallel execution cut the install time for my project from 22m to 8m so it was definitely worth it.
