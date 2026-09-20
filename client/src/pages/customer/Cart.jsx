import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getCartRequest, updateCartItemRequest, removeCartItemRequest } from "../../services/cartService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

export function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useQuery({ queryKey: ["cart"], queryFn: getCartRequest });

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return;
    try {
      await updateCartItemRequest(itemId, quantity);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update quantity");
    }
  }

  async function removeItem(itemId) {
    try {
      await removeCartItemRequest(itemId);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove item");
    }
  }

  if (isLoading) return <Spinner />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title="Your cart is empty" description="Browse the shop to find handmade footwear you'll love." />
        <div className="mt-6 text-center">
          <Link to="/shop">
            <Button>Explore Footwear</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasUnavailable = cart.items.some((item) => item.unavailable || !item.inStock);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">Your Cart</h1>

      <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
        {cart.items.map((item) => (
          <div key={item._id} className="flex items-center gap-4 p-4">
            {item.unavailable ? (
              <div className="flex-1 text-sm text-red-600">This product is no longer available.</div>
            ) : (
              <>
                <img src={item.product.images?.[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <Link to={`/products/${item.product._id}`} className="font-medium text-stone-900 hover:text-brand-600">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-stone-500">
                    Size {item.size} · {item.product.artisan?.shopName}
                  </p>
                  {!item.inStock && <p className="text-xs text-red-600">Not enough stock available</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="h-8 w-8 rounded-lg border border-stone-300 text-stone-600"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="h-8 w-8 rounded-lg border border-stone-300 text-stone-600"
                  >
                    +
                  </button>
                </div>
                <span className="w-24 text-right font-medium text-stone-900">{formatCurrency(item.lineTotal)}</span>
              </>
            )}
            <button onClick={() => removeItem(item._id)} className="text-sm text-stone-400 hover:text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-stone-200 p-4">
        <span className="text-stone-500">Subtotal</span>
        <span className="text-xl font-semibold text-stone-900">{formatCurrency(cart.subtotal)}</span>
      </div>
      {hasUnavailable && (
        <p className="mt-2 text-sm text-red-600">Remove unavailable items before checking out.</p>
      )}

      <div className="mt-6 flex justify-end">
        <Button disabled={hasUnavailable} onClick={() => navigate("/checkout")}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
