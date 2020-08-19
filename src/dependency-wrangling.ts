import { existsSync, readFileSync, unlinkSync, mkdirSync } from "fs";
import { join } from "path";
import * as _E from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { x as extractTar } from "tar";
import type { JsonObject, PackageJson } from "type-fest";
import { yarnWorkspaceInfoCodec, YarnWorkspaceInfo } from "./types";
import { pack, workspaceInfo, install } from "./yarn";

const getPackName = (absolutePackagePath: string) => {
  const packageJsonRaw = readFileSync(
    join(absolutePackagePath, "package.json")
  );
  const packageJson = JSON.parse(packageJsonRaw.toString()) as PackageJson;
  return `${packageJson.name ?? ""}-v${packageJson.version ?? ""}.tgz`;
};

const parseWorkspaceInfo = (workspaceInfoRaw: JsonObject) => {
  try {
    const decoded = yarnWorkspaceInfoCodec.decode(workspaceInfoRaw);
    if (_E.isLeft(decoded)) {
      const errors = PathReporter.report(decoded).join(", ");
      throw new Error(
        `Output from Yarn was in an unsupported structure: [${errors}]`
      );
    }
    return decoded.right;
  } catch (_) {
    throw new Error(`Could not parse output from Yarn: ${workspaceInfoRaw}`);
  }
};

const packPackage = (rootDir: string, packagePath: string): string => {
  const absolutePackagePath = join(rootDir, packagePath);
  pack(absolutePackagePath);

  const packName = getPackName(absolutePackagePath);
  const fullPackPath = join(absolutePackagePath, packName);
  if (!existsSync(fullPackPath)) {
    throw new Error(
      `The pack file [${packName}] does not exist. There may have been an issue packing the package`
    );
  }

  return fullPackPath;
};

export const deleteSymlinks = (
  workspaceInfo: YarnWorkspaceInfo,
  stagingPath: string
): void => {
  const allPackages = Object.keys(workspaceInfo);
  allPackages.forEach((packageName) =>
    unlinkSync(join(stagingPath, packageName))
  );
};

/**
 * Retrieves and parses the Yarn workspace information for a project
 *
 * @param rootDir the directory where the root package.json for the Yarn workspace resides
 */
export const getWorkspaceInfo = (rootDir: string): YarnWorkspaceInfo => {
  const workspaceInfoRaw = workspaceInfo(rootDir);
  return parseWorkspaceInfo(workspaceInfoRaw);
};

/**
 * Gets a list of Yarn workspace packages that a package depends on.
 * Used to filter out packages that are not depended on by the target package.
 *
 * @param workspaceInfo information about the current Yarn workspace
 * @param packageName the name of the package to get the dependencies for
 */
export const getWorkspaceDependencies = (
  workspaceInfo: YarnWorkspaceInfo,
  packageName: string
): readonly string[] => {
  const root = workspaceInfo[packageName];
  if (root === undefined) {
    throw new Error(
      `Cannot find a package called [${packageName}] in this workspace`
    );
  }

  // Circular dependencies are allowed for some reason so we need to protect against that
  const visitedSet = new Set<string>();

  const visit = (name: string) => {
    if (!visitedSet.has(name)) {
      visitedSet.add(name);
      const node = workspaceInfo[name];
      node.workspaceDependencies.forEach(visit);
    }
  };

  visit(packageName);

  // The root package is not a dependency of itself
  visitedSet.delete(packageName);

  return Array.from(visitedSet);
};

/**
 * Uses `yarn install` to install the dependencies for a yarn workspace into a staging dir.
 *
 * @param rootDir the directory where the root package.json for the Yarn workspace resides
 * @param packagePath the path to the specific package for which you want to install dependencies for
 * @param stagingPath the path to install the files to
 */
export const installDependencies = (
  rootDir: string,
  packagePath: string,
  stagingPath: string
): void => {
  const absolutePackagePath = join(rootDir, packagePath);
  install(absolutePackagePath, stagingPath);

  // TODO: Print logs from yarn if verbose enabled or on error
  if (!existsSync(absolutePackagePath)) {
    throw new Error(
      `The staging directory does not exist. There may have been an issue installing the dependencies`
    );
  }
};

/**
 * Takes a folder that has been prepared with a `yarn install --modules-folder` command
 * and turns the symlinks into actual folders that contain the dependency.
 *
 * Symlinks not in the dependencies list will be removed and not reified
 *
 * @param rootDir the directory where the root package.json for the Yarn workspace resides
 * @param stagingPath the directory when the `yarn install` has targeted
 * @param workspaceInfo information about the current Yarn workspace
 * @param dependencies a list of dependency names that should be reified
 */
export const reifyDependencies = (
  rootDir: string,
  stagingPath: string,
  workspaceInfo: YarnWorkspaceInfo,
  dependencies: readonly string[]
): void => {
  dependencies.forEach((dependencyName) => {
    const dependency = workspaceInfo[dependencyName];
    const targetPath = join(stagingPath, dependencyName);
    const fullPackPath = packPackage(rootDir, dependency.location);
    mkdirSync(targetPath, { recursive: true });
    extractTar({
      file: fullPackPath,
      sync: true,
      cwd: targetPath,
      strip: 1,
    });
  });
};
