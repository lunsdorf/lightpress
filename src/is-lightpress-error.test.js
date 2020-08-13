const { isLightpressError } = require("./is-lightpress-error");

describe("isLightpressError", () => {
  afterEach(() => jest.resetAllMocks());

  it("returns `true` when a `toResult` function is defined", () => {
    expect(isLightpressError()).toBe(false);
    expect(isLightpressError(void 0)).toBe(false);
    expect(isLightpressError(null)).toBe(false);
    expect(isLightpressError("test")).toBe(false);
    expect(isLightpressError(1)).toBe(false);
    expect(isLightpressError({})).toBe(false);
    expect(isLightpressError([])).toBe(false);
    expect(isLightpressError({ toResult() {} })).toBe(true);
    expect(isLightpressError(Object.create({ toResult() {} }))).toBe(true);
  });
});
