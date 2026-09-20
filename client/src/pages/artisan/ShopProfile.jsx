import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getMyArtisanProfileRequest, updateMyArtisanProfileRequest } from "../../services/artisanService.js";
import { Input } from "../../components/common/Input.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";

export function ArtisanShopProfile() {
  const queryClient = useQueryClient();
  const { data: artisan, isLoading } = useQuery({
    queryKey: ["my-artisan-profile"],
    queryFn: getMyArtisanProfileRequest,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    if (artisan) {
      reset({
        shopName: artisan.shopName,
        bio: artisan.bio,
        location: artisan.location,
        yearsOfExperience: artisan.yearsOfExperience,
        specialization: artisan.specialization?.join(", "),
      });
    }
  }, [artisan, reset]);

  async function onSubmit(values) {
    try {
      await updateMyArtisanProfileRequest({
        ...values,
        specialization: values.specialization
          ? values.specialization.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      });
      await queryClient.invalidateQueries({ queryKey: ["my-artisan-profile"] });
      toast.success("Shop profile updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-stone-900">Shop Profile</h1>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Shop name" {...register("shopName")} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">Bio</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register("bio")}
          />
        </label>
        <Input label="Location" {...register("location")} />
        <Input label="Years of experience" type="number" min="0" {...register("yearsOfExperience")} />
        <Input label="Specialization (comma-separated)" {...register("specialization")} />
        <Button type="submit" isLoading={isSubmitting}>
          Save changes
        </Button>
      </form>
    </div>
  );
}
