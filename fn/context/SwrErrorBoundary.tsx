import {
  ReactNode,
  useState,
} from "react";
import { SWRConfig } from "swr";

import { Modal } from "@/components/ui/Modal";

type Props = {
  children?: ReactNode;
};

/**
 * エラー境界を提供するコンテキストプロバイダー
 *
 * エラー時のモーダル表示を行う。
 */
export const SwrErrorBoundary: React.FC<Props>
  = ({ children }) => {
    const [modalOpened, setModalOpened] = useState(false);
    const [errorInfo, setErrorInfo] = useState<{
      title: string;
      message: string;
      supportInfo: Record<string, string>;
    }>();

    return (
      <SWRConfig
        value={{
          onError: (error, key) => {
            const {
              statusCode,
              statusText,
              exceptionClassName,
              ...supportInfo
            } = error;
            setModalOpened(true);
            setErrorInfo({
              title: `${statusCode} ${statusText}`,
              message: exceptionClassName,
              supportInfo: {
                ...supportInfo,
                requestId: supportInfo.requestId,
                apiPath: key,
                location: document.location.toString(),
                // userAgent: navigator.userAgent,
              },
            });
          },
        }}
      >
        {children}
        <Modal
          opened={modalOpened}
          setOpened={setModalOpened}
          title={errorInfo?.title}
          clickBackdropToClose={import.meta.env.DEV}
        >
          <p>{errorInfo?.message}</p>
          <sub><code><pre>{JSON.stringify(errorInfo?.supportInfo, null, 2)}</pre></code></sub>
        </Modal>
      </SWRConfig>
    );
  };
