import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { RouteObject, useLocation, matchRoutes } from "react-router-dom";

import { getContextDefaultValueFactory } from "@/fn/getContextDefaultValueFactory";
import { Page } from "@/type/Pages";

const noImpl = getContextDefaultValueFactory("SnwPagesProvider");

export type SnwPagesNavigationMode = "allow" | "warn" | "deny";
type SnwPagesContextProps = {
  get: () => Page[];
  currentRoutePath: string;
  navigationMode: SnwPagesNavigationMode;
  /**
   * `<Navigation/>`(画面左部)によるページ遷移の可否をコントロールする。
   *
   * "allow" - 遷移を許可する。
   * "warn" - 遷移の前に警告を出す。
   * "deny" - 遷移は不可。
   */
  setNavigationMode: Dispatch<SetStateAction<SnwPagesNavigationMode>>;
};
/**
 * ページ情報[取得,保持] コンテキスト
 */
export const SnwPagesContext = createContext<SnwPagesContextProps>({
  get: noImpl("get()"),
  currentRoutePath: "",
  navigationMode: "deny",
  setNavigationMode: noImpl("setNavigationMode()"),
});

/**
 * ページ情報[取得,保持] コンテキストプロバイダー
 */
export const SnwPagesProvider = ({
  pages,
  routes,
  children,
}: {
  pages: Page[];
  routes: RouteObject[];
  children: ReactNode;
}) => {
  const location = useLocation();
  const matchedRoutes = matchRoutes(routes, location);
  const currentRoutePath = matchedRoutes?.reverse().find(() => true)?.route.path ?? "";
  const [navigationMode, setNavigationMode] = useState<SnwPagesNavigationMode>("allow");
  useEffect(() => setNavigationMode("allow"), [location]);

  return (
    <SnwPagesContext.Provider
      value={{
        get: () => pages,
        currentRoutePath,
        navigationMode,
        setNavigationMode,
      }}
    >
      {children}
    </SnwPagesContext.Provider>
  );
};

/**
 * ページ情報[取得,保持] をコンテキストから取得
 */
export const useSnwPages = () => useContext(SnwPagesContext);
