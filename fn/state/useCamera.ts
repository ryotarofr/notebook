import { Dispatch, SetStateAction, WheelEvent, useEffect, useState } from "react";

import { merge } from "@/fn/merge";
import { Calc } from "@/fn/objCalc";
import { DeepPartial } from "@/type/DeepPartial";
import { Position } from "@/type/Position";
import { Size } from "@/type/Size";

import { usePointers } from "./usePointers";

export type Camera = {
  scale: Size;
  translate: Position;
};
export const Camera = (() => {
  const init = () => ({
    scale: Size.init(),
    translate: Position.init(),
  });
  return {
    init,
    from: (partial: DeepPartial<Camera>): Camera =>
      merge(init(), partial),
  };
})();

export const useCamera = (args?: {
  initState?: DeepPartial<Camera>;
}) => {
  const initState = Camera.from(args?.initState ?? {});
  const [state, setState] = useState(initState);
  const position = () => Calc.opposite(state.translate);
  useEffect(() => setState(initState), []);

  const setScale: SetScale = (setter, options) => {
    setState((prev) => {
      const prevScale = options?.prevScale ?? prev.scale;
      const nextScaleRaw = typeof setter === "function" ? setter(prevScale) : setter;
      const nextScale = Calc.orElse((it) => isFinite(it) && 0 < it)(nextScaleRaw, prevScale);
      const nextTranslate = (() => {
        if (options){
          const origin = options.origin;
          const nextOrigin = options.nextOrigin ?? origin;
          const prevTranslate = options.prevTranslate ?? prev.translate;
          return getScaledTranslate({
            prevOriginOnScreen: origin,
            nextOriginOnScreen: nextOrigin,
            prevTranslate: prevTranslate,
            prevScale: prevScale,
            nextScale: nextScale,
          });
        } else {
          return prev.translate;
        }
      })();
      return {
        scale: nextScale,
        translate: nextTranslate,
      };
    });
  };

  const [stateInAction, setStateInAction] = useState<StateInAction>();
  const inAction = () => stateInAction?.pointsCount !== 0 ?? false;
  const setByPositions = (
    points: Position[],
    keepRatio: boolean = false,
  ) => {
    const onDown = stateInAction;
    if (!onDown || onDown.pointsCount !== points.length) {
      const sumMax = points.reduce((max, it) => Calc.max(max, it), Position.init());
      const distance = Calc.positiveDiff(
        sumMax,
        points.reduce((min, it) => Calc.min(min, it), sumMax),
      );
      const origin = Calc["/"](
        points.reduce((sum, it) => Calc["+"](sum, it), Position.init()),
        Math.max(1, points.length),
      );
      setStateInAction(() => ({
        pointsCount: points.length,
        scale: state.scale,
        translate: state.translate,
        origin: origin,
        distance: Size.fromPosition(distance),
      }));
    } else {
      if (points.length === 0) return;
      const sumMax = points.reduce((max, it) => Calc.max(max, it), Position.init());
      const sumMin = points.reduce((min, it) => Calc.min(min, it), sumMax);
      const distance = Calc.positiveDiff(sumMax, sumMin);
      const origin = Calc["/"](
        points.reduce((sum, it) => Calc["+"](sum, it), Position.init()),
        points.length,
      );
      const current = {
        distance: Size.fromPosition(distance),
        origin,
      };
      const scaleScalarRaw = Calc["/"](current.distance, onDown.distance);
      const scaleScalar
          = keepRatio
            ? Math.max(scaleScalarRaw.width, scaleScalarRaw.height)
            : scaleScalarRaw;
      const nextScale = Calc["*"](onDown.scale, scaleScalar);
      setScale(nextScale, {
        origin: onDown.origin,
        nextOrigin: current.origin,
        prevScale: onDown.scale,
        prevTranslate: onDown.translate,
      });
    }
  };
  const setTranslate: Dispatch<SetStateAction<Translate>>
    = (setter) =>
      setState((prev) => {
        const nextTranslateRaw = typeof setter === "function" ? setter(prev.translate) : setter;
        return {
          ...prev,
          translate: nextTranslateRaw,
        };
      });

  // scale and translate by pointers
  const { set: setPointers } = usePointers((pointers) => {
    const points = pointers.map((pointer) => ({
      x: pointer.offsetX,
      y: pointer.offsetY,
    }));
    setByPositions(points, true);
  });

  return {
    get get() {
      return {
        get state() { return state; },
        get scale() { return state.scale; },
        get translate() { return state.translate; },
        get position() { return position(); },
        get inAction() { return inAction(); },
        absAtFromAtCamera: (atCamera: Position) =>  {
          const atScaled = Calc["+"](position(), atCamera);
          const absAt = Calc["/"](atScaled, Size.toPosition(state.scale));
          return absAt;
        },
      };
    },
    get set() {
      return {
        state: setState,
        translate: setTranslate,
        scale: setScale,
        byPositions: setByPositions,
        init: () => setState(initState),
        getEventListeners: (args: {
          scaleRatioOnWheel: number;
        }) => ({
          ...setPointers.getEventListeners(),
          onWheel: (event: WheelEvent) => {
            const targetRect = event.currentTarget.getBoundingClientRect();
            const cursorOnScreen = {
              x: event.clientX - targetRect.left,
              y: event.clientY - targetRect.top,
            };
            const scalar = args.scaleRatioOnWheel;
            const calculator = event.deltaY < 0 ? "/" : "*";
            setScale((prev) => Calc[calculator](prev, scalar), { origin: cursorOnScreen });
          },
        }),
      };
    },
  };
};

const getScaledTranslate = (args: {
  prevOriginOnScreen: Position;
  nextOriginOnScreen: Position;
  prevScale: Size;
  nextScale: Size;
  prevTranslate: Position;
}) => {
  const cameraAtAbsScaled = Calc.opposite(args.prevTranslate);
  const cursorAtAbsScaled = Calc["+"](cameraAtAbsScaled, args.prevOriginOnScreen);
  const cursorAtAbs = Calc["/"](cursorAtAbsScaled, Size.toPosition(args.prevScale));
  const cursorAtAbsNextScaled = Calc["*"](cursorAtAbs, Size.toPosition(args.nextScale));
  const screenAtAbsNextScaled = Calc["-"](cursorAtAbsNextScaled, args.nextOriginOnScreen);
  const nextTranslate = Calc.opposite(screenAtAbsNextScaled);
  return nextTranslate;
};

type Translate = Camera["translate"];
type Scale = Camera["scale"];
type SetScale = (setter: SetStateAction<Scale>, options?: {
  origin: Position;
  nextOrigin?: Position;
  prevScale?: Scale;
  prevTranslate?: Translate;
}) => void;

type StateInAction = {
  pointsCount: number;
  distance: Size;
  origin: Position;
  translate: Translate;
  scale: Scale;
};
