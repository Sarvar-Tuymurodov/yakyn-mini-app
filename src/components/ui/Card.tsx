import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-sm border border-gray-100 dark:border-[#404040] ${
        onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`px-4 py-3 border-b border-gray-100 dark:border-[#404040] ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
