import { spawnSync } from "child_process";
import { existsSync, readFileSync, unlinkSync, mkdirSync } from "fs";
import { join } from "path";
import * as _E from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { x as extractTar } from "tar";
import type { JsonObject, PackageJson } from "type-fest";
import { yarnWorkspaceInfoCodec, YarnWorkspaceInfo } from "./types";

const getPackName = (absolutePackagePath: string) => {
  const packageJsonRaw = readFileSync(
    join(absolutePackagePath, "package.json")
  );
  const packageJson = JSON.parse(packageJsonRaw.toString()) as PackageJson;
  return `${packageJson.name ?? ""}-v${packageJson.version ?? ""}.tgz`;
};

const parseWorkspaceInfo = (workspaceInfoRaw: string) => {
  if (workspaceInfoRaw.trim().startsWith("error")) {
    throw new Error(`Yarn reported an error: ${workspaceInfoRaw}`);
  }

  try {
    const json = JSON.parse(workspaceInfoRaw) as JsonObject;
    const decoded = yarnWorkspaceInfoCodec.decode(json);
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
  try {
    const absolutePackagePath = join(rootDir, packagePath);
    console.log(`Calling yarn pack on [${absolutePackagePath}]`);
    // TODO: Why is the archive corrupt if "files" is not set in package.json?
    const result = spawnSync("yarn", ["pack"], {
      cwd: absolutePackagePath,
    });

    if (result.error !== undefined) {
      throw new Error("Child process indicated error");
    }

    const packName = getPackName(absolutePackagePath);
    const fullPackPath = join(absolutePackagePath, packName);
    if (!existsSync(fullPackPath)) {
      throw new Error(
        `The pack file [${packName}] does not exist. There may have been an issue packing the package`
      );
    }

    return fullPackPath;
  } catch (error) {
    throw new Error(`Error packing package: ${error.message}`);
  }
};

const deleteSymlinks = (
  workspaceInfo: YarnWorkspaceInfo,
  stagingPath: string
) => {
  console.log(`Deleting existing symlinks...`);
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
  try {
    const result = spawnSync("yarn", ["--silent", "workspaces", "info"], {
      cwd: rootDir,
    });

    if (result.error !== undefined) {
      throw new Error("Child process indicated error");
    }

    const workspaceInfoRaw = result.stdout.toString();
    return parseWorkspaceInfo(workspaceInfoRaw);
  } catch (error) {
    throw new Error(`Error getting workspace info: ${error.message}`);
  }
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
  try {
    const absolutePackagePath = join(rootDir, packagePath);
    console.log(`Executing yarn install...`);
    const result = spawnSync(
      "yarn",
      [
        "install",
        "--production",
        "--pure-lockfile",
        "--no-bin-links",
        "--force",
        "--modules-folder",
        stagingPath,
      ],
      {
        cwd: absolutePackagePath,
      }
    );

    if (result.error !== undefined) {
      throw new Error("Child process indicated error");
    }

    // TODO: Print logs from yarn if verbose enabled or on error
    if (!existsSync(absolutePackagePath)) {
      throw new Error(
        `The staging directory does not exist. There may have been an issue installing the dependencies`
      );
    }
  } catch (error) {
    throw new Error(
      `Error installing dependencies to staging path: ${error.message}`
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
  deleteSymlinks(workspaceInfo, stagingPath);
  dependencies.forEach((dependencyName) => {
    const dependency = workspaceInfo[dependencyName];
    const targetPath = join(stagingPath, dependencyName);
    console.log(`Packaging package [${dependencyName}]...`);
    const fullPackPath = packPackage(rootDir, dependency.location);
    console.log(
      `Unpacking pack file [${fullPackPath}] to target directory: [${targetPath}]`
    );
    mkdirSync(targetPath, { recursive: true });
    extractTar({
      file: fullPackPath,
      sync: true,
      cwd: targetPath,
      strip: 1,
    });
  });
};
