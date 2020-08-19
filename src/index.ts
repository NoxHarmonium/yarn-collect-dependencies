import type { ExternalsFunctionElement } from "webpack";
import {
  getWorkspaceDependencies,
  getWorkspaceInfo,
  installDependencies,
  reifyDependencies,
  deleteSymlinks,
} from "./dependency-wrangling";
import { getDependencyList } from "./externals";
import { logStep, SpawnError } from "./utils";

export const collectDependenciesForPackage = (
  packageName: string,
  rootDir: string,
  stagingPath: string
): void => {
  const workspaceInfo = getWorkspaceInfo(rootDir);
  const root = workspaceInfo[packageName];
  const totalSteps = 4;

  try {
    logStep(1, totalSteps, "Determining workspace dependencies...");
    const dependencies = getWorkspaceDependencies(workspaceInfo, packageName);

    logStep(2, totalSteps, "Installing dependencies to staging directory...");
    installDependencies(rootDir, root.location, stagingPath);

    logStep(3, totalSteps, "Deleting unused symlinks...");
    deleteSymlinks(workspaceInfo, stagingPath);

    logStep(4, totalSteps, `Reifying remaining symlinks...`);
    reifyDependencies(rootDir, stagingPath, workspaceInfo, dependencies);
  } catch (error) {
    if (error instanceof SpawnError) {
      console.error(
        "Error executing yarn",
        error.stdout,
        error.stderr,
        error.causedBy
      );
    }
    throw error;
  }
};

export const ycdNodeExternals = (
  rootDir?: string
): ExternalsFunctionElement => {
  const dependencies = new Set(getDependencyList(rootDir ?? "."));
  return (_, request, callback) => {
    if (dependencies.has(request)) {
      console.log(`external: [${request}]`);
      return callback(null, "commonjs " + request);
    } else {
      console.log(`not external: [${request}]`);
      return callback();
    }
  };
};
