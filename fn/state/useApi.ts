import useSWR from "swr";
import { BareFetcher, SWRConfiguration, useSWRConfig } from "swr/_internal";
import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";

import { useLoadingBoundary } from "@/fn/context/LoadingBoundaryContext";
import { components, paths } from "@/schema.gen";
import { TemplateLiteralPlaceholder } from "@/type/TemplateLiteralPlaceholder";

/**
 * Union型情報から nullable な部分を抽出する。
 */
type PickNullablePart<T> = Exclude<T, NonNullable<T>>;
/**
 * Nullableを伝播しつつ指定のfieldの型を取得する
 */
type GetFieldFromNullable<From, Key> =
  Key extends keyof NonNullable<From>
    ? From extends NonNullable<From>
      ? From[Key]
      : NonNullable<From>[Key] | PickNullablePart<From>
    : never;

/**
 * ネストされたプロパティの型を取得する。
 */
type GetNested<From, Keys> =
  Keys extends [infer Head, ...infer Tails]
    ? Head extends keyof NonNullable<From>
      ? Tails extends []
        ? GetFieldFromNullable<From, Head>
        : GetNested<GetFieldFromNullable<From, Head>, Tails>
      : never
    : never;

/**
 * OpenAPI schema の responses セクションから、fetch の戻り値型を取得する。
 */
type ResponseStatusMapFromSchemaRespopnses<Responses> =
  {
    [StatusCode in keyof Responses]: StatusCode extends TemplateLiteralPlaceholder
      ? {
        __statuscodestr__: `${StatusCode}`;
        statusCode: StatusCode;
      // description?: GetNested<Responses, [StatusCode, "description"]>,
      // contentType: keyof GetNested<Responses, [StatusCode, "content"]>,
      } & GetNested<
        Responses,
        [StatusCode, "content", keyof GetNested<Responses, [StatusCode, "content"]>]
      >
      : never
  }[keyof Responses];

type OmitSpecificStatusCodeStr<Pattern, Responses> = Omit<
  Extract<
    ResponseStatusMapFromSchemaRespopnses<Responses>,
    {__statuscodestr__: Pattern}
  >,
  "__statuscodestr__"
>;
type ResponseMapFromSchemaRespopnses<Responses> = {
  ok: OmitSpecificStatusCodeStr<`${1 | 2 | 3}${string}`, Responses>;
  error: OmitSpecificStatusCodeStr<`${4 | 5}${string}`, Responses>;
};

/**
 * schema.gen.ts から API が受送信するデータ型を取得するための wrapper。
 */
export type ApiTypes<Key extends keyof components["schemas"]>
  = components["schemas"][Key];
/**
 * object union (\{\} | \{\} | ...) に対して keyof を行う。
 */
type KeyOfObjectUnion<T> = T extends { [Key in PropertyKey]: unknown } ? keyof T : never;
/**
 * schema.gen.ts で登場する http method を抽出したもの。
 */
type HttpMethod = KeyOfObjectUnion<paths[keyof paths]>;

/**
 * RESTful API base url.
 */
const apiBaseUrl = `${location.origin}/api/v1`;

/**
 * fetch 成功時用の response 変換処理
 */
const fetchResponseHandler
  = async (response: Response) => {
    const result = await (async () => {
      try {
        return await response.json();
      } catch {
        return undefined;
      }
    })();
    // result["statusCode"] = response.status;
    // result["statusText"] = response.statusText;

    if (!response.ok) {
      throw result;
    }
    return result;
  };

/**
 * useApi* に共通する通信時処理を提供するHook
 */
type CommonApiFetchProps = {
  showIndicator?: boolean;
};
const useCommonApiFetch = ({
  showIndicator = true,
}: CommonApiFetchProps) => {
  const { track } = useLoadingBoundary();
  return {
    createFetch: (fetch: Promise<Response>) => {
      const promise = fetch
        .then(fetchResponseHandler);
      return showIndicator
        ? track(promise)
        : promise;
    },
  };
};

