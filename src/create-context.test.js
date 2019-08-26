jest.mock('url');

const { parse } = require('url');
const { createContext } = require('./create-context');

describe("createContext", () => {
  beforeEach(() => jest.resetAllMocks());

  it("creates context object", () => {
    const urlFixture = "/some/url";
    const parsedUrlFixture = {};
    const requestFixture = { url: urlFixture };

    parse.mockImplementation(() => parsedUrlFixture);

    expect(createContext(requestFixture)).toEqual({
      request: requestFixture,
      url: parsedUrlFixture,
    });

    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenCalledWith(urlFixture, true);
  });
});
