import { useEffect, useState } from "react";

import { partializeSetState } from "@/fn/partializeSetState";

export const useSorted = <T>({
  data,
  initSortOrderMap,
  ascSorterMap,
}: {
  data: T[];
  initSortOrderMap: Record<PropertyKey, Order>;
  ascSorterMap: Record<PropertyKey, (prev: unknown, next: unknown) => number>;
}) => {
  const [sortOrderMap, setSortOrderMap] = useState<Record<PropertyKey, Order>>(initSortOrderMap);
  const getSetSortOrderFromKey = partializeSetState(setSortOrderMap);
  const [indices, setIndices] = useState(data.map((_, index) => index));
  const [sortedData, setSortedData] = useState(data);

  // `sortOrderMap` の更新を検知して `sortedData` を更新する。
  useEffect(() => {
    const withIndex = data
      .map((data, index) => ({
        data,
        index,
      }));
    const sorted = withIndex
      .sort(({ data: prev }, { data: next }) => {
        const entries = Object.entries(sortOrderMap) as [keyof T, unknown][];
        for (const [key, order] of entries) {
          if (order === "none") continue;

          const ascSortResult = ascSorterMap[key](prev[key], next[key]);
          return order === "asc"
            ? ascSortResult
            : ascSortResult * -1;
        }
        return 0;
      });
    setSortedData(sorted.map(({ data }) => data));
    setIndices(sorted.map(({ index }) => index));
  }, [data, sortOrderMap]);

  const setSortOrder
    = (key: keyof T): SetSortOrder =>
      (setter) =>
        typeof setter === "function"
          ? getSetSortOrderFromKey(key as string)(
            (prev) => setter({
              prev,
              getPrev: (current: Order) => getShiftedOrder(current, -1),
              getNext: (current: Order) => getShiftedOrder(current,  1),
            }),
          )
          : getSetSortOrderFromKey(key as string)(setter);

  return {
    sortedData,
    sortedDataIndices: indices,
    sortOrderMap: sortOrderMap as Record<keyof T, Order>,
    setSortOrder,
  };
};

const orders = ["none", "asc", "desc"] as const;
type Order = typeof orders[number];
export type { Order as SortOrder };
export type SetSortOrder =
  (setter: Order
    | ((args: {
      prev: Order;
      getPrev: (order: Order) => Order;
      getNext: (order: Order) => Order;
    }) => Order),
  ) => void;

export const getShiftedOrder = (current: Order, shift: number): Order => {
  const nextIndexRaw = orders.indexOf(current) + shift;
  const nextIndex = nextIndexRaw % orders.length;
  return orders[nextIndex] as Order;
};
