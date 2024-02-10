import clsx from "clsx";
import {
  ChangeEventHandler,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import CrossIcon from "@/assets/icon/cross.svg?react";
import ResetIcon from "@/assets/icon/reset.svg?react";
import { Label } from "@/components/ui/form/Label";
import { Warnings } from "@/components/ui/form/Warnings";
import { ToolTip } from "@/components/ui/ToolTip";
import { getMappedObject } from "@/fn/getMappedObject";
import { Override } from "@/type/Override";

import { WarnMap, getWarnMap } from "./getWarnMap";
import styles from "./Input.module.scss";

/**
 * 入力欄のスタイル統一と挙動実装のための汎用`<input />`ラッパー。
 */
export const Input = ({
  label,
  value,
  setValue,
  setRawValue,
  setRef,
  children,
  containerProps,
  stretch = false,
  simplified = false,
  suppressWheelPropergation = false,
  showClearButton: propsShowClearButton = true,
  customValidations,
  readOnly = false,
  ...wrappedProps
}: Override<
  /** `<input />`要素に渡すAttributes */
  ComponentPropsWithRef<"input">,
  {
    /** 入力タイプ */
    type: Required<ComponentPropsWithoutRef<"input">>["type"];
    /** ラベル */
    label?: string;
    /** 現在の値 */
    value?: string;
    /** 入力値を利用する関数 */
    setValue?: (input: string) => void;
    /** 生の入力値(バリデーション無し)を利用する関数 */
    setRawValue?: (currentInput: string) => void;
    /** `ref`を提供する関数 */
    setRef?: (ref: HTMLInputElement | null) => void;
    /** 子要素 */
    children?: ReactNode;
    /** 外縁要素に渡すAttributes */
    containerProps?: ComponentPropsWithoutRef<"fieldset">;
    /** trueなら入力に合わせてリサイズ */
    stretch?: boolean;
    /** trueなら簡略化表示 */
    simplified?: boolean;
    /** trueならマウスホイールでページ全体が動かないようになる */
    suppressWheelPropergation?: boolean;
    /** trueならクリアボタンを表示 */
    showClearButton?: boolean;
    /** カスタムバリデーション */
    customValidations?: Record<string, {
      message: string;
      checkIsInvalid: (value: string) => boolean | undefined;
      displayedOnlyWhenInvalid?: boolean;
    }>;
    /**
     * `true`なら読込専用。`"trueWithoutLabel"`の際は描画には反映しない。
     * デフォルトは`false`。
     */
    readOnly?: boolean | "trueWithoutLabel";
  }
>): ReactNode => {
  const inputId = useId();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => setRef?.(ref.current), [ref, setRef]);
  const defaultWarnMap = useCallback(() => {
    const defaultWarnMap: WarnMap = getWarnMap({
      ...wrappedProps,
      validities: ref.current?.validity,
    });
    return defaultWarnMap;
  }, [ref]);

  const [currentValue, setCurrentValue] = useState<string>(value ?? "");
  useEffect(() => setCurrentValue(value ?? ""), [value]);
  useEffect(() => setRawValue?.(currentValue), [setRawValue, currentValue]);

  const warnMap = useCallback(() => {
    const customWarnMap: WarnMap = getMappedObject(
      customValidations ?? {},
      ([, { message, checkIsInvalid }]) => ({
        invalid: checkIsInvalid(currentValue) ?? false,
        message,
      }),
    );
    return {
      ...defaultWarnMap(),
      ...customWarnMap,
    };
  }, [customValidations, currentValue]);
  useEffect(() => {
    const hasInvalid
      = !!Object.values(warnMap())
        .find((it) => {
          if (!it) return;
          return it.invalid;
        });
    ref.current?.setCustomValidity(hasInvalid ? "has invalid." : "");
    if (hasInvalid) return;
    setValue?.(currentValue);
  }, [currentValue]);

  const suppressScroll = (event: Event) =>
    event.stopPropagation();
  const conatinerRef = useRef<HTMLFieldSetElement>(null);
  useEffect(() => {
    if (!suppressWheelPropergation) return;
    const ref = conatinerRef.current;
    if (!ref) return;
    ref.addEventListener("wheel", suppressScroll, { passive: false });
    return () => ref.removeEventListener("wheel", suppressScroll);
  }, [suppressWheelPropergation, conatinerRef]);

  const clearValue = () => setCurrentValue("");
  const showClearButton
    = propsShowClearButton
      && readOnly !== true
      && currentValue != null
      && currentValue !== ""
      && label;
  const resetValue = () => setCurrentValue(wrappedProps.defaultValue?.toString() ?? value ?? "");
  const showResetButton
    = value
      && readOnly !== true
      && currentValue !== value;

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    wrappedProps.onChange?.(event);
    const target = event.currentTarget;
    setCurrentValue?.(target.value);
  };

  return (
    <fieldset
      {...containerProps}
      data-testid="inputRoot"
      ref={conatinerRef}
      className={clsx(
        styles.Input,
        simplified && styles.Simplified,
        containerProps?.className,
      )}
    >
      {!simplified
        && <>
          <Label
            htmlFor={inputId}
            className={clsx(
              styles.Label,
            )}
            required={!!warnMap().required}
            readOnly={readOnly === true}
          >{label}</Label>
          <button
            type="button"
            className={clsx(
              styles.ValueControllButton,
              !showClearButton && styles.Hidden,
            )}
            onClick={clearValue}
          >
            <CrossIcon />
          </button>
          <button
            type="button"
            className={clsx(
              styles.ValueControllButton,
              !showResetButton && styles.Hidden,
            )}
            onClick={resetValue}
          >
            <ResetIcon />
          </button>
        </>
      }
      <div
        className={styles.InputContainer}
      >
        {stretch
          && <div
            className={styles.InputSizeDetector}
            data-placeholder={wrappedProps.placeholder}
          >{currentValue}</div>
        }
        <input

          data-testid={"rawInput"}
          {...wrappedProps}
          ref={ref}
          id={inputId}
          value={currentValue}
          className={clsx(
            styles.RawInput,
            stretch && styles.Stretch,
            simplified && styles.Simplified,
            wrappedProps.className,
          )}
          readOnly={!!readOnly}
          onChange={onChange}
        />
        <ToolTip
          simplified={true}
          className={styles.ToolTip}
          open={Object.keys(warnMap()).length !== 0}
        >
          <Warnings
            warnMap={warnMap()}
          />
        </ToolTip>
        {children}
      </div>
    </fieldset>
  );
};

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;        // remember to make these attributes optional....
    webkitdirectory?: string;
  }
}
