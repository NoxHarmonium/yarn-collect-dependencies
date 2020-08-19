import type { JsonObject } from "type-fest";
import { spawnSafe } from "./utils";
import { EOL } from "os";

export const pack = (packagePath: string): void => {
  // TODO: Why is the archive corrupt if "files" is not set in package.json?
  spawnSafe("yarn", ["pack", "--non-interactive"], {
    cwd: packagePath,
  });
};

export const workspaceInfo = (workspaceRootDir: string): JsonObject => {
  const output = spawnSafe(
    "yarn",
    ["--non-interactive", "--silent", "workspaces", "info"],
    {
      cwd: workspaceRootDir,
    }
  );

  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error("Cannot parse output from yarn as JSON");
  }
};

export const install = (packagePath: string, outputPath: string): void => {
  spawnSafe(
    "yarn",
    [
      "install",
      "--non-interactive",
      "--production",
      "--pure-lockfile",
      "--no-bin-links",
      "--force",
      "--modules-folder",
      outputPath,
    ],
    {
      cwd: packagePath,
    }
  );
};

export const info = (rootDir: string): readonly JsonObject[] => {
  const output = spawnSafe(
    "yarn",
    [
      "list",
      "--non-interactive",
      "--silent",
      "--production",
      "--depth=0",
      "--json",
    ],
    {
      cwd: rootDir,
    }
  );

  try {
    return output
      .split(EOL)
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
  } catch (error) {
    throw new Error("Cannot parse output from yarn as JSON");
  }
};
