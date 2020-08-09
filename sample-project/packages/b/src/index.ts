import { logSomething, addTwoNumbers } from "a";

export const doAThing = () => logSomething(addTwoNumbers(1, 5).toString(), "B");
