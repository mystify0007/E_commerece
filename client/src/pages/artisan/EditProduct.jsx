import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ProductForm } from "../../components/product/ProductForm.jsx";
import { getProductRequest, updateProductRequest } from "../../services/productService.js";
import { Spinner } from "../../components/common/Spinner.jsx";

export function ArtisanEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductRequest(id),
  });

  async function handleSubmit(values) {
    try {
      await updateProductRequest(id, values);
      toast.success("Product updated");
      navigate("/artisan/products");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update product");
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Edit Product</h1>
      <div className="mt-6">
        <ProductForm
          defaultValues={{
            ...product,
            category: product.category._id,
            colors: product.colors.join(", "),
            sizesAvailable: product.sizesAvailable.join(", "),
            tags: product.tags?.join(", "),
          }}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
