import { isAllowed } from "../src/sentinel/allowlist";

describe("sentinel allowlist", () => {
  it("accepts Reuters subdomain", () => {
    expect(isAllowed("https://www.reuters.com/world/asia-pacific"))
      .toBe(true);
  });

  it("rejects unlisted domain", () => {
    expect(isAllowed("https://example.com/news")).toBe(false);
  });
});
