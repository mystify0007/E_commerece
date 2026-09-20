export function StarRating({ value, onChange, readOnly = false, size = "text-lg" }) {
  return (
    <div className={`flex gap-0.5 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
        >
          <span className={star <= value ? "text-amber-500" : "text-stone-300"}>★</span>
        </button>
      ))}
    </div>
  );
}
