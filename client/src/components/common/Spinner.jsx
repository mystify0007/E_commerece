export function Spinner({ full = true }) {
  return (
    <div className={full ? "flex min-h-[50vh] items-center justify-center" : "flex items-center justify-center p-4"}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
    </div>
  );
}
