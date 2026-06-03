import type {JSX} from "react";

import {useAppStore} from "../stores/useAppStore";
import "./Toast.css";

export function ToastContainer(): JSX.Element {
    const toasts = useAppStore((s) => s.toasts);
    const dismiss = useAppStore((s) => s.dismissToast);

    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.kind}`}
                    role="status"
                    onClick={() => dismiss(toast.id)}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
