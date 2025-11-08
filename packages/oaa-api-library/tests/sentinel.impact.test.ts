import { scoreImpact } from "../src/sentinel/impact";

describe("sentinel impact scoring", () => {
  it("flags medium impact for dual high-trust sources", () => {
    const result = scoreImpact({
      domains: new Set(["reuters.com", "ecb.europa.eu"]),
      text: "ECB announces emergency rate decision amid recession concerns",
    });
    expect(["medium", "high"]).toContain(result);
  });

  it("returns low for single low-signal source", () => {
    const result = scoreImpact({
      domains: new Set(["blog.example.org"]),
      text: "Community blog reports minor event",
    });
    expect(result).toBe("low");
  });
});
