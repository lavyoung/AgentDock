import {type ButtonHTMLAttributes, type ReactNode} from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    children: ReactNode;
};

const variantClass: Record<Variant, string> = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    danger: "btn btn-danger",
    ghost: "btn btn-ghost",
};

const sizeClass: Record<Size, string> = {
    sm: "btn-sm",
    md: "btn-md",
};

export function Button({
    variant = "secondary",
    size = "md",
    className,
    children,
    ...rest
}: ButtonProps): ReactNode {
    const classes = [variantClass[variant], sizeClass[size], className]
        .filter(Boolean)
        .join(" ");
    return (
        <button className={classes} {...rest}>
            {children}
        </button>
    );
}
