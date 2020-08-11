import { spawnSync } from "child_process";
import { join } from "path";
import { Suite } from "benchmark";

const suite = new Suite();

const testPackageNames = [
  "serverless-webpack-with-ycd",
  //   "serverless-webpack-include-modules", Currently not working
  "serverless-webpack-exclude-modules",
];

const runPackage = (packageName: string, individualPackaging: boolean) => {
  spawnSync("yarn", ["build", "--non-interactive"], {
    cwd: join("sample-project/packages", packageName),
    env: {
      ...process.env,
      PACKAGE_INDIVIDUAL: individualPackaging.toString(),
    },
  });
};

testPackageNames.forEach((packageName) => {
  suite.add(`${packageName}_individual`, () => {
    runPackage(packageName, true);
  });
  suite.add(`${packageName}_combined`, () => {
    runPackage(packageName, false);
  });
});

suite
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
