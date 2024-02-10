import clsx from "clsx";
import {
  ComponentPropsWithRef,
  ReactNode,
  useEffect,
  useId,
  useState,
} from "react";

import { Input } from "@/components/ui/form/Input";
import { getMappedObject } from "@/fn/getMappedObject";
import { partializeSetState } from "@/fn/partializeSetState";
import { Override } from "@/type/Override";

import styles from "./ComboBox.module.scss";
import { Option } from "./Option";

/**
 * コンボボックス
 *
 * デフォルトでは、選択肢に一致する入力以外はバリデーション後に弾かれる。<br>
 * ※ この時、直前の有効な入力が保持される。（ form の状態としては invalid なため、 submit は防止できる）
 */
export const ComboBox = <
  T extends Record<string, string>,
  FreeInput extends boolean,
  Value extends ((FreeInput extends true ? string : keyof T) | undefined)
>({
  suggestions,
  value: currentKey,
  setValue,
  freeInput,
  filterable = false,
  children,
  ...wrappedProps
}: Override<
  /** root要素に渡す */
  Omit<ComponentPropsWithRef<typeof Input>, "type">,
  {
    /**
     * 補完候補とラベルのMap
     */
    suggestions: T;
    /** 入力値 */
    value: Value;
    /** 入力結果を取得 */
    setValue: (input: Value) => void;
    /**
     * `true`なら入力による絞り込みが可能。
     * デフォルトは`false`。
     */
    filterable?: boolean;
    /**
     * 自由入力 trueなら、補完候補以外の入力値を許容する
     * @defaultValue false
     */
    freeInput?: FreeInput;
  }
>): ReactNode => {
  const datalistId = useId();
  const required = wrappedProps.required;
  const readOnly = wrappedProps.readOnly;

  const keys: (keyof T)[] = Object.keys(suggestions);
  const findKey = (value: string): Value => {
    return keys.find((key) => suggestions[key] === value) as Value;
  };
  const findValueOr = (key?: Value): string => {
    if (key === undefined) return "";
    return suggestions[key]?.toString() ?? key.toString();
  };

  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [rawInput, setRawInput] = useState<string>(findValueOr(currentKey));

  // 描画選択肢と選択中の状態
  const [options, setOptions] = useState(Object.entries(suggestions));
  useEffect(() => setOptions(Object.entries(suggestions)), [suggestions]);
  const [focused, setFocused] = useState<boolean>(false);

  // 選択肢表示時に選択中要素までスクロール
  const [optionsFocusFns, _setOptionsFocusFns] = useState<Record<string, () => void>>(
    getMappedObject(suggestions, () => () => console.error("focus fnction don't initialized.")),
  );
  const setOptionsFocusFns = partializeSetState(_setOptionsFocusFns);
  useEffect(() => {
    focused
    && currentKey
    && optionsFocusFns?.[currentKey as string]?.();
  }, [focused]);

  const [focusedOption, setFocusedOption] = useState<Value>();
  const focusNext = () => {
    const currentIndex = options.findIndex(([key]) => key === focusedOption);
    const nextIndex = currentIndex + 1;
    const next = options[nextIndex]?.[0] ?? options[0]?.[0];
    if (next === undefined) return;
    setFocusedOption(next as Value);
    optionsFocusFns[next]?.();
  };
  const focusPrev = () => {
    const currentIndex = options.findIndex(([key]) => key === focusedOption);
    const prevIndex
      = currentIndex === -1 || currentIndex === 0
        ? options.length - 1
        : currentIndex - 1;
    const prev = options[prevIndex]?.[0];
    if (prev === undefined) return;
    setFocusedOption(prev as Value);
    optionsFocusFns[prev]?.();
  };

  // 選択肢のソート
  useEffect(() => {
    if (!filterable) return;
    const input = rawInput;
    const inputWithoutCase = input.toLocaleLowerCase();
    const options = Object.entries(suggestions);
    setOptions(
      options
        .sort()
        .sort(([, prevValue], [, nextValue]) =>
          sortWithIncludes(prevValue, nextValue)(inputWithoutCase))
        .sort(([, prevValue], [, nextValue]) =>
          sortWithIncludes(prevValue, nextValue)(input))
        .sort(([, prevValue], [, nextValue]) =>
          sortWithStartsWith(prevValue, nextValue)(inputWithoutCase))
        .sort(([, prevValue], [, nextValue]) =>
          sortWithStartsWith(prevValue, nextValue)(input)),
    );
  }, [rawInput, suggestions, filterable]);

  return (
    <Input
      data-testid="combobox"
      {...wrappedProps}
      className={clsx(
        styles.ComboBox,
        wrappedProps.className,
      )}
      containerProps={{
        ...wrappedProps.containerProps,
        onFocus: () => setFocused(true),
      }}
      type="text"
      list={datalistId}
      value={findValueOr(currentKey)}
      setValue={(value) => {
        const key = findKey(value);
        if (key !== undefined) {
          setValue(key);
          return;
        }
        if (!required && value === "") {
          setValue(undefined as Value);
          return;
        }
        if (!freeInput) return;
        return setValue(key ?? value as Value);
      }}
      readOnly={readOnly || filterable ? readOnly : "trueWithoutLabel"}
      setRawValue={setRawInput}
      setRef={setInputRef}
      customValidations={{
        suggestionContainValue: {
          message: "選択肢に無い値は無効です",
          checkIsInvalid: (value) => {
            if (value === "" && !required) return;
            if (freeInput) return;
            const key = findKey(value);
            if (key !== undefined) return;
            return true;
          },
        },
      }}
      onKeyDown={(event) => {
        switch (event.key) {
        case "Escape":
          setFocused(false);
          break;
        case "ArrowUp":
          focusPrev();
          break;
        case "ArrowDown":
          focusNext();
          break;
        case "Enter":
          setValue(focusedOption as Value);
          setFocused((prev) => !prev);
          break;
        case "Tab":
          setFocused(false);
        }
      }}
    >
      <div
        className={styles.ComboBoxThumb}
        onClick={() => {
          setFocused((prev) => {
            inputRef?.focus();
            return !prev;
          });
        }}
      >{focused ? "▲" : "▼"}</div>
      <ul
        className={clsx(
          styles.DataList,
          !focused && styles.Hidden,
        )}
      >
        {options
          .map(([key, value]) =>
            <Option
              key={key}
              dataKey={key}
              value={value}
              focused={key === focusedOption}
              selected={key === currentKey}
              setCurrentKey={(it) => !readOnly && setValue(it as Value)}
              setFocused={setFocused}
              setFocusedOption={(it) => setFocusedOption(it as Value)}
              setFocusFn={setOptionsFocusFns(key)}
            />,
          )
        }
      </ul>
      {children}
    </Input>
  );
};

const sortWithStartsWith
  = (prev: string, next: string) =>
    (input: string) =>
      next.startsWith(input) || !prev.startsWith(input)
        ? 1 : -1;
const sortWithIncludes
  = (prev: string, next: string) =>
    (input: string) =>
      next.includes(input) || !prev.includes(input)
        ? 1 : -1;
