import * as t from "io-ts";

/**
 * A codec for encoding and decoding the JSON produced
 * by Yarn when running `yarn workspaces info`
 */
export const yarnWorkspaceInfoCodec = t.record(
  t.string,
  t.type({
    location: t.string,
    workspaceDependencies: t.readonlyArray(t.string),
    mismatchedWorkspaceDependencies: t.readonlyArray(t.string),
  })
);

/**
 * Represents the structure of the JSON produced
 * by Yarn when running `yarn workspaces info`
 */
export type YarnWorkspaceInfo = t.TypeOf<typeof yarnWorkspaceInfoCodec>;
