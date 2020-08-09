import cliFactory from "cac";
import packageJson from "../package.json";
import {
  getWorkspaceDependencies,
  getWorkspaceInfo,
  installDependencies,
  reifyDependencies,
} from "./dependency-wrangling";

export const collectDependenciesForPackage = (
  packageName: string,
  rootDir: string,
  stagingPath: string
): void => {
  const workspaceInfo = getWorkspaceInfo(rootDir);
  const root = workspaceInfo[packageName];
  console.info(
    `Root package is [${packageName}]. Determining workspace dependencies...`
  );
  const dependencies = getWorkspaceDependencies(workspaceInfo, packageName);
  console.info(`Dependencies to be collected are: [${dependencies}]`);
  console.info(`Installing dependencies to staging area: [${stagingPath}]`);
  installDependencies(rootDir, root.location, stagingPath);
  console.info(`Reifying symlinks for dependencies...`);
  reifyDependencies(rootDir, stagingPath, workspaceInfo, dependencies);
};

const cli = cliFactory(packageJson.name);

cli
  .command(
    "collect",
    "collects dependencies for a package and puts them in a staging folder",
    { allowUnknownOptions: false, ignoreOptionDefaultValue: true }
  )
  .option(
    "--package-name ",
    "the name of the workspace package to collect dependencies for",
    {}
  )
  .option(
    "--root-dir <root directory>",
    "path to the root of your workspace (where the root package.json is)"
  )
  .option(
    "--staging-dir <staging directory>",
    "path to a folder where the collected dependencies will be placed"
  )
  .example(
    (name) =>
      `${name} collect --package-name my-package --root-dir . --staging-dir ./packages/my-package/.deps`
  )
  .action(({ packageName, rootDir, stagingDir }) => {
    collectDependenciesForPackage(packageName, rootDir, stagingDir);
  });

cli.version(packageJson.version);

cli.help();

cli.parse();
