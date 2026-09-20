import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listCategoriesRequest } from "../../services/categoryService.js";
import { uploadProductImagesRequest } from "../../services/productService.js";
import { getProductAssistRequest } from "../../services/aiService.js";
import { Input } from "../common/Input.jsx";
import { Button } from "../common/Button.jsx";

export function ProductForm({ defaultValues, onSubmit, submitLabel = "Save" }) {
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listCategoriesRequest });
  const [images, setImages] = useState(defaultValues?.images || []);
  const [uploading, setUploading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  async function handleImageSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadProductImagesRequest(files);
      setImages((prev) => [...prev, ...urls].slice(0, 6));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  }

  async function handleAiAssist() {
    const name = watch("name");
    const description = watch("description");
    if (!name && !description) {
      toast.error("Enter a product name or description first");
      return;
    }
    setAiLoading(true);
    try {
      const suggestions = await getProductAssistRequest({ name, description });
      setAiSuggestions(suggestions);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to get suggestions");
    } finally {
      setAiLoading(false);
    }
  }

  function submit(values) {
    onSubmit({
      ...values,
      colors: values.colors.split(",").map((s) => s.trim()).filter(Boolean),
      sizesAvailable: values.sizesAvailable
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !Number.isNaN(n)),
      tags: values.tags ? values.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      images,
    });
  }

  return (
    <form className="max-w-2xl space-y-5" onSubmit={handleSubmit(submit)}>
      <Input label="Product name" error={errors.name?.message} {...register("name", { required: "Required" })} />

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-stone-700">Description</span>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          {...register("description", { required: "Required" })}
        />
        {errors.description && <span className="mt-1 block text-xs text-red-600">{errors.description.message}</span>}
      </label>

      <div>
        <Button type="button" variant="outline" isLoading={aiLoading} onClick={handleAiAssist}>
          ✨ Suggest with AI
        </Button>
        <p className="mt-1 text-xs text-stone-400">Generates draft suggestions from your name/description — review before applying.</p>
      </div>

      {aiSuggestions && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm">
          <p className="font-medium text-stone-900">AI Suggestions</p>
          <div className="mt-2 space-y-2">
            {aiSuggestions.suggestedCategory && (
              <div className="flex items-center justify-between">
                <span>Category: {aiSuggestions.suggestedCategory.name}</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue("category", aiSuggestions.suggestedCategory._id)}
                >
                  Apply
                </Button>
              </div>
            )}
            {aiSuggestions.suggestedMaterial && (
              <div className="flex items-center justify-between">
                <span>Material: {aiSuggestions.suggestedMaterial}</span>
                <Button type="button" variant="outline" onClick={() => setValue("material", aiSuggestions.suggestedMaterial)}>
                  Apply
                </Button>
              </div>
            )}
            {aiSuggestions.suggestedColors?.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Colors: {aiSuggestions.suggestedColors.join(", ")}</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue("colors", aiSuggestions.suggestedColors.join(", "))}
                >
                  Apply
                </Button>
              </div>
            )}
            {aiSuggestions.suggestedTags?.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Tags: {aiSuggestions.suggestedTags.join(", ")}</span>
                <Button type="button" variant="outline" onClick={() => setValue("tags", aiSuggestions.suggestedTags.join(", "))}>
                  Apply
                </Button>
              </div>
            )}
            {aiSuggestions.suggestedDescription && !getValues("description") && (
              <div className="flex items-center justify-between gap-3">
                <span className="line-clamp-2">Description: {aiSuggestions.suggestedDescription}</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue("description", aiSuggestions.suggestedDescription)}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-stone-500">{aiSuggestions.note}</p>
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-stone-700">Category</span>
        <select
          className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm"
          {...register("category", { required: "Required" })}
        >
          <option value="">Select a category</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Material" {...register("material", { required: "Required" })} />
        <Input label="Sole type" {...register("soleType")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Colors (comma-separated)" placeholder="brown, black" {...register("colors", { required: "Required" })} />
        <Input label="Sizes available (comma-separated)" placeholder="39, 40, 41" {...register("sizesAvailable", { required: "Required" })} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input label="Price (NPR)" type="number" min="0" {...register("price", { required: "Required" })} />
        <Input label="Stock" type="number" min="0" {...register("stock", { required: "Required" })} />
        <Input label="Production time (days)" type="number" min="0" {...register("productionTimeDays")} />
      </div>

      <Input label="Tags (comma-separated)" {...register("tags")} />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" defaultChecked {...register("isHandmade")} /> Handmade
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" {...register("isCustomizable")} /> Customizable
        </label>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-stone-700">Images</span>
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

      <Button type="submit" isLoading={isSubmitting} disabled={images.length === 0}>
        {submitLabel}
      </Button>
      {images.length === 0 && <p className="text-xs text-stone-400">Upload at least one image before saving.</p>}
    </form>
  );
}
