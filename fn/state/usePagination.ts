import { useState } from "react";

import { partializeSetStateDeep } from "@/fn/partializeSetState";

type Offset = number;
export type Pagination = {
  offset: Offset;
  limit: number;
};

export const usePagination = ({
  init,
  dataLength,
  disabled = false,
}: {
  init: Pagination;
  dataLength: number;
  disabled?: boolean;
}) => {
  const [pagination, setPagination] = useState<Pagination>(init);
  const _setOffset = partializeSetStateDeep(setPagination)("offset");
  const setLimit = partializeSetStateDeep(setPagination)("limit");
  const getPaginated = <T, >(data: T[]) => {
    if (disabled) return data;
    const offset = pagination.offset;
    const limit = pagination.limit;
    const paginated = data.slice(offset, offset + limit);
    return paginated;
  };

  const offset = pagination.offset;
  const limit = pagination.limit;
  const nextOffset = offset + limit;
  const currentPage = Math.ceil(nextOffset / limit);
  const min = 1;
  const max = Math.ceil(dataLength / pagination.limit);

  const setOffset = (
    setter: Offset
      | ((args: {
        prev: Offset;
        getPrev: (prev: Offset) => Offset;
        getNext: (prev: Offset) => Offset;
        getMin: () => Offset;
        getMax: () => Offset;
      }) => Offset),
  ) => {
    const getMin = () => 0;
    const getMax = () => (max - 1) * pagination.limit;
    return typeof setter === "function"
      ? _setOffset(
        (prev) => setter({
          prev,
          getPrev: (prev: Offset) => Math.max(getMin(), prev - pagination.limit),
          getNext: (prev: Offset) => Math.min(prev + pagination.limit, getMax()),
          getMin,
          getMax,
        }),
      )
      : _setOffset(setter);
  };

  return {
    disabled,
    offset: pagination.offset,
    limit: pagination.limit,
    getPaginated,
    nextOffset,
    current: currentPage,
    min,
    max,
    set: setPagination,
    setLimit,
    setOffset,
  };
};
