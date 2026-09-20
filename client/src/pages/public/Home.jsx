import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPopularRequest, getForYouRequest } from "../../services/recommendationService.js";
import { ProductCard } from "../../components/product/ProductCard.jsx";
import { Button } from "../../components/common/Button.jsx";

const CATEGORIES = ["Sneakers", "Boots", "Formal", "Sandals", "Traditional", "Hiking"];

export function Home() {
  const { user } = useAuth();

  const { data: popular } = useQuery({ queryKey: ["popular-products"], queryFn: getPopularRequest });
  const { data: forYou } = useQuery({
    queryKey: ["for-you"],
    queryFn: getForYouRequest,
    enabled: user?.role === "customer",
  });

  return (
    <div>
      <section className="border-b border-stone-200 bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Handcrafted for You. Made by Local Artisans.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-stone-600">
            Discover unique handmade footwear, customize your own design, and shop directly from local makers.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/shop">
              <Button>Explore Footwear</Button>
            </Link>
            <Link to="/custom-requests/new">
              <Button variant="outline">Customize Your Shoes</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-stone-900">Featured Categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => (
            <div
              key={category}
              className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm font-medium text-stone-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              {category}
            </div>
          ))}
        </div>
      </section>

      {user?.role === "customer" && forYou && forYou.length > 0 && (
        <section className="border-t border-stone-200">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-stone-900">Recommended For You</h2>
            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {forYou.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {popular && popular.length > 0 && (
        <section className="border-t border-stone-200 bg-stone-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-stone-900">Popular Handmade Footwear</h2>
            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {popular.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-stone-900">Local Craft, Delivered</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            JuttaX connects you directly with the artisans who make your footwear by hand — no factories, no
            middlemen. Every pair carries a story, and every purchase supports a local maker.
          </p>
        </div>
      </section>
    </div>
  );
}
