import json from "@rollup/plugin-json";
import shebang from "rollup-plugin-add-shebang";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

const external = [
  ...Object.keys(pkg.dependencies || {}),
  "child_process",
  "fs",
  "os",
  "path",
  "fp-ts/lib/Either",
  "io-ts/lib/PathReporter",
];

const basePlugins = [
  json(),
  typescript({
    typescript: require("typescript"),
  }),
  terser(),
];

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
      },
      {
        file: pkg.module,
        format: "es",
      },
    ],
    external,
    plugins: basePlugins,
  },
  {
    input: "src/cli.ts",
    output: [
      {
        file: pkg.bin["collect-dependencies"],
        format: "cjs",
      },
    ],
    external,
    plugins: [
      ...basePlugins,
      shebang({
        include: "lib/cli*.js",
      }),
    ],
  },
];
