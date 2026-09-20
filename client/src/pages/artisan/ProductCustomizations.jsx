import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getProductRequest } from "../../services/productService.js";
import {
  listOwnedOptionsRequest,
  createOptionRequest,
  updateOptionRequest,
  deleteOptionRequest,
} from "../../services/customizationService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

const TYPES = ["style", "color", "material", "sole", "personalization"];

export function ArtisanProductCustomizations() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: product } = useQuery({ queryKey: ["product", id], queryFn: () => getProductRequest(id) });
  const { data: options, isLoading } = useQuery({
    queryKey: ["owned-customization-options", id],
    queryFn: () => listOwnedOptionsRequest(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { type: "style", label: "", priceDelta: 0 } });

  async function onSubmit(values) {
    try {
      await createOptionRequest(id, values);
      reset({ type: values.type, label: "", priceDelta: 0 });
      await queryClient.invalidateQueries({ queryKey: ["owned-customization-options", id] });
      toast.success("Option added");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add option");
    }
  }

  async function toggleActive(option) {
    try {
      await updateOptionRequest(option._id, { isActive: !option.isActive });
      await queryClient.invalidateQueries({ queryKey: ["owned-customization-options", id] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update option");
    }
  }

  async function remove(optionId) {
    try {
      await deleteOptionRequest(optionId);
      await queryClient.invalidateQueries({ queryKey: ["owned-customization-options", id] });
      toast.success("Option removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove option");
    }
  }

  return (
    <div>
      <Link to="/artisan/products" className="text-sm text-brand-600 hover:text-brand-700">
        &larr; Back to products
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">Customization Options</h1>
      {product && <p className="text-sm text-stone-500">{product.name}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 p-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">Type</span>
          <select {...register("type")} className="rounded-lg border border-stone-300 px-3 py-2.5 text-sm">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <Input label="Label" placeholder="e.g. Thick sole" {...register("label", { required: true })} />
        <Input label="Price add-on (NPR)" type="number" min="0" {...register("priceDelta")} />
        <Button type="submit" isLoading={isSubmitting}>
          Add option
        </Button>
      </form>

      {isLoading && <Spinner />}

      {options && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {options.map((opt) => (
            <div key={opt._id} className="flex items-center gap-4 p-4">
              <span className="w-28 shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-center text-xs font-medium capitalize text-stone-600">
                {opt.type}
              </span>
              <div className="flex-1">
                <p className="font-medium text-stone-900">{opt.label}</p>
                <p className="text-sm text-stone-500">+{formatCurrency(opt.priceDelta)}</p>
              </div>
              <span className={`text-xs font-medium ${opt.isActive ? "text-green-700" : "text-stone-400"}`}>
                {opt.isActive ? "Active" : "Inactive"}
              </span>
              <Button variant="outline" onClick={() => toggleActive(opt)}>
                {opt.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button variant="secondary" onClick={() => remove(opt._id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
