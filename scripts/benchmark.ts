import { spawnSync, SpawnSyncOptions } from "child_process";
import { join } from "path";
import { Suite } from "benchmark";

const suite = new Suite();

export const spawnSafe = (
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions
): string => {
  console.log("Executing ", command, args, " in ", options.cwd);

  const { status, signal, error, stdout, stderr } = spawnSync(
    command,
    args,
    options
  );

  const output = stdout?.toString() ?? "";
  const errorText = stderr?.toString() ?? "";

  if (error !== undefined) {
    console.error(errorText);
    throw error;
  }
  if (signal !== null) {
    console.error(errorText);
    throw new Error(`Child process terminated by signal: [${signal}]`);
  }
  if (status !== null && status !== 0) {
    console.error(errorText);
    throw new Error(`Child process terminated with status code: [${status}]`);
  }

  return output;
};

const testPackageNames = [
  "serverless-webpack-with-ycd",
  //   "serverless-webpack-include-modules", Currently not working
  "serverless-webpack-exclude-modules",
];

const runPackage = (packageName: string, individualPackaging: boolean) => {
  spawnSafe("yarn", ["build", "--non-interactive"], {
    cwd: join("sample-project/packages", packageName),
    env: {
      ...process.env,
      PACKAGE_INDIVIDUAL: individualPackaging.toString(),
    },
  });
};

const setup = (packageName: string) => {
  console.log("Per Test Setup -- Clean/Install");
  spawnSafe("yarn", ["clean", "--non-interactive"], {
    cwd: join("sample-project/packages", packageName),
  });
  spawnSafe("yarn", ["install", "--non-interactive"], {
    cwd: join("sample-project/packages", packageName),
  });
};

testPackageNames.forEach((packageName) => {
  suite.add(
    `${packageName}_individual`,
    () => {
      runPackage(packageName, true);
    },
    { onStart: () => setup(packageName) }
  );
  suite.add(
    `${packageName}_combined`,
    () => {
      runPackage(packageName, false);
    },
    { onStart: () => setup(packageName) }
  );
});

suite
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .on("start", function () {
    console.log("Global Setup -- Installing dependencies");
    spawnSafe("yarn", ["install", "--non-interactive"], {
      cwd: "sample-project",
    });
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .on("cycle", function (event: any) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    // TODO: Fix these typing issues
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log("Fastest is " + (this as Suite).filter("fastest").map("name"));
  })
  .run({ async: false, maxTime: 120 });
