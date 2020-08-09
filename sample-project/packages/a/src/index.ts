import dedent from "dedent";

export const addTwoNumbers = (a: number, b: number) => a + b;

export const logSomething = (message: string, packageName: string) =>
  console.log(
    dedent`
        [Module ${packageName}] ===== ITS A LOG!!@!
        ${message}
        =====

    `
  );
