import { describe, expect, it } from "vitest";
import { publicOrderSchema } from "@/modules/posts/posts.validation";

describe("publicOrderSchema", () => {
  it("accepts integer public order values from 0 to 9999", () => {
    expect(publicOrderSchema.parse({ publicOrder: 0 })).toEqual({ publicOrder: 0 });
    expect(publicOrderSchema.parse({ publicOrder: 1 })).toEqual({ publicOrder: 1 });
    expect(publicOrderSchema.parse({ publicOrder: 9999 })).toEqual({ publicOrder: 9999 });
  });

  it("rejects invalid public order values", () => {
    expect(() => publicOrderSchema.parse({ publicOrder: -1 })).toThrow();
    expect(() => publicOrderSchema.parse({ publicOrder: 10000 })).toThrow();
    expect(() => publicOrderSchema.parse({ publicOrder: 1.5 })).toThrow();
  });
});
