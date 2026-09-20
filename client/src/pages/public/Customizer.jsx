import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getProductRequest } from "../../services/productService.js";
import { listOptionsRequest } from "../../services/customizationService.js";
import { addCartItemRequest } from "../../services/cartService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

const TYPE_LABELS = {
  style: "Style",
  color: "Color",
  material: "Material",
  sole: "Sole",
  personalization: "Personalization",
};

export function Customizer() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState({}); // { [type]: optionId }
  const [size, setSize] = useState(null);
  const [personalizationText, setPersonalizationText] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductRequest(id),
  });

  const { data: options, isLoading: loadingOptions } = useQuery({
    queryKey: ["customization-options", id],
    queryFn: () => listOptionsRequest(id),
  });

  const grouped = useMemo(() => {
    if (!options) return {};
    return options.reduce((acc, opt) => {
      (acc[opt.type] ||= []).push(opt);
      return acc;
    }, {});
  }, [options]);

  const selectedOptionIds = Object.values(selected).filter(Boolean);
  const selectedOptions = (options || []).filter((o) => selectedOptionIds.includes(o._id));
  const delta = selectedOptions.reduce((sum, o) => sum + o.priceDelta, 0);
  const finalPrice = product ? product.price + delta : 0;

  async function handleAddToCart() {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/products/${id}/customize` } } });
      return;
    }
    if (user.role !== "customer") {
      toast.error("Only customer accounts can order footwear");
      return;
    }
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    setAdding(true);
    try {
      await addCartItemRequest({
        product: id,
        quantity: 1,
        size,
        customizationOptions: selectedOptionIds,
        personalizationText: personalizationText || undefined,
      });
      toast.success("Customized product added to cart");
      navigate("/cart");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

  if (loadingProduct || loadingOptions) return <Spinner />;
  if (!product) return <ErrorState message="Product not found." />;
  if (!product.isCustomizable) return <ErrorState message="This product is not customizable." />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={`/products/${id}`} className="text-sm text-brand-600 hover:text-brand-700">
        &larr; Back to product
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">Customize: {product.name}</h1>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-stone-700">Size</span>
            <div className="flex flex-wrap gap-2">
              {product.sizesAvailable.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-10 w-10 rounded-lg border text-sm font-medium ${
                    size === s ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-300 text-stone-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {Object.keys(grouped).length === 0 && (
            <EmptyState title="No customization options yet" description="The craftsman hasn't added any options for this product." />
          )}

          {Object.entries(grouped).map(([type, opts]) => (
            <div key={type}>
              <span className="mb-1.5 block text-sm font-medium text-stone-700">{TYPE_LABELS[type] || type}</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {opts.map((opt) => (
                  <button
                    key={opt._id}
                    onClick={() =>
                      setSelected((prev) => ({ ...prev, [type]: prev[type] === opt._id ? undefined : opt._id }))
                    }
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                      selected[type] === opt._id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-300 text-stone-700"
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    {opt.priceDelta > 0 && <div className="text-xs text-stone-500">+{formatCurrency(opt.priceDelta)}</div>}
                  </button>
                ))}
              </div>
              {type === "personalization" && selected.personalization && (
                <input
                  value={personalizationText}
                  onChange={(e) => setPersonalizationText(e.target.value)}
                  maxLength={60}
                  placeholder="Text to add (e.g. your initials)"
                  className="mt-2 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm"
                />
              )}
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-stone-200 p-5">
          <h2 className="font-medium text-stone-900">Price</h2>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>Base price</span>
              <span>{formatCurrency(product.price)}</span>
            </div>
            {selectedOptions.map((opt) => (
              <div key={opt._id} className="flex justify-between text-stone-500">
                <span>{opt.label}</span>
                <span>+{formatCurrency(opt.priceDelta)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-semibold text-stone-900">
              <span>Total</span>
              <span>{formatCurrency(finalPrice)}</span>
            </div>
          </div>
          <Button className="mt-4 w-full" isLoading={adding} onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <p className="mt-2 text-xs text-stone-400">Final price is always recalculated by the server at checkout.</p>
        </div>
      </div>
    </div>
  );
}
