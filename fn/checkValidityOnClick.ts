import { MouseEvent } from "react";

/**
 * onClickなどのマウスイベントを基に、親フォームがvalidであることをチェックする関数。
 */
export const checkValidityOnClick = <
  Element extends { form: HTMLFormElement | null },
  Event extends MouseEvent<Element, unknown>
>(event: Event) => {
  event.preventDefault();
  const form = event.currentTarget.form;
  if (!form) {
    console.error("form not found.");
    return true;
  }
  return form.checkValidity();
};
