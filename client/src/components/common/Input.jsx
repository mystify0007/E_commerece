import clsx from "clsx";

export function Input({ label, error, className, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>}
      <input
        className={clsx(
          "w-full rounded-lg border px-3.5 py-2.5 text-sm text-stone-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500",
          error ? "border-red-400" : "border-stone-300",
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
