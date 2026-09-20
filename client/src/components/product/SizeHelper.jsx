import { useState } from "react";
import { recommendSizeRequest } from "../../services/sizingService.js";
import { Button } from "../common/Button.jsx";
import { Input } from "../common/Input.jsx";

export function SizeHelper({ productId, onRecommend }) {
  const [open, setOpen] = useState(false);
  const [footLengthCm, setFootLengthCm] = useState("");
  const [footWidthCm, setFootWidthCm] = useState("");
  const [preferredFit, setPreferredFit] = useState("regular");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    if (!footLengthCm) return;
    setLoading(true);
    try {
      const data = await recommendSizeRequest({
        footLengthCm: Number(footLengthCm),
        footWidthCm: footWidthCm ? Number(footWidthCm) : undefined,
        preferredFit,
        product: productId,
      });
      setResult(data);
      onRecommend?.(data.recommendedSize);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-brand-600 hover:text-brand-700">
        Not sure of your size? Get a recommendation
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 p-4">
      <div className="grid grid-cols-3 gap-3">
        <Input label="Foot length (cm)" type="number" step="0.1" value={footLengthCm} onChange={(e) => setFootLengthCm(e.target.value)} />
        <Input label="Foot width (cm, optional)" type="number" step="0.1" value={footWidthCm} onChange={(e) => setFootWidthCm(e.target.value)} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">Fit</span>
          <select
            value={preferredFit}
            onChange={(e) => setPreferredFit(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm"
          >
            <option value="snug">Snug</option>
            <option value="regular">Regular</option>
            <option value="loose">Loose</option>
          </select>
        </label>
      </div>
      <Button variant="outline" className="mt-3" isLoading={loading} onClick={handleCheck}>
        Get recommendation
      </Button>
      {result && (
        <div className="mt-3 text-sm">
          <p className="font-medium text-stone-900">Recommended size: {result.recommendedSize}</p>
          <p className="mt-1 text-xs text-stone-400">{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
