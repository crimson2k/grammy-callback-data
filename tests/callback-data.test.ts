import { describe, expect, it } from "vitest";
import { CallbackData } from "../src/callback-data";
import { t } from "../src/types";

const PostCD = new CallbackData("post", {
  action: t.string(),
  postId: t.number(),
  isConfirmed: t.boolean(),
});

describe("CallbackData.pack", () => {
  it("serializes prefix and typed fields", () => {
    expect(
      PostCD.pack({ action: "like", postId: 123, isConfirmed: false }),
    ).toBe("post:like:123:0");
  });

  it("serializes boolean true as 1", () => {
    expect(
      PostCD.pack({ action: "delete", postId: 1, isConfirmed: true }),
    ).toBe("post:delete:1:1");
  });
});

describe("CallbackData.unpack", () => {
  it("round-trips packed data", () => {
    const packed = PostCD.pack({
      action: "like",
      postId: 42,
      isConfirmed: true,
    });

    expect(PostCD.unpack(packed)).toEqual({
      action: "like",
      postId: 42,
      isConfirmed: true,
    });
  });

  it("throws when a value is missing", () => {
    expect(() => PostCD.unpack("post:like")).toThrow(/Missing value/);
  });
});

describe("CallbackData.filter", () => {
  it("matches any payload with the prefix", () => {
    const re = PostCD.filter();
    expect(re.test("post:like:123:0")).toBe(true);
    expect(re.test("other:like:123:0")).toBe(false);
  });

  it("matches specific field clauses", () => {
    const re = PostCD.filter({ action: "like" });
    expect(re.test("post:like:123:0")).toBe(true);
    expect(re.test("post:delete:123:0")).toBe(false);
  });

  it("matches multiple field clauses", () => {
    const re = PostCD.filter({ action: "delete", isConfirmed: true });
    expect(re.test("post:delete:99:1")).toBe(true);
    expect(re.test("post:delete:99:0")).toBe(false);
  });
});
