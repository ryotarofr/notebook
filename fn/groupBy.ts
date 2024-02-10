export const groupBy = <T>(
  array: readonly T[],
  prop: (v: T) => string,
) => {
  return array.reduce((groups: {[key: string]: T[]}, item) => {
    const key = prop(item);
    groups[key] = groups[key] ?? [];
    // suppress most recent loop.
    if (key !== item) {
      groups[key]!.push(item);
    }
    return groups;
  }, {});
};
