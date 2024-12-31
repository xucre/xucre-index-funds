import {
  distributeWeights,
  chainValidation,
  normalizeDevChains,
  getChainNameRainbowKit,
  convertHexToNumber,
  convertHexToUtf8,
  getTextColor,
  getDashboardBorderColor,
  toTitleCase,
  encodeStringToBigInt,
  isNull,
} from "../../service/helpers";

import { Theme } from "@mui/material";

describe("distributeWeights", () => {
  it("should distribute weights evenly and handle remainder", () => {
    const items = [{}, {}, {}];
    const weights = distributeWeights(items);
    expect(weights.reduce((a, b) => a + b, 0)).toBe(10000);
    expect(weights.every((weight) => Number.isInteger(weight))).toBe(true);
  });
});

describe("chainValidation", () => {
  it("should validate correct chain IDs", () => {
    expect(chainValidation(137)).toBe(true);
    expect(chainValidation(1)).toBe(true);
  });

  it("should invalidate incorrect chain IDs", () => {
    expect(chainValidation(100)).toBe(false);
    expect(chainValidation(9999)).toBe(false);
  });
});

describe("normalizeDevChains", () => {
  it("should normalize development chain IDs", () => {
    expect(normalizeDevChains(19819)).toBe(137);
    expect(normalizeDevChains(20208)).toBe(1);
  });

  it("should return the same chain ID for non-dev chains", () => {
    expect(normalizeDevChains(137)).toBe(137);
    expect(normalizeDevChains(1)).toBe(1);
  });
});

describe("getChainNameRainbowKit", () => {
  it("should return the correct chain name", () => {
    expect(getChainNameRainbowKit(1)).toBe("ethereum");
    expect(getChainNameRainbowKit(137)).toBe("polygon");
  });

  it("should handle dev chain IDs", () => {
    expect(getChainNameRainbowKit(19819)).toBe("polygon");
    expect(getChainNameRainbowKit(20208)).toBe("ethereum");
  });
});

describe("convertHexToNumber", () => {
  it("should return the original hex if conversion fails", () => {
    expect(convertHexToNumber("0x123")).toBe("0x123");
  });
});

describe("convertHexToUtf8", () => {
  it("should return the original hex if conversion fails", () => {
    expect(convertHexToUtf8("0x68656c6c6f")).toBe("0x68656c6c6f");
  });
});

describe("getTextColor", () => {
  it("should return black for light mode", () => {
    const theme = { palette: { mode: "light" } } as Theme;
    expect(getTextColor(theme)).toBe("black");
  });

  it("should return white for dark mode", () => {
    const theme = { palette: { mode: "dark" } } as Theme;
    expect(getTextColor(theme)).toBe("white");
  });
});

describe("getDashboardBorderColor", () => {
  it("should return correct color for light mode", () => {
    const theme = { palette: { mode: "light" } } as Theme;
    expect(getDashboardBorderColor(theme)).toBe("#4D25EF");
  });

  it("should return correct color for dark mode", () => {
    const theme = { palette: { mode: "dark" } } as Theme;
    expect(getDashboardBorderColor(theme)).toBe("#00B21F");
  });
});

describe("toTitleCase", () => {
  it("should convert string to title case", () => {
    expect(toTitleCase("hello world")).toBe("Hello World");
  });
});

describe("encodeStringToBigInt", () => {
  it("should encode string to BigInt", () => {
    expect(encodeStringToBigInt("abc")).toBe(BigInt(97 + 98 + 99));
  });

  it("should ignore non-alphanumeric characters", () => {
    expect(encodeStringToBigInt("a@b$c")).toBe(BigInt(97 + 98 + 99));
  });
});

describe("isNull", () => {
  it("should return true for null, undefined, or empty string", () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(true);
    expect(isNull("")).toBe(true);
  });

  it("should return false for non-empty values", () => {
    expect(isNull(0)).toBe(false);
    expect(isNull("text")).toBe(false);
  });
});
