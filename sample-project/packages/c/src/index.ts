import { logSomething, addTwoNumbers } from "a";
import { doAThing } from "b";

export const handler = () => {
  const ten = addTwoNumbers(5, 5);
  logSomething(`ten = ${ten}`, "C");
  logSomething(addTwoNumbers(1, 99).toString(), "C");
  doAThing();
};

handler();
