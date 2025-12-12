import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700",
    secondary:
      "bg-amber-100 text-amber-800 hover:bg-amber-200 active:bg-amber-300",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
    ghost: "bg-transparent text-amber-600 hover:bg-amber-50 active:bg-amber-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
