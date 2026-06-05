import {type ReactNode, useEffect, useRef} from "react";

import "./Modal.css";

type ModalProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    dialogClassName?: string;
};

export function Modal({
    open,
    title,
    onClose,
    children,
    footer,
    size = "md",
    dialogClassName,
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
                className={`modal-dialog modal-dialog-${size}${dialogClassName ? ` ${dialogClassName}` : ""}`}
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
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </header>
                <div className="modal-body">{children}</div>
                {footer ? <footer className="modal-footer">{footer}</footer> : null}
            </div>
        </div>
    );
}
