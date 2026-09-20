import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createCustomOrderRequest, uploadCustomOrderImagesRequest } from "../../services/customOrderService.js";
import { Input } from "../../components/common/Input.jsx";
import { Button } from "../../components/common/Button.jsx";

export function NewCustomRequest() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function handleImageSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadCustomOrderImagesRequest(files);
      setImages((prev) => [...prev, ...urls].slice(0, 6));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values) {
    try {
      const customOrder = await createCustomOrderRequest({
        ...values,
        footMeasurements: {
          lengthCm: values.lengthCm || undefined,
          widthCm: values.widthCm || undefined,
        },
        referenceImages: images,
      });
      toast.success("Custom request submitted");
      navigate(`/custom-requests/${customOrder._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit request");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">Request Custom Footwear</h1>
      <p className="mt-1 text-sm text-stone-500">Describe what you want, and an artisan will send you a proposal.</p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Shoe type" placeholder="e.g. Loafer, Boot, Sandal" error={errors.shoeType?.message} {...register("shoeType", { required: "Required" })} />
        <Input label="Size" type="number" error={errors.size?.message} {...register("size", { required: "Required" })} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Foot length (cm, optional)" type="number" step="0.1" {...register("lengthCm")} />
          <Input label="Foot width (cm, optional)" type="number" step="0.1" {...register("widthCm")} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Preferred color" {...register("preferredColor")} />
          <Input label="Material" {...register("material")} />
          <Input label="Sole" {...register("sole")} />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">Design description</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("designDescription", { required: "Required" })}
          />
          {errors.designDescription && <span className="mt-1 block text-xs text-red-600">{errors.designDescription.message}</span>}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Budget (NPR, optional)" type="number" min="0" {...register("budget")} />
          <Input label="Needed by (optional)" type="date" {...register("requiredDate")} />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-stone-700">Reference images (optional)</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleImageSelect} />
          {uploading && <p className="mt-1 text-xs text-stone-500">Uploading...</p>}
          {images.length > 0 && (
            <div className="mt-2 flex gap-2">
              {images.map((url) => (
                <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          Submit Request
        </Button>
      </form>
    </div>
  );
}
