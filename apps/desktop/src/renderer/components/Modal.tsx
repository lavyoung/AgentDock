import {type ReactNode, useEffect, useRef} from "react";

import "./Modal.css";

type ModalProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
};

export function Modal({
    open,
    title,
    onClose,
    children,
    footer,
    size = "md",
}: ModalProps): ReactNode {
    const dialogRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;

        function onKey(event: KeyboardEvent): void {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open && !dialogRef.current) return null;

    return (
        <div
            className={`modal-backdrop ${open ? "open" : ""}`}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                className={`modal-dialog modal-dialog-${size}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <header className="modal-header">
                    <h3>{title}</h3>
                    <button
                        type="button"
                        className="modal-close"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        X
                    </button>
                </header>
                <div className="modal-body">{children}</div>
                {footer ? <footer className="modal-footer">{footer}</footer> : null}
            </div>
        </div>
    );
}
