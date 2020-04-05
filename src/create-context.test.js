const { createContext } = require("./create-context");

describe("createContext", () => {
  beforeEach(() => jest.resetAllMocks());

  it("creates context object", () => {
    const requestFixture = {};

    expect(createContext(requestFixture)).toEqual({
      request: requestFixture,
    });
  });
});
