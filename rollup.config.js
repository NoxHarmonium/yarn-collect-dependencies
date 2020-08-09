import json from "@rollup/plugin-json";
import shebang from "rollup-plugin-add-shebang";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export default {
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
  external: [
    ...Object.keys(pkg.dependencies || {}),
    "child_process",
    "fs",
    "path",
    "fp-ts/lib/Either",
    "io-ts/lib/PathReporter",
  ],
  plugins: [
    json(),
    typescript({
      typescript: require("typescript"),
    }),
    terser(),
    shebang({
      include: "lib/index*.js",
    }),
  ],
};
