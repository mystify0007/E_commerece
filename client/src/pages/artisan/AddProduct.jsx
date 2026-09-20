import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ProductForm } from "../../components/product/ProductForm.jsx";
import { createProductRequest } from "../../services/productService.js";

export function ArtisanAddProduct() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    try {
      await createProductRequest(values);
      toast.success("Product submitted for admin approval");
      navigate("/artisan/products");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create product");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Add Product</h1>
      <p className="mt-1 text-sm text-stone-500">New products are reviewed by an admin before going live.</p>
      <div className="mt-6">
        <ProductForm
          defaultValues={{ isHandmade: true, isCustomizable: false }}
          onSubmit={handleSubmit}
          submitLabel="Submit for approval"
        />
      </div>
    </div>
  );
}
