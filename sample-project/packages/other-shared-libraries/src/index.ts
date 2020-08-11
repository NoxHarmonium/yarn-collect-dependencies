import { logSomething, addTwoNumbers } from "shared-libraries";

export const doAThing = () => logSomething(addTwoNumbers(1, 5).toString(), "B");
