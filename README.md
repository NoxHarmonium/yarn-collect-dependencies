# yarn-collect-dependencies

## Summary

Collects dependencies for deployable artefacts in a [Yarn Workspaces](https://classic.yarnpkg.com/blog/2017/08/02/introducing-workspaces/) based monorepo

## Usage

If you install it in one of your monorepo's packages

```
$ yarn add --dev yarn-collect-dependencies
```

you can run it with yarn:

```
$ yarn collect-dependencies collect --help
```

For example if you would like to collect the dependencies for `packages/package-a` in a mono repo you could run the following:

```
$ yarn collect-dependencies collect --package-name package-a --root-dir ../../ --staging-dir dist/node_modules
```

## Why?

You might want to use this tool if you meet the following criteria:

1. You have a monorepo with Node JS based projects
2. You use Yarn Workspaces to manage your monorepo
3. You have one or more packages which depend on the build output of other packages (not source code)
4. You have packages that have to prepare a deployable bundle (e.g. a [Serverless Framework project](https://www.serverless.com/framework/docs/providers/aws/guide/quick-start/))

For example you might want this tool if you
have a monorepo that contains Serverless Framework
projects that deploy to a cloud environment
and that also import functionality from other packages in the monorepo.

If your monorepo deploys packages to NPM (e.g. [Babel's monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md)) this project is probably not useful to you.

If you import source code between packages directly you won't need this either.
This is only useful if you want to enforce package level encapsulation
and only import the build artefacts of other packages,
so that one day you might be able to break the monorepo apart.

## Examples

To demonstrate why this tool was created there is a sample project
with deployable Serverless projects.

### serverless-webpack

The following packages demonstrate packaging using [serverless-webpack](https://github.com/serverless-heaven/serverless-webpack)

| Package                                     | includeModules? | yarn-collect-dependencies? | webpack-node-externals? | Works? |
| ------------------------------------------- | --------------- | -------------------------- | ----------------------- | ------ |
| packages/serverless-webpack-exclude-modules | `false`         | No                         | No                      | Yes    |
| packages/serverless-webpack-include-modules | `true`          | No                         | Yes                     | No     |
| packages/serverless-webpack-with-ycd        | `false`         | Yes                        | Yes                     | Yes    |

#### packages/serverless-webpack-exclude-modules

This package demonstrates a configuration where `serverless-webpack`
is not involved in managing modules.

Node modules are not excluded from the Webpack bundling process
using [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals).
Instead Webpack will bundle the
modules directly into the deployable artefact.

##### Advantages

- Simple
- Reliable

##### Disadvantages

- Can be slow when the number of dependencies/deployable artefacts increase because Webpack has to process all the dependencies for a project. This multiplies if functions are packaged individually.
- Every deployable artefact contains its dependencies. If functions are packaged individually, the dependencies are duplicated across all the artefacts.
- Certain features of the AWS Lambda web console are disabled if code bundles are too big (e.g. code preview)

#### packages/serverless-webpack-include-modules

This package demonstrates a configuration where `serverless-webpack`
manages modules.

This does not currently work because the dependency bundler
in `serverless-webpack` does not currently support Yarn workspaces.

It uses `yarn` to install the dependencies to a directory
but it does not resolve the symlinks so the workspace
modules are missing in the bundle.

See:

- https://github.com/serverless-heaven/serverless-webpack/issues/438
- https://github.com/serverless-heaven/serverless-webpack/issues/494

#### packages/serverless-webpack-with-ycd

This package demonstrates a configuration where `serverless-webpack`
is not involved in managing modules.

Node modules are excluded from the Webpack bundling process
using [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals)
so Webpack does not have to process external modules.

Instead, yarn-collect-dependencies is used to put the package's
dependencies into a folder where it is packaged into a layer
that is shared between lambda functions.

##### Advantages

- Layer is only deployed when dependencies change and function bundle size is small, saving deployment time
- Modules only processed once and shared between functions

##### Disadvantages

- Need another tool in the build pipeline (yarn-collect-dependencies)
- On smaller projects it can be slower than letting Webpack process the modules

### Benchmark

Running `yarn benchmark` in the root of this repo performs
some benchmarks for building the packages outlined above.

Here are some results prepared earlier:

```
serverless-webpack-exclude-modules_combined x 0.21 ops/sec ±5.69% (5 runs sampled)
serverless-webpack-with-ycd_combined x 0.13 ops/sec ±1.11% (5 runs sampled)
serverless-webpack-with-ycd_individual x 0.10 ops/sec ±2.34% (5 runs sampled)
serverless-webpack-exclude-modules_individual x 0.05 ops/sec ±2.63% (5 runs sampled)
```

I predict the performance benefit of using yarn-collect-dependencies
will become more pronounced when the handlers
are more complex.

I've worked with real-world projects where
the performance overhead of bundling modules
with Webpack becomes a problem.

I am working on creating a more complex sample project.

## How it Works

For a given package 'deployable-package-a':

1. It uses Yarn Workspaces to determine which packages 'deployable-package-a' depends on
2. It uses Yarn to install the monorepo's dependencies into a "staging" directory
   - Yarn does not seem to be able to install a particular workspace package's dependencies into a folder with `--modules-folder`
   - It puts all the dependencies for a project into the "staging" folder with symlinks that point to each package in the mono repo
3. It deletes any symlinks that are not actually used
4. It replaces the symlinks that Yarn puts into the "staging" directory with the actual build output of the packages pointed to by the symlinks
   - This is important because we don't want to package up anything extraneous in the packages directory like source code or their modules

You can then include the "staging" directory directly into your deployment bundle as the node modules folder

## Coming Soon

Better documentation and examples
