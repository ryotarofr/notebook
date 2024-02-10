import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { getContextDefaultValueFactory } from "@/fn/getContextDefaultValueFactory";

const noImpl = getContextDefaultValueFactory("LoadingBoundaryProvider");

type LoadingBoundaryContextProps = {
  track: <T>(promise: Promise<T>) => Promise<T>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const LoadingBoundaryContext = createContext<LoadingBoundaryContextProps>({
  track: noImpl("track()"),
  setLoading: noImpl("setLoading()"),
});

export const LoadingBoundaryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [trackList, setTrackList] = useState<Promise<unknown>[]>([]);
  useEffect(() => {
    setLoading(0 < trackList.length);
  }, [trackList]);

  const track = <T, >(promise: Promise<T>) => {
    setTrackList((prev) => ([...prev, promise]));
    return promise
      .finally(() =>
        setTrackList((prev) => prev.filter((it) => it !== promise)),
      );
  };

  return (
    <LoadingBoundaryContext.Provider
      value={{
        track,
        setLoading,
      }}
    >
      {children}
      <Modal
        opened={loading}
        setOpened={setLoading}
        clickBackdropToClose={false}
        style={{
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        <Spinner
          design="ballClipRotatePulse"
        />
        <span>tracking [{trackList.length}] promises...</span>
      </Modal>
    </LoadingBoundaryContext.Provider>
  );
};

export const useLoadingBoundary = () => useContext(LoadingBoundaryContext);
