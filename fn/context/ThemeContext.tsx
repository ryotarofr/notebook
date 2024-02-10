import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Style } from "react-head";

import { getContextDefaultValueFactory } from "@/fn/getContextDefaultValueFactory";
import { Calc } from "@/fn/objCalc";
import { Hsl } from "@/type/Hsl";

export type ColorScheme = {
  main: Hsl;
  background: Hsl;
  emphasis: Hsl;
  emphasisMain: Hsl;
  warn: Hsl;
  warnMain: Hsl;
  light: Hsl;
  dark: Hsl;
  mode: Hsl;
};
const noImpl = getContextDefaultValueFactory("ThemeProvider");

const themes = {
  default: {
    colors: {
      main: Hsl.fromHsl(0, 0, 14),
      background: Hsl.fromHsl(120, 100, 96),
      emphasis: Hsl.fromHsl(228, 98, 44),
      warn: Hsl.fromHsl(0, 100, 50),
    },
  },
  readonly: {
    colors: {
      main: Hsl.fromHsl(0, 0, 14),
      background: Hsl.fromHsl(30, 100, 90),
      emphasis: Hsl.fromHsl(24, 84, 50),
      warn: Hsl.fromHsl(0, 100, 50),
    },
  },
  dev: {
    colors: {
      main: Hsl.fromHsl(0, 0, 14),
      background: Hsl.fromHsl(0, 0, 87),
      emphasis: Hsl.fromHsl(210, 100, 30),
      warn: Hsl.fromHsl(0, 100, 50),
    },
  },
} as const;
type Theme = keyof typeof themes;

type Props = {
  map: typeof themes;
  current: Theme;
  set: Dispatch<SetStateAction<Theme>>;
  isDarkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  colors: ColorScheme;
};
const initProps: Props = {
  map: themes,
  current: "default",
  set: noImpl("set()"),
  isDarkMode: false,
  setDarkMode: noImpl("setDarkMode()"),
  colors: {} as ColorScheme,
};

/**
 * テーマ色情報 コンテキスト
 */
export const ThemeContext = createContext<Props>(initProps);

export const ThemeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [theme, setTheme] = useState<Theme>(initProps.current);
  const [isDarkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const checkDarkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(checkDarkModeMediaQuery.matches);
    const setDarkModeListener = (event: MediaQueryListEvent) => {
      setDarkMode(event.matches);
    };
    checkDarkModeMediaQuery.addEventListener("change", setDarkModeListener);
    return () => checkDarkModeMediaQuery.removeEventListener("change", setDarkModeListener);
  }, []);

  const colors = ((): ColorScheme => {
    const base = themes[theme].colors;
    const modeColor = isDarkMode ? Hsl.min() : Hsl.max();
    const axis: (keyof Hsl)[] = isDarkMode ? ["lightness"] : [];
    // 少量の色を残すための最低値。輝度が低すぎて黒色になるのを防止する。
    const bgMin = Hsl.fromHsl(0, 0, 6);
    return {
      main: Hsl.getInversed(base.main, axis),
      background: Calc.max(Hsl.getInversed(base.background, axis), bgMin),
      emphasis: Hsl.getInversed(base.emphasis, []),
      emphasisMain: base.background,
      warn: base.warn,
      warnMain: base.background,
      light: base.background,
      dark: base.main,
      mode: modeColor,
    };
  })();

  return (
    <ThemeContext.Provider
      value={{
        map: initProps.map,
        current: theme,
        set: setTheme,
        isDarkMode,
        setDarkMode,
        colors,
      }}
    >
      <Style>{`
        :root {
          ${getColorCssVariables("main", colors.main)}
          ${getColorCssVariables("bg", colors.background)}
          ${getColorCssVariables("em", colors.emphasis)}
          ${getColorCssVariables("em-main", colors.emphasisMain)}
          ${getColorCssVariables("light", colors.light)}
          ${getColorCssVariables("dark", colors.dark)}
          ${getColorCssVariables("mode", colors.mode)}
          ${getColorCssVariables("warn", colors.warn)}
          ${getColorCssVariables("warn-main", colors.warnMain)}

          color-scheme: ${isDarkMode ? "dark" : "light"}
        }
      `}</Style>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * テーマ色情報をコンテキストから取得
 */
export const useTheme = () => useContext(ThemeContext);

const getColorCssVariables = (key: string, color: Hsl) => {
  return `
    --hsl-${key}-h: ${color.hue}deg;
    --hsl-${key}-s: ${color.saturation}%;
    --hsl-${key}-l: ${color.lightness}%;
    --color-${key}-hsl: var(--hsl-${key}-h), var(--hsl-${key}-s), var(--hsl-${key}-l);
    --color-${key}: hsl(var(--color-${key}-hsl));
  `;
};
