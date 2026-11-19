import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Modal } from "./Modal";
import { useUi } from "../lib/ui-lang";

interface ConfirmOptions {
  title: string;
  message: ReactNode;
  confirmText?: string;
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve(v: boolean): void }) | null>(null);
  const { t } = useUi();

  const confirm = useCallback<ConfirmFn>(
    (opts) => new Promise<boolean>((resolve) => setState({ ...opts, resolve })),
    [],
  );

  const close = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Modal title={state.title} onClose={() => close(false)} size="sm">
          <div className="modal-body confirm-body">
            {state.danger && (
              <div className="confirm-icon">
                <TriangleAlert size={22} />
              </div>
            )}
            <div className="confirm-message">{state.message}</div>
          </div>
          <footer className="modal-footer">
            <button className="btn btn-ghost" onClick={() => close(false)}>
              {t.common.cancel}
            </button>
            <button className={`btn ${state.danger ? "btn-danger" : "btn-primary"}`} onClick={() => close(true)} autoFocus>
              {state.confirmText ?? t.common.confirm}
            </button>
          </footer>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm, ConfirmProvider içinde kullanılmalı");
  return ctx;
}
