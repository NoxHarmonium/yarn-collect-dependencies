import * as _E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { info } from "./yarn";

const treeObjectCodec = t.type({
  type: t.literal("tree"),
  data: t.type({
    type: t.literal("list"),
    trees: t.readonlyArray(
      t.type({
        name: t.string,
      })
    ),
  }),
});

export const getDependencyList = (rootDir: string): string[] => {
  const rawInfo = info(rootDir);
  const treeObjects = rawInfo.filter((obj) => obj.type === "tree");
  if (treeObjects.length !== 1) {
    throw new Error("Could not find tree element from Yarn output");
  }
  const rawTreeObject = treeObjects[0];
  const decodedTreeObject = treeObjectCodec.decode(rawTreeObject);

  if (_E.isLeft(decodedTreeObject)) {
    const errors = PathReporter.report(decodedTreeObject).join(", ");
    throw new Error(
      `Output from Yarn was in an unsupported structure: [${errors}]`
    );
  }

  const treeObject = decodedTreeObject.right;
  const names = treeObject.data.trees.map(({ name }) =>
    name.substring(0, name.lastIndexOf("@"))
  );
  return names;
};