type Falsy<T> = T | null | undefined | false | "";
type FalsyOrFn<T> = Falsy<T> | (() => Falsy<T>);
const FalsyOrFn = {
  map: <T, Result>(
    raw: FalsyOrFn<T>,
    mapper: (value: T) => Result,
  ): Falsy<Result> => {
    if (!raw) return raw as Falsy<Result>;
    const path = raw instanceof Function
      ? () => {
        const mayBeValue = raw();
        if (!mayBeValue) return mayBeValue as Falsy<Result>;
        return mapper(mayBeValue);
      }
      : mapper(raw);
    return path as Falsy<Result>;
  },
};
const getPathFromTemplateAndPlaceholderMap = (
  pathTemplate: string,
  placeholderMap: Record<string, unknown> | undefined,
) => {
  const path
      = Object.entries(placeholderMap ?? {})
        .reduce<string[]>((prev, [key, value]) => {
          return prev.map((it) => it === `{${key}}` ? `${value}` : it);
        }, pathTemplate.split("/"))
        .join("/");
  return path;
};
const getUrlFromPathAndQueryMap = (
  path: string,
  queryMap: Record<string, unknown>) => {
  const searchParams = new URLSearchParams(queryMap as Record<string, string>).toString();
  const hasSearchParam = searchParams !== "";
  return (
    hasSearchParam
      ? `${path}?${searchParams}`
      : path
  );
};
const getDefinedQueriesMap = (rawQueryMap?: Record<string, unknown>) => {
  if (!rawQueryMap) return {};
  return Object.entries((rawQueryMap) as Record<string, string>)
    .map(([key, value]) => ([key, value !== undefined ? value : ""]));
};
/**
 * path と placeholderMap と searchParams より、 url を取得
 */
const getUrlFromPathAndPlaceholderMap = (
  pathTemplate: string,
  placeholder: Record<string, unknown> | undefined,
  query: Record<string, unknown> | undefined) => {
  const path
      = Object.entries(placeholder ?? {})
        .reduce<string[]>((prev, [key, value]) => {
          return prev.map((it) => it === `{${key}}` ? `${value}` : it);
        }, pathTemplate.split("/"))
        .join("/");
  const definedQueries = Object.entries((query ?? {}) as Record<string, string>)
    .map(([key, value]) => ([key, value !== undefined ? value : ""]));
  const searchParams = new URLSearchParams(definedQueries).toString();
  const hasSearchParam = searchParams !== "";
  return (
    hasSearchParam
      ? `${path}?${searchParams}`
      : path
  );
};

type EmptyObject = Record<PropertyKey, never>;
type ToRecord<Key extends PropertyKey, T, WhenOptional = EmptyObject> =
  [T] extends [never]
    ? { [K in Key]?: WhenOptional }
    : { [K in Key]: T };
type OmitOrNever<T, Key extends PropertyKey> =
      [T] extends [never]
        ? never
        : T extends undefined
          ? T
          : Omit<T, Key>;

type RequiredKeys<T> = { [K in keyof T]-?: EmptyObject extends Pick<T, K> ? never : K }[keyof T];
type ToBeOptionalArgIfNotRequired<T> =
  [RequiredKeys<T>] extends [never]
    ? [] | [T]
    : [T];

export type ApiQuery<
  Url extends keyof paths,
  Method extends keyof paths[Url]
> = OmitOrNever<
    GetNested<paths, [Url, Method, "parameters", "query"]>,
    "request"
  >;

export type UseApiKeys = {
  path: string;
  placeholder: Record<string, unknown>;
  query: Record<string, unknown>;
};
const UseApiKeys = (() => {
  return {
    from: (val: UseApiKeys) => val,
  };
})();

/**
 * APIとの通信用Hookを構築する関数。
 * HTTP[GET]時に用いる。
 *
 * API 通信に、schema.gen.ts から型情報を付与したもの。
 * `useSWR()`のラッパーで、fetch の結果を state として提供する。
 *
 * @param pathTemplate - 通信対象のAPIエンドポイントを示す文字列（URL）。
 * @param options - SWRコンフィグと、必要なら [placeholder, query]。
 * @param options.placeholder - `path`内のプレースホルダーに与える値を設定する。
 * @param options.query - url末尾に queryParams として与える値を設定する。
 * @returns SWRResponse
 *
 * @example
 * ```
 * const {
 *   data: samples, // 通信結果が入る。
 * } = useApiQuery("/samples");
 *
 * // 描画時に自動で通信が実行される。
 * ```
 */
