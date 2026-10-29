import "@testing-library/jest-dom";

jest.mock("next/navigation", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const utils = require("./src/test-utils") as typeof import("./src/test-utils");
  return {
    useRouter: () => ({ push: utils.push, replace: utils.replace }),
    useSearchParams: () => utils.searchParams,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});
