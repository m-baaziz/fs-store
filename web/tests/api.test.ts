import type { NextApiRequest, NextApiResponse } from "next";
import hello from "../pages/api/hello";

describe("hello", () => {
  test("hello", () => {
    const mock = jest.fn();
    const res = { statusCode: undefined, json: mock };
    hello({} as NextApiRequest, (res as unknown) as NextApiResponse);
    expect(res.statusCode).toEqual(200);
    expect(mock.mock.calls.length).toEqual(1);
    expect(mock.mock.calls[0][0]).toEqual({ name: "John Doe" });
  });
});
