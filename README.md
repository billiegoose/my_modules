## DEPRECATED

**I have ceased work on this project (and will hand over the project name if you ask nicely).**

# Recommended Alternative

In the original motivation for this module, I put forth this scenario:

> Say your project layout looks something like:
> ```
> cool_project
> `-- app.js
> `-- package.json
> `-- lib
> |   `-- main.js
> |   `-- logger
> |   |   `-- logger.js
> |   |   `-- package.json
> |   `-- router
> |   |   `-- routes
> |   |   `-- router.js
> |   |   `-- package.json
> |   `-- api
> |       `-- index.js
> |       `-- package.json
> `-- node_modules
> ```
>
> You like having your project in modules (`logger`, `router`, and `api`) because it aids in unit testing and separation of concerns, but don't like publishing every module separately as its own git repository or on npmjs.org. But you end up with a workflow like:
>
> ```
> $ npm install
> $ cd lib/logger
> $ npm install
> $ cd ../router
> $ npm install
> $ cd ../api
> $ npm install
> ```
>
> and you start to go crazy. Maybe you try moving them to the `node_modules` folder, possibly in their own @scope, and then fight with git and npm only to have it still act wonky. Maybe you try `npm link` and all the options for local require() paths from [this article](https://gist.github.com/branneman/8048520) but nothing is perfect so nothing sticks.

I have found a reasonable-ish solution to the craziness: *Put your package.json in the parent folder
of your app code.* Put your custom modules in `cool_project/app/node_modules` and
install your regular npm dependencies in `cool_project/node_modules` beside `app`.
When node's `require` does not find the module in the current node_modules folder,
it continues checking in each folder up to the root folder until it finds a module with the
right name. (This is probably a bad design decision, because it makes modules indirectly
depend on every folder above them as well as below them, but that is not a useful discussion to have
at this point. This is how `require()` works and we're stuck with it now.)

Restructured project layout:

```
cool_project
`-- package.json (all dependencies)
`-- app
|   `-- app.js
|   `-- node_modules
|       |`-- logger
|       |   `-- logger.js
|       |   `-- package.json (main, scripts, etc, but not dependencies)
|       `-- router
|       |   `-- routes
|       |   `-- router.js
|       |   `-- package.json (main, scripts, etc, but not dependencies)
|       `-- api
|           `-- index.js
|           `-- package.json (main, scripts, etc, but not dependencies)
`-- node_modules
```

Bear with me and I'll walk you through how this works.

#### Resolving npm modules from main code
Let us say cool_project/app/app.js contains `require('express')`. Resolving will go like this:

- Does cool_project/app/**node_modules** exist?
  - Yes! Does cool_project/app/node_modules/**express** exist?
    - No, go up one directory.
  - Does cool_project/**node_modules** exist?
    - Yes! Does cool_project/node_modules/**express** exist?
      - Yes! Return module.

#### Resolving custom modules from main code
Suppose cool_project/app/app.js contains `require('logger')`.

- Does cool_project/app/**node_modules** exist?
  - Yes! Does cool_project/app/node_modules/**logger** exist?
    - Yes! Return module.

#### Resolving custom modules from custom modules
Let's say that router.js runs `require('logger')`.

- Does cool_project/app/node_modules/router/**node_modules** exist?
  - No, go up one directory.
- Does cool_project/app/node_modules/**node_modules** exist?
  - No, go up one directory.
- Does cool_project/app/**node_modules** exist?
  - Yes! Does app/node_modules/**logger** exist?
    - Yes! Return module.

#### Resolving npm modules from custom modules.
Say logger.js does a `require('chalk')`.

- Does cool_project/app/node_modules/logger/**node_modules** exist?
  - No, go up one directory.
- Does cool_project/app/node_modules/**node_modules** exist?
  - No, go up one directory.
- Does cool_project/app/**node_modules** exist?
  - Yes! Does app/node_modules/**chalk** exist?
    - No, go up one directory.
  - Does cool_project/**node_modules** exist?
    - Yes! Does cool_project/node_modules/**chalk** exist?
      - Yes! Return module.

## Pros and Cons

Pros:

- No extra hacking needed besides the directory structure.
- Only one `npm install` command needed. No recursive installs.
- Is not disrupted by npm3 node_modules flattening.

Cons:

- Custom modules all live in one flat directory.
- All module dependencies are saved together, which can lead to version coupling between custom modules.
- Any "dependencies" listed in a custom module's package.json are a lie.
- That directory is named `node_modules` so you probably have to explicitly un-ignore it in source control.

The cons are not that bad IMHO. If your modules were TRULY uncoupled, you'd be publishing them as such. This strategy
is quick and works though, so you can gradually move code into modules for organization first, then work on
truly decoupling them (and giving them separate git repos and publishing them independently) later.

## Status

Unmaintained and deprecated. If you would like the "my_modules" package name I'm happy to hand it over.

## Changelog

2.0.1 - Deprecated

2.0.0 - Bumped major version because my_modules will now force npm to install packages locally inside each package (my_modules/*/node_modules) instead of letting npm3 do its flattened top-level install. This was necessary to allow running multiple "npm install"s in parallel without race conditions. Switching to parallel execution cut the install time for my project from 22m to 8m so it was definitely worth it.
