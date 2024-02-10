/**
 * 生HTMLElementとquerySelectorを基にフォーカスコントロール用の関数を提供するHook
 */
export const useFocusRef = (
  rootElement: HTMLElement | null,
  options: {
    treeOuterQuery?: string;
    targetQuery: string;
  },
) => {
  const hasOuterQuery = !!options.treeOuterQuery;
  const targetQuery = options.treeOuterQuery ?? options.targetQuery;

  /**
   * フォーカス**実行**対象の要素を取得
   */
  const getTarget = (target?: HTMLElement) => {
    return hasOuterQuery
      ? target?.querySelector(options.targetQuery) as HTMLElement
      : target;
  };

  /**
   * フォーカス対象の要素のリストを取得
   * 引数に与えたelement配下のみに絞り込まれる。
   */
  const getTargets = (
    element: HTMLElement | null = rootElement,
  ): HTMLElement[] =>
    Array.from(element!.querySelectorAll(targetQuery))
      .filter((it): it is HTMLElement => it.checkVisibility());

  /** 現在フォーカス中の要素を取得 */
  const getCurrent = (): HTMLElement | null => {
    const focused = document.activeElement as HTMLElement | null;
    if (!focused) return null;
    return getTargets().find((it): it is HTMLElement => getTarget(it) === focused) ?? null;
  };

  /** 祖先要素のリストを取得 自身を除いた、近い順 */
  const getAncestors = (target: HTMLElement | null): HTMLElement[] => {
    const [, ...ancestors] = getTargets()
      .filter((it) => it.contains(target))
      .reverse();
    return ancestors;
  };
  /** 親要素を取得 */
  const getParent = (target: HTMLElement | null): HTMLElement | undefined => {
    const ancestors = getAncestors(target);
    const parent = ancestors[0];
    return parent;
  };
  /** 兄弟要素のリストを取得 */
  const getSiblings = (target: HTMLElement | null): HTMLElement[] => {
    const parent = getParent(target);
    const siblings = getTargets(parent)
      .filter((it, _, array) => {
        const ancestors = getAncestors(it);
        return !ancestors.find((it) => array.includes(it));
      });
    return siblings;
  };

  const getFocusedIndex = (targets: HTMLElement[]) =>
    targets
      .findIndex((it) => getCurrent() === it);
  const getNextFocusTarget = (targets: HTMLElement[]) => {
    const focusedIndex = getFocusedIndex(targets);
    const nextFocusTarget = targets[focusedIndex + 1] ?? targets[0];
    return nextFocusTarget;
  };
  const getPrevFocusTarget = (targets: HTMLElement[]) => {
    const focusedIndex = getFocusedIndex(targets);
    const prevFocusTarget = targets[focusedIndex - 1] ?? targets[targets.length - 1];
    return prevFocusTarget;
  };
  const focus = (target?: HTMLElement) => {
    const focusTarget = hasOuterQuery
      ? target?.querySelector(options.targetQuery) as HTMLElement
      : target;
    focusTarget?.focus();
    // focusTarget?.scrollIntoView();
  };

  const focusNext = () => {
    const targets = getTargets();
    const nextFocusTarget = getNextFocusTarget(targets);
    focus(nextFocusTarget);
  };
  const focusPrev = () => {
    const targets = getTargets();
    const prevFocusTarget = getPrevFocusTarget(targets);
    focus(prevFocusTarget);
  };

  const focusNextSibling = () => {
    const current = getCurrent();
    const siblings = getSiblings(current);
    const nextFocusTarget = getNextFocusTarget(siblings);
    focus(nextFocusTarget);
  };
  const focusPrevSibling = () => {
    const current = getCurrent();
    const siblings = getSiblings(current);
    const prevFocusTarget = getPrevFocusTarget(siblings);
    focus(prevFocusTarget);
  };

  const focusParent = () => {
    const current = getCurrent();
    const parent = getParent(current);
    focus(parent);
  };

  return {
    // current: focused,
    // set: setFocused,
    next: focusNext,
    nextSibling: focusNextSibling,
    prev: focusPrev,
    prevSibling: focusPrevSibling,
    parent: focusParent,
  };
};
