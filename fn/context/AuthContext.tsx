import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSWRConfig } from "swr";

import { ButtonCancel } from "@/components/ui/ButtonCancel";
import { getContextDefaultValueFactory } from "@/fn/getContextDefaultValueFactory";
import { useApiMutation, useApiQuery } from "@/fn/state/useApi";
import Skic10000 from "@/pages/skic10000";

type User = {
  id: string;
  displayName: string;
};
const noImpl = getContextDefaultValueFactory("AuthProvider");

type AuthContextProps = {
  /** ログイン済みユーザー情報 */
  authUser: () => User | undefined;
  /** ログインフォームを表示する */
  showSignInForm: () => void;
  /** ログインフォーム経由済みを記録する */
  passSignInForm: () => void;
  /** ログアウトを行う */
  signOut: () => Promise<void>;
  /** 疑似ログインを行う */
  debugSignIn: () => void;
};
/**
 * ログイン済みユーザー情報[取得,保持] コンテキスト
 */
export const AuthContext = createContext<AuthContextProps>({
  authUser: noImpl("authUser()"),
  showSignInForm: noImpl("showSignInForm()"),
  passSignInForm: noImpl("passSignInForm()"),
  signOut: noImpl("signOut()"),
  debugSignIn: noImpl("debugSignIn()"),
});

/**
 * ログイン済みユーザー情報[取得,保持] コンテキストプロバイダー
 */
export const AuthProvider = ({
  children,
  hidden = false,
}: {
  children: ReactNode;
  hidden?: boolean;
}) => {
  const { mutate } = useSWRConfig();
  const { data, isLoading, error } = useApiQuery("/sessiones/me");
  const { trigger: _signOut } = useApiMutation("/sessiones/me", "delete");

  const [debugSignedIn, setDebugSignedIn] = useState(hidden);
  const [signInFormIsHidden, setSignInFormIsHidden] = useState(hidden);
  const [passedSignInScreen, setPassedSignInScreen] = useState(false);

  const signOut = async () => {
    if (debugSignedIn) {
      setDebugSignedIn(false);
      return;
    }
    await _signOut()
      .then(clearApiCache);
  };

  // ログインフォーム表示判定
  useEffect(() => {
    // ログインフォームの表示が不要の設定なら表示しない
    if (hidden) {
      console.log("AuthContext _ props.hidden: true");
      setSignInFormIsHidden(true);
      return;
    }

    // ログインフォームを経由していないと判断できる場合はログインフォームを表示
    // ※ 複数タブ表示の防止のための実装
    if (!import.meta.env.DEV
        && !passedSignInScreen) {
      console.log("AuthContext _ passedSignInScreen: false");
      setSignInFormIsHidden(false);
      return;
    }

    // デバッグサインイン判定がある際はここではログイン済みと判断し、ログインフォームを表示しない
    if (import.meta.env.DEV
        && debugSignedIn) {
      console.log("AuthContext _ debugSignedIn: true");
      setSignInFormIsHidden(true);
      return;
    }

    // 認証データを取得できなければログインフォームを表示する。
    // また、認証データ取得後はログインフォームを閉じる。
    if (data === undefined) {
      setSignInFormIsHidden(false);
      return;
    }
    setSignInFormIsHidden(true);
  }, [data, debugSignedIn]);

  const clearApiCache
      = () => mutate(
        () => true,
        undefined,
        { revalidate: true },
      );

  const inInitLoading = !data && !error && isLoading;
  if (inInitLoading) return (
    <p>Loading...</p>
  );

  return (
    <AuthContext.Provider
      value={{
        authUser: () => data,
        showSignInForm: () => setSignInFormIsHidden(false),
        passSignInForm: () => setPassedSignInScreen(true),
        signOut,
        debugSignIn: () => {
          setDebugSignedIn(true);
          setPassedSignInScreen(true);
        },
      }}
    >
      <RenderSwitch
        data={data}
        passedSignInScreen={passedSignInScreen}
        signInFormIsHidden={signInFormIsHidden}
        signOut={signOut}
        debugSignedIn={debugSignedIn}
      >{children}</RenderSwitch>
    </AuthContext.Provider>
  );
};

/**
 * ログインフォーム等を表示する必要がないことを確認できてから初めて、子要素を描画する
 */
const RenderSwitch = ({
  passedSignInScreen,
  data,
  signOut,
  signInFormIsHidden,
  debugSignedIn,
  children,
}: {
  passedSignInScreen: boolean;
  data: User | undefined;
  signOut: () => void;
  signInFormIsHidden: boolean;
  debugSignedIn: boolean;
  children: ReactNode;
}) => {
  // ログインフォーム
  if (!passedSignInScreen
    && data !== undefined) {
    return (
      <section>
        <h1>既にログイン済みです。</h1>
        <ButtonCancel
          onClick={() => signOut()}
        >ログアウト</ButtonCancel>
      </section>
    );
  }

  const authenticated
    = signInFormIsHidden
    && data !== undefined;
  if (authenticated || debugSignedIn) {
    return children;
  }

  return <Skic10000 />;
};

/**
 * ログイン済みユーザー情報[取得,保持] をコンテキストから取得
 */
export const useAuth = () => useContext(AuthContext);
