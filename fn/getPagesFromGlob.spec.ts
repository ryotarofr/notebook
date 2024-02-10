import { describe, it, expect } from "vitest";

import { getUrlFromPagesPath } from "./getPagesFromGlob";

describe("getRoutesFromPagesGlob()", () => {
  describe("getUrlFromPagesPath()", () => {
    const prefix = "./pages/";
    const pathResultMap = {
      "./pages/index.tsx": "",
      "./pages/abc/def/ghi/jkl.tsx": "abc/def/ghi/jkl",
      "./pages/deep/test/skiw02001/index.tsx": "deep/test/skiw02001",
      "./pages/deep/test/Skiw02001/index.tsx": undefined,
      "./pages/index.stories.tsx": undefined,
      "./pages/index.spec.tsx": undefined,
      "./pages/index.d.ts": undefined,
      "./pages/index.scss": undefined,
      "./pages/index.module.scss": undefined,
      "./pages/index.module.scss.d.ts": undefined,
      "./pages/index.module.scss.d.ts.map": undefined,
    };
    Object.entries(pathResultMap)
      .forEach(([path, correctUrl]) => {
        if (correctUrl === undefined) {
          it(`${path} を含まない`, async () => {
            const url = getUrlFromPagesPath(path, prefix);
            expect(url).toBeUndefined();
          });
        } else {
          it(`${path} => ${correctUrl}`, async () => {
            const url = getUrlFromPagesPath(path, prefix);
            expect(url).toBe(correctUrl);
          });
        }
      });
  });
});
