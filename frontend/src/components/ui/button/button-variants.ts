import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export function getButtonClasses({
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}): string {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold focus:ring-amber-500 shadow-md shadow-amber-500/10",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 focus:ring-slate-700 border border-slate-700/60",
    outline:
      "bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 focus:ring-slate-600",
    ghost:
      "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white focus:ring-slate-700",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 focus:ring-red-500",
  };

  return cn(
    base,
    sizeClasses[size],
    variantClasses[variant],
    disabled && "pointer-events-none opacity-50",
    className
  );
}
