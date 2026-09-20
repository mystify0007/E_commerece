import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getWishlistRequest, removeFromWishlistRequest } from "../../services/wishlistService.js";
import { addCartItemRequest } from "../../services/cartService.js";
import { ProductCard } from "../../components/product/ProductCard.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";

export function Wishlist() {
  const queryClient = useQueryClient();
  const { data: wishlist, isLoading } = useQuery({ queryKey: ["wishlist"], queryFn: getWishlistRequest });

  async function moveToCart(productId, sizesAvailable) {
    try {
      await addCartItemRequest({ product: productId, quantity: 1, size: sizesAvailable[0] });
      await removeFromWishlistRequest(productId);
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Moved to cart");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to move to cart");
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">Wishlist</h1>

      {wishlist && wishlist.items.length === 0 && (
        <div className="mt-6">
          <EmptyState title="Your wishlist is empty" description="Save products you're interested in for later." />
        </div>
      )}

      {wishlist && wishlist.items.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {wishlist.items.map((item) => (
            <div key={item.product._id}>
              <ProductCard product={item.product} />
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => moveToCart(item.product._id, item.product.sizesAvailable)}
              >
                Move to Cart
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
