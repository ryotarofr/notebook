import { DependencyList, PointerEvent, useEffect, useState } from "react";

type Pointer =
  PointerEvent
  & {
    offsetX: number;
    offsetY: number;
  };
type Pointers = Pointer[];
export const usePointers = (
  effect: (pointers: Pointers) => void,
  deps?: DependencyList,
) => {
  const [pointers, setPointers] = useState<Pointers>([]);
  useEffect(() => effect(pointers), [pointers, ...deps ?? []]);

  const getPointerFromEvent = (event: PointerEvent) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    return {
      ...event,
      offsetX: event.clientX - targetRect.left,
      offsetY: event.clientY - targetRect.top,
    };
  };

  return {
    get: pointers,
    set: {
      state: setPointers,
      getEventListeners: () => ({
        onPointerDown: (event: PointerEvent) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          const pointer = getPointerFromEvent(event);
          setPointers((prev) => ([...prev, pointer]));
        },
        onPointerMove: (event: PointerEvent) => {
          const pointer = getPointerFromEvent(event);
          setPointers((prev) => prev.map((it) =>
            it.pointerId !== pointer.pointerId
              ? it
              : pointer,
          ));
        },
        onPointerUp: (event: PointerEvent) => {
          setPointers((prev) => prev.filter((it) =>
            it.pointerId !== event.pointerId,
          ));
        },
      }),
    },
  };
};