export const useApiQuery
  = <
    Url extends keyof QueryPaths,
    Placeholder extends GetNested<QueryPaths, [Url, "get", "parameters", "path"]>,
    Query extends ApiQuery<Url, "get">,
    ResponseMap extends ResponseMapFromSchemaRespopnses<
      GetNested<QueryPaths, [Url, "get", "responses"]>
    >,
    Response extends ResponseMap["ok"],
    Error extends ResponseMap["error"],
  >(
    pathTemplate: FalsyOrFn<Url>,
    ...options: (
      ToBeOptionalArgIfNotRequired<
        SWRConfiguration<Response, Error, BareFetcher<Response>>
        & ToRecord<"placeholder", Placeholder>
        & ToRecord<"query", Query>
        & CommonApiFetchProps
      >
    )
  ) => {
    const [option] = options;
    const { createFetch } = useCommonApiFetch(option ?? {});
    const fetcher = (args: UseApiKeys) => {
      const {
        path: pathTemplate,
        placeholder: placeholderMap,
        query: queryMap,
      } = args;
      const path = getPathFromTemplateAndPlaceholderMap(pathTemplate, placeholderMap);
      const url = getUrlFromPathAndQueryMap(path, queryMap);
      console.log(`useSWR by ${url} [${JSON.stringify(args)}]`);
      return createFetch(
        fetch(`${apiBaseUrl}${url}`, {
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );
    };
    const placeholder = (option?.placeholder ?? {}) as Record<string, unknown>;
    // searchParam は値を持つもののみに絞り込む
    const query = getDefinedQueriesMap(option?.query);
    // pathTemplate が値を持っていれば中身をTupleに変換
    const keys = FalsyOrFn.map(
      pathTemplate,
      (it) => UseApiKeys.from({
        path: it,
        placeholder,
        query,
      }),
    );

    return useSWR<Response, Error, FalsyOrFn<UseApiKeys>>(keys, fetcher, {
      // refreshInterval: 1000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      ...option as SWRConfiguration<Response, Error, BareFetcher<Response>>,
    });
  };

type QueryMethod = Extract<HttpMethod, "get">;
type QueryPaths =
  {
    [
    Key in keyof paths as paths[Key] extends { [K in QueryMethod]?: unknown }
      ? Key
      : never
    ]: paths[Key]
  };

/**
 * APIとの通信用Hookを構築する関数。
 * HTTP[POST, PUT, PATCH, DELETE]時に用いる。
 * また、GET通信を遅延実行したい際にも用いることができる。
 *
 * API 通信に、schema.gen.ts から型情報を付与したもの。
 * `useSWRMutation()`のラッパーで、fetch の結果を state として提供する。
 *
 * @param pathTemplate - 通信対象のAPIエンドポイントを示す文字列（URL）。
 * @param method - HTTPメソッド名
 * @param options - SWRコンフィグと、必要なら [placeholder, query]。
 * @param options.placeholder - `path`内のプレースホルダーに与える値を設定する。
 * @param options.query - url末尾に queryParams として与える値を設定する。
 * @param options.contentType - 必要なら、HTTP-Header の ContentType を選択できる。デフォルトは `application/json`。
 * @returns SWRMutationHook
 *
 * @example
 * ```
 * const {
 *   data: samples, // 通信結果が入る。
 *   trigger: searchSamples, // 通信を実行する関数。
 * } = useApiMutation("/samples/search", "post");
 * ```
 */
export const useApiMutation
  = <
    Url extends keyof paths,
    Method extends keyof GetNested<paths, [Url]>,
    Placeholder extends GetNested<paths, [Url, Method, "parameters", "path"]>,
    QueryBase extends GetNested<paths, [Url, Method, "parameters", "query"]>,
    Query extends OmitOrNever<QueryBase, "request">,
    Content extends GetNested<paths, [Url, Method, "requestBody", "content"]>,
    ContentType extends keyof NonNullable<Content>,
    ContentTypeOrNeverWhenJsonNotExists extends (
      [GetNested<Content, ["application/json"]>] extends [never]
        ? ContentType
        : never
    ),
    BodyRaw extends GetNested<Content, [ContentType]>,
    Body extends (Method extends "get" ? Query : BodyRaw),
    ResponseMap extends ResponseMapFromSchemaRespopnses<
      GetNested<paths, [Url, Method, "responses"]>
    >,
    Response extends ResponseMap["ok"],
    Error extends ResponseMap["error"],
  >(
    pathTemplate: Url,
    method: Method,
    ...options: (
      ToBeOptionalArgIfNotRequired<
        SWRConfiguration<Response, Error, BareFetcher<Response>>
        & ToRecord<"contentType", ContentTypeOrNeverWhenJsonNotExists, ContentType>
        & ToRecord<"placeholder", Placeholder>
        & ToRecord<"query", Method extends "get" ? never : Query>
        & CommonApiFetchProps
      >
    )
  ) => {
    const [option] = options;
    const contentTypeRaw = (option?.contentType ?? "application/json").toString();
    const contentTypeObj
      // `multipart/form-data` 時は `Content-Type` を設定しない。
      // https://fetch.spec.whatwg.org/#request-class
      = contentTypeRaw === "multipart/form-data"
        ? undefined
        : { "Content-Type": contentTypeRaw };
    const { mutate } = useSWRConfig();
    const { createFetch } = useCommonApiFetch(option ?? {});

    const generateBody = (arg: unknown) => {
      if (contentTypeRaw === "application/json") {
        return JSON.stringify(arg);
      }
      if (contentTypeRaw === "multipart/form-data") {
        // 全項目を Blob として送信。
        // Blob でない値がある場合は、一律 `application/json` に変換する。
        const body = new FormData();
        Object.entries(arg ?? {})
          .forEach(([key, value]) => {
            if (value instanceof Blob) return body.append(key, value);
            const valueJson = JSON.stringify(value);
            const jsonBlob = new Blob([valueJson], { type: "application/json" });
            body.append(key, jsonBlob);
          });
        return body;
      }
      return arg;
    };
    const fetcher = (args: UseApiKeys, { arg }: { arg: unknown }) => {
      const {
        path: pathTemplate,
        placeholder: placeholderMap,
        query: queryMapRaw,
      } = args;
      const queryMap = (
        method === "get"
          ? getDefinedQueriesMap(arg as Record<string, unknown>)
          : queryMapRaw
      ) as Record<string, unknown>;
      const path = getPathFromTemplateAndPlaceholderMap(pathTemplate, placeholderMap);
      const url = getUrlFromPathAndQueryMap(path, queryMap);
      const body = (method === "get" ? undefined : generateBody(arg)) as RequestInit["body"];
      console.log(`useSWRMutation by ${url} [${JSON.stringify(args)}] ${JSON.stringify(arg)}`);
      return createFetch(
        fetch(`${apiBaseUrl}${url}`, {
          method: method.toString(),
          headers: {
            ...contentTypeObj,
          },
          body,
        }),
      )
        .then((it) => {
          mutate(args);
          return it;
        });
    };
    const placeholder = (option?.placeholder ?? {}) as Record<string, unknown>;
    const query = getDefinedQueriesMap(option?.query);
    const keys = FalsyOrFn.map(
      pathTemplate,
      (it) => UseApiKeys.from({
        path: it,
        placeholder,
        query,
      }),
    );

    return useSWRMutation<Response, Error, FalsyOrFn<UseApiKeys>, Body, Response>(
      keys,
      fetcher,
      option as SWRMutationConfiguration<Response, Error, FalsyOrFn<UseApiKeys>, Body, Response>,
    );
  };

export const useApiConfig = () => {
  const config = useSWRConfig();
  return {
    ...config,
    mutate: config.mutate as unknown as ((mutator: (key: UseApiKeys) => boolean) => void),
  };
};

type MutationMethod = Exclude<HttpMethod, "get">;
type MutationPaths =
  {
    [
    Key in keyof paths as paths[Key] extends { [K in MutationMethod]?: unknown }
      ? Key
      : never
    ]: paths[Key]
  };

// 動作確認用、暫定コード port BE local 9200
export const useApiQuery2
  = <
    Url extends keyof QueryPaths,
    Placeholder extends GetNested<QueryPaths, [Url, "get", "parameters", "path"]>,
    QueryBase extends GetNested<QueryPaths, [Url, "get", "parameters", "query"]>,
    Query extends OmitOrNever<QueryBase, "request">,
    ResponseMap extends ResponseMapFromSchemaRespopnses<
      GetNested<QueryPaths, [Url, "get", "responses"]>
    >,
    Response extends ResponseMap["ok"],
    Error extends ResponseMap["error"],
  >(
    path: Url,
    ...options: (
      ToBeOptionalArgIfNotRequired<
        SWRConfiguration<Response, Error, BareFetcher<Response>>
        & ToRecord<"placeholder", Placeholder>
        & ToRecord<"query", Query>
        & CommonApiFetchProps
      >
    )
  ) => {
    const [option] = options;
    const { createFetch } = useCommonApiFetch(option ?? {});
    const fetcher
      = (url: string) =>
        createFetch(
          fetch(`http://localhost:9200/api/v1${url}`, {
            method: "get",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        );
    const url = getUrlFromPathAndPlaceholderMap(
      path,
      option?.placeholder as Record<string, unknown>,
      option?.query,
    );

    return useSWR<Response, Error, string>(url, fetcher, {
      // refreshInterval: 1000,
      ...option as SWRConfiguration<Response, Error, BareFetcher<Response>>,
    });
  };

export const useApiMutationFormData
  = <
    Url extends keyof MutationPaths,
    Method extends keyof GetNested<MutationPaths, [Url]>,
    Placeholder extends GetNested<MutationPaths, [Url, Method, "parameters", "path"]>,
    QueryBase extends GetNested<MutationPaths, [Url, Method, "parameters", "query"]>,
    Query extends OmitOrNever<QueryBase, "request">,
    Body extends GetNested<
      paths,
      [Url, Method, "requestBody", "content", "application/json", "multipart/form-data"]
    >,
    ResponseMap extends ResponseMapFromSchemaRespopnses<
      GetNested<MutationPaths, [Url, Method, "responses"]>
    >,
    Response extends ResponseMap["ok"],
    Error extends ResponseMap["error"],
  >(
    path: Url,
    method: Method,
    ...options: (
      ToBeOptionalArgIfNotRequired<
        SWRConfiguration<Response, Error, BareFetcher<Response>>
        & ToRecord<"placeholder", Placeholder>
        & ToRecord<"query", Query>
        & CommonApiFetchProps
      >
    )
  ) => {
    const [option] = options;
    const { mutate } = useSWRConfig();
    const { createFetch } = useCommonApiFetch(option ?? {});
    const fetcher
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      = (url: string, { arg }: { arg: any }) =>
        createFetch(
          fetch(`http://localhost:9200/api/v1${url}`, {
            method: method.toString(),
            body: arg,
          }),
        )
          .then((it) => {
            if (method === "delete") {
              mutate(url);
            }
            return it;
          });
    const url = getUrlFromPathAndPlaceholderMap(
      path,
      option?.placeholder as Record<string, unknown>,
      option?.query,
    );

    return useSWRMutation<Response, Error, string, Body, Response>(url, fetcher, {
      ...option as SWRMutationConfiguration<Response, Error, string, Body, Response>,
    });
  };

export const useApiMutationPostData
  = <
    Url extends keyof MutationPaths,
    Method extends keyof GetNested<MutationPaths, [Url]>,
    Placeholder extends GetNested<MutationPaths, [Url, Method, "parameters", "path"]>,
    QueryBase extends GetNested<MutationPaths, [Url, Method, "parameters", "query"]>,
    Query extends OmitOrNever<QueryBase, "request">,
    Body extends GetNested<paths, [Url, Method, "requestBody", "content", "application/json"]>,
    ResponseMap extends ResponseMapFromSchemaRespopnses<
      GetNested<MutationPaths, [Url, Method, "responses"]>
    >,
    Response extends ResponseMap["ok"],
    Error extends ResponseMap["error"],
  >(
    path: Url,
    method: Method,
    ...options: (
      ToBeOptionalArgIfNotRequired<
        SWRConfiguration<Response, Error, BareFetcher<Response>>
        & ToRecord<"placeholder", Placeholder>
        & ToRecord<"query", Query>
        & CommonApiFetchProps
      >
    )
  ) => {
    const [option] = options;
    const { mutate } = useSWRConfig();
    const { createFetch } = useCommonApiFetch(option ?? {});

    const fetcher
      = (url: string, { arg }: { arg: unknown }) =>
        createFetch(
          fetch(`http://localhost:9200/api/v1${url}`, {
            method: method.toString(),
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(arg),
          }),
        )
          .then((it) => {
            if (method === "delete") {
              mutate(url);
            }
            return it;
          });
    const url = getUrlFromPathAndPlaceholderMap(
      path,
      option?.placeholder as Record<string, unknown>,
      option?.query,
    );

    return useSWRMutation<Response, Error, string, Body, Response>(url, fetcher, {
      ...option as SWRMutationConfiguration<Response, Error, string, Body, Response>,
    });
  };
//
