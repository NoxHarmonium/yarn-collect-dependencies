import type { APIGatewayProxyResult } from "aws-lambda";
import * as _E from "fp-ts/lib/Either";
import * as t from "io-ts";
import moment from "moment";
import { doAThing } from "other-shared-libraries";
import { BehaviorSubject } from "rxjs";
import { logSomething, addTwoNumbers } from "shared-libraries";

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const ten = addTwoNumbers(5, 5);
  logSomething(`ten = ${ten}`, "C");
  logSomething(addTwoNumbers(1, 99).toString(), "C");
  doAThing();
  console.log("time is: ", moment().format());
  const lol = new BehaviorSubject(4);
  lol.subscribe(() => console.log("g"));
  const z = t.string.decode(3);
  if (_E.isLeft(z)) {
    console.error(z.left);
  }
  return {
    statusCode: 200,
    body: "OK",
  };
};

export const handler2 = async (): Promise<APIGatewayProxyResult> => {
  const ten = addTwoNumbers(5, 5);
  logSomething(`ten = ${ten}`, "C");
  logSomething(addTwoNumbers(1, 99).toString(), "C");
  doAThing();
  console.log("time is: ", moment().format());
  const lol = new BehaviorSubject(4);
  lol.subscribe(() => console.log("g"));
  const z = t.string.decode("aa");
  if (_E.isLeft(z)) {
    console.error(z.left);
  }
  return {
    statusCode: 200,
    body: "OK",
  };
};

export const handler3 = async (): Promise<APIGatewayProxyResult> => {
  const ten = addTwoNumbers(5, 5);
  logSomething(`ten = ${ten}`, "C");
  logSomething(addTwoNumbers(1, 99).toString(), "GGG");
  doAThing();
  console.log("time is: ", moment().format());
  const lol = new BehaviorSubject(4);
  lol.subscribe(() => console.log("g"));
  const z = t.string.decode(3);
  if (_E.isLeft(z)) {
    console.error(z.left);
  }
  return {
    statusCode: 200,
    body: "OK",
  };
};

export const handler4 = async (): Promise<APIGatewayProxyResult> => {
  const ten = addTwoNumbers(2, 4);
  logSomething(`ten = ${ten}`, "C");
  logSomething(addTwoNumbers(1, 44).toString(), "C");
  doAThing();
  console.log("time is: ", moment().format());
  const lol = new BehaviorSubject(4);
  lol.subscribe(() => console.log("g"));
  const z = t.string.decode(3);
  if (_E.isLeft(z)) {
    console.error(z.left);
  }
  return {
    statusCode: 200,
    body: "OK",
  };
};

export const handler5 = async (): Promise<APIGatewayProxyResult> => {
  const ten = addTwoNumbers(2, 4);
  logSomething(`ten = ${ten}`, "C");
  logSomething(addTwoNumbers(1, 99).toString(), "C");
  doAThing();
  console.log("date is: ", moment().format());
  const lol = new BehaviorSubject(4);
  lol.subscribe(() => console.log("xg"));
  const z = t.string.decode(3);
  if (_E.isLeft(z)) {
    console.error(z.left);
  }
  return {
    statusCode: 200,
    body: "OK",
  };
};

export const handler6 = async (): Promise<APIGatewayProxyResult> => {
  const ten = addTwoNumbers(2, 4);
  logSomething(`ten = ${ten}`, "C");
  logSomething(addTwoNumbers(1, 99).toString(), "C");
  doAThing();
  console.log("time is: ", moment().format());
  const lol = new BehaviorSubject(4);
  lol.subscribe(() => console.log("g"));
  const z = t.string.decode(3);
  if (_E.isLeft(z)) {
    console.error(z.left);
  }
  return {
    statusCode: 500,
    body: "OK",
  };
};

export const handler7 = async (): Promise<APIGatewayProxyResult> => {
  const ten = addTwoNumbers(32, 44);
  logSomething(`ten = ${ten}`, "C");
  logSomething(addTwoNumbers(1, 99).toString(), "C");
  doAThing();
  console.log("time is: ", moment().format());
  const lol = new BehaviorSubject(4);
  lol.subscribe(() => console.log("g"));
  const z = t.string.decode("something different");
  if (_E.isLeft(z)) {
    console.error(z.left);
  }
  return {
    statusCode: 200,
    body: "OK",
  };
};
