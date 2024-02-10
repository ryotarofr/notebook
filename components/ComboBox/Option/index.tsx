import clsx from "clsx";
import { useRef, useEffect } from "react";

import styles from "./Option.module.scss";

/**
 * 選択肢
 */
export const Option = ({
  dataKey,
  value,
  focused,
  selected,
  setCurrentKey,
  setFocused,
  setFocusedOption,
  setFocusFn,
}: {
  dataKey: string;
  value: string;
  focused: boolean;
  selected: boolean;
  setCurrentKey: (dataKey: string) => void;
  setFocused: (focused: boolean) => void;
  setFocusedOption: (dataKey: string) => void;
  setFocusFn: (focusFn: () => () => void) => void;
}) => {
  const shiftOnFocus = -20;
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const focusFn = () => {
      const rect = element.getBoundingClientRect();
      const parentRect = element.parentElement?.getBoundingClientRect();
      const scrolledHeight = element.parentElement?.scrollTop ?? 0;
      if (!parentRect) return;
      const scrollTo = rect.top + scrolledHeight - parentRect.top + shiftOnFocus;
      element.parentElement?.scrollTo({
        top: scrollTo,
      });
    };
    setFocusFn(() => focusFn);
  }, [ref]);

  return (
    <li
      ref={ref}
      className={clsx(
        styles.Option,
        focused && styles.Focused,
        selected && styles.Selected,
      )}
      onPointerDown={() => {
        setCurrentKey(dataKey);
        setFocused(false);
      }}
      onMouseOver={() => setFocusedOption(dataKey)}
    >{value}</li>
  );
};
