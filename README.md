# yarn-collect-dependencies

## Summary

Collects dependencies for deployable artefacts in a Yarn workspaces based monorepo

## Usage

If you install it in one of your monorepo's packages

```
$ yarn add --dev yarn-collect-dependencies
```

you can run it with yarn:

```
$ yarn yarn-collect-dependencies collect --help
```

## Description

You might want to use this tool if you meet the following criteria:

1. You have a monorepo with Node JS based projects
2. You use Yarn workspaces to manage your monorepo
3. You have one or more packages which depend on other packages
4. You have packages that have to prepare a deployable bundle

For example you might want this tool if you
have a monorepo that contains Serverless Framework
projects that deploy to AWS and that also import
functionality from shared packages.

```
monorepo
|
|-- shared-package-a
|-- shared-package-b
|-- serverless-project-a
|-- serverless-project-b
```

## How it Works

For a given package that you wish to deploy:

1. It uses Yarn workspaces to determine which packages it depends on
2. It uses Yarn to install the monorepo's dependencies into a "staging" directory
3. It replaces the symlinks that Yarn uses with the actual output of each package
4. It deletes any symlinks that are not actually used
5. You can then include the "staging" directory directly into your deployment bundle

## Sample Project

There is a sample project under the `sample-project` directory that demonstrates the basic structure of a monorepo that might need this tool.

## Coming Soon

Better documentation and examples
