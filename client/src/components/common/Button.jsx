import clsx from "clsx";

const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
  secondary: "bg-stone-100 text-stone-900 hover:bg-stone-200 disabled:opacity-50",
  outline: "border border-stone-300 text-stone-900 hover:bg-stone-50 disabled:opacity-50",
};

export function Button({ variant = "primary", className, isLoading, children, disabled, ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        VARIANTS[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  );
}
