import { PageInfo } from "@/type/PageInfo";

/**
 * 読み込んだソース一覧（`import.meta.glob`）から読込結果群を取得する。
 *
 * @example
 * ```
 * const pages = import.meta.glob("./pages/**\/*.tsx");
 * const routes = await getRoutesFromPagesGlob(pages);
 * ```
 */
export const getPagesFromGlob = async (
  pages: Record<string, () => Promise<unknown>>,
  prefix: string = "",
) => {
  return (await Promise.all(
    Object.entries(pages)
      .map(async ([path, promiseValue]) => {
        const urlPart = getUrlFromPagesPath(path, prefix);
        if (!nonNullable(urlPart)) return;
        const url = urlPart
          // [test] -> :test
          .replace(/\/\[([^\]/]+)\]/g, "/:$1")
          // // -test -> test?
          // [needs fix bug]: https://github.com/remix-run/react-router/issues/9925
          // .replace(/\/-([^/]+)/g, "/$1?")
          ;

        const urlSplited = url.split("/");
        const urlTail = urlSplited.reverse().find(() => true) ?? "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = await promiseValue() as any;

        const pageInfo: PageInfo
          = value.Page ?? {
            Component: value.default,
          };

        return {
          path: `/${url}`,
          pathDepth: urlSplited.length,
          pathTail: urlTail,
          ...pageInfo,
        };
      }),
  ))
    .filter(nonNullable);
};
const nonNullable = <T, >(value: T): value is NonNullable<T> => value != undefined;

export const getUrlFromPagesPath = (
  rawPath: string | undefined,
  prefix: string = "",
  suffix: string = ".tsx",
): string | undefined => {
  if (rawPath == undefined) return;
  if (!rawPath.startsWith(prefix)) return;
  if (!rawPath.endsWith(suffix)) return;
  const path = rawPath
    .slice(prefix.length, rawPath.length - suffix.length);
  if (path == undefined) return;
  if (path === "") return;
  if (path.includes(".")) return;
  const names = path.split("/");
  const namesHasUpperCasePrefix
      = names.filter((name) => /^[A-Z]/.test(name));
  if (namesHasUpperCasePrefix.length !== 0) return;

  const namesLastIndex = names.length - 1;
  const suffixName = names[namesLastIndex];
  if (suffixName === "index") {
    return names.slice(0, namesLastIndex).join("/");
  }
  return path;
};
