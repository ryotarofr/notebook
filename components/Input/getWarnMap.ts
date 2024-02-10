import { ComponentPropsWithoutRef } from "react";

import { Warnings } from "@/components/ui/form/Warnings";
import { Override } from "@/type/Override";

export type WarnMap = Required<ComponentPropsWithoutRef<typeof Warnings>>["warnMap"];
const has = <T, >(it: T) => !!it;
export const getWarnMap = ({
  validities,
  required,
  min,
  max,
  minLength,
  maxLength,
}: Override<
  Pick<
    ComponentPropsWithoutRef<"input">,
    "required" | "min" | "max" | "minLength" | "maxLength"
  >,
  {
    validities?: ValidityStateFlags;
  }
>): WarnMap => {
  const src: WarnMap = {
    required: has(required) && {
      invalid: validities?.valueMissing ?? false,
      message: "入力必須",
    },
    max: has(max) && {
      invalid: validities?.rangeOverflow ?? false,
      message: `${max}以下の数値`,
    },
    min: has(min) && {
      invalid: validities?.rangeUnderflow ?? false,
      message: `${min}以上の数値`,
    },
    maxLength: has(maxLength) && {
      invalid: validities?.tooLong ?? false,
      message: `${maxLength}文字以下`,
    },
    minLength: has(minLength) && {
      invalid: validities?.tooShort ?? false,
      message: `${minLength}文字以上`,
    },
  };
  return Object.fromEntries(
    Object.entries(src)
      .filter(([, value]) => !!value),
  );
};
