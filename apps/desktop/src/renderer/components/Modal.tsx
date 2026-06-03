import {type ReactNode, useEffect, useRef} from "react";

import "./Modal.css";

type ModalProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    width?: number;
};

export function Modal({open, title, onClose, children, footer, width = 520}: ModalProps): ReactNode {
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
                className="modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                style={{width}}
            >
                <header className="modal-header">
                    <h3>{title}</h3>
                    <button
                        type="button"
                        className="modal-close"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>
                <div className="modal-body">{children}</div>
                {footer ? <footer className="modal-footer">{footer}</footer> : null}
            </div>
        </div>
    );
}
