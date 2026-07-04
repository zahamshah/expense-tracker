import { describe, expect, it } from "vitest";
import { formatMoney, parsePoundsToPence, penceToPoundsInput } from "@/lib/money";

describe("money utilities", () => {
  it("parses GBP strings into pence", () => {
    expect(parsePoundsToPence("12.34")).toBe(1234);
    expect(parsePoundsToPence("£1,250.00")).toBe(125000);
    expect(parsePoundsToPence("7")).toBe(700);
  });

  it("rejects invalid money input", () => {
    expect(() => parsePoundsToPence("12.345")).toThrow();
    expect(() => parsePoundsToPence("abc")).toThrow();
  });

  it("formats pence for display and input", () => {
    expect(formatMoney(1234)).toBe("£12.34");
    expect(penceToPoundsInput(700)).toBe("7.00");
  });
});
