import cliFactory from "cac";
import packageJson from "../package.json";
import { getDependencyList } from "./externals";
import { collectDependenciesForPackage } from ".";

const cli = cliFactory(packageJson.name);

cli.version(packageJson.version);

cli
  .command(
    "collect",
    "collects dependencies for a package and puts them in a staging folder",
    { allowUnknownOptions: false }
  )
  .option(
    "--package-name ",
    "overrides the name of the workspace package to collect dependencies for (defaults to current directory)"
  )
  .option(
    "--root-dir <root directory>",
    "overrides the path to the root of your workspace where the root package.json is (auto detected by default)"
  )
  .option(
    "--staging-dir <staging directory>",
    "path to a folder where the collected dependencies will be placed",
    { default: "./deps" }
  )
  .example(
    (name) =>
      `${name} collect --package-name my-package --root-dir . --staging-dir ./packages/my-package/.deps`
  )
  .action(({ packageName, rootDir, stagingDir }) => {
    collectDependenciesForPackage(packageName, rootDir, stagingDir);
  });

cli
  .command("list", "list dependencies for a monorepo", {
    allowUnknownOptions: false,
  })
  .option(
    "--root-dir <root directory>",
    "overrides the path to the root of your workspace where the root package.json is (auto detected by default)"
  )
  .example((name) => `${name} list --root-dir .`)
  .action(({ rootDir }) => {
    const dependencies = getDependencyList(rootDir ?? ".");
    console.log(dependencies);
  });

cli.help();

cli.parse();

if (!cli.matchedCommand) {
  cli.outputHelp();
}
