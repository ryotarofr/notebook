import { describe, it, expect } from "vitest";

import { merge } from "./merge";

describe("merge()", async () => {
  it("flatten", async () => {
    const merged = merge({
      a: "foo",
      b: "bar",
    }, {
      c: "bazz",
    });
    expect(merged).toStrictEqual({
      a: "foo",
      b: "bar",
      c: "bazz",
    });
  });

  it("deep", async () => {
    const merged = merge({
      foo: {
        fooBar: {
          fooBarBaz: "fooBarBaz" as const,
        },
      },
    }, {
      foo: {
        fooBar: {
          fooBarFoo: "fooBarFoo" as const,
        },
        fooBazz: {
          fooBazzBar: "fooBazBar" as const,
        },
      },
    });
    expect(merged).toStrictEqual({
      foo: {
        fooBar: {
          fooBarFoo: "fooBarFoo" as const,
          fooBarBaz: "fooBarBaz" as const,
        },
        fooBazz: {
          fooBazzBar: "fooBazBar" as const,
        },
      },
    });
  });

  it("overwrite undefined", async () => {
    const merged = merge({
      optional: undefined,
    }, {
      optional: "test",
    });
    expect(merged).toStrictEqual({
      optional: "test",
    });
  });

  it("undefined has low priority", async () => {
    const merged = merge({
      optional: "test",
    }, {
      optional: undefined,
    });
    expect(merged).toStrictEqual({
      optional: "test",
    });
  });

  it("null has low priority", async () => {
    const merged = merge({
      optional: "test",
    }, {
      optional: null,
    });
    expect(merged).toStrictEqual({
      optional: "test",
    });
  });
});
