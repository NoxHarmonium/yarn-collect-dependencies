import { SNS } from "aws-sdk";
import dedent from "dedent";

export const addTwoNumbers = (a: number, b: number): number => a + b;

export const logSomething = (message: string, packageName: string): void => {
  const sns = new SNS();
  sns.listTopics(() => console.log("sss"));
  console.log(
    dedent`
        [Module ${packageName}] ===== ITS A LOG!!@!
        ${message}
        =====

    `
  );
};
