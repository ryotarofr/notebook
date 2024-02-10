import { useState, Dispatch, SetStateAction } from "react";

import { groupBy } from "@/fn/groupBy";
import { partializeSetStateDeep } from "@/fn/partializeSetState";

/**
 * チェック状態ツリー管理用StateHook
 * 雑な実装により余分な再レンダリングが行われる問題があるかもしれない。
 */
export const useCheckedTree = (tree: {
  id: string;
  parentId: string;
}[]) => {
  const grouped = groupBy(tree, (it) => it.parentId);
  const [rawCheckedMap, setCheckedMap] = useState<Record<string, boolean>>(
    Object.fromEntries(tree.map((it) => ([it.id, false]))),
  );
  const checkedMap = Object.fromEntries(
    tree.map((it, index) => {
      const key = it.id;
      const rec = (key: string, before: boolean): boolean | "indeterminate" => {
        const children = grouped[key];
        const isLeaf = children === undefined;
        if (isLeaf) return rawCheckedMap[key] ?? (() => {
          // 初回のみ未登録ステートを更新 雑ポイント
          index === 0 && partializeSetStateDeep(setCheckedMap)(key)(before);
          return before;
        })();
        const checkeds = children.map((it) => rec(it.id, rawCheckedMap[key] ?? before));
        const allChecked = checkeds
          .filter((it) => it === true)
          .length === children.length;
        const allUnchecked = checkeds
          .filter((it) => !it)
          .length === children.length;
        const next = allChecked
          ? true
          : allUnchecked
            ? false
            : "indeterminate";
        return next;
      };
      return [key, rec(key, !!rawCheckedMap[key])];
    }),
  );

  const setChecked = (key: string): Dispatch<SetStateAction<boolean>> => {
    const children = grouped[key];
    if (!children) return partializeSetStateDeep(setCheckedMap)(key);
    const prev = checkedMap[key] === true;
    return (setter) => {
      const next = typeof setter === "function" ? setter(prev) : setter;
      children.map((it) => it.id)
        .forEach((id) => setChecked(id)(next));
    };
  };

  return {
    get: checkedMap,
    set: setChecked,
    rawGet: rawCheckedMap,
  };
};
