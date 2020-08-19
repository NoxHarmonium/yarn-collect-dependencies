import { spawnSync, SpawnSyncOptions } from "child_process";
import chalk from "chalk";

export class SpawnError extends Error {
  constructor(
    message: string,
    public readonly stdout: string,
    public readonly stderr: string,
    public readonly causedBy?: Error
  ) {
    super(message);
  }

  toString(): string {
    const outerError = super.toString();
    if (this.causedBy === undefined) {
      return outerError;
    } else {
      const innerError = this.causedBy.toString();
      return `${outerError}\n\nCaused By:\n${innerError}`;
    }
  }
}

export const spawnSafe = (
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions
): string => {
  const { status, signal, error, stdout, stderr } = spawnSync(
    command,
    args,
    options
  );

  const output = stdout?.toString() ?? "";
  const errorText = stderr?.toString() ?? "";

  if (error !== undefined) {
    throw new SpawnError(
      `Child process terminated with error`,
      output,
      errorText,
      error
    );
  }
  if (signal !== null) {
    throw new Error(`Child process terminated by signal: [${signal}]`);
  }
  if (status !== null && status !== 0) {
    throw new Error(`Child process terminated with status code: [${status}]`);
  }

  return output;
};

export const logStep = (
  current: number,
  total: number,
  message: string
): void => {
  console.info(`${chalk.dim(`[${current}/${total}]`)} ${message}`);
};
