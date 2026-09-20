import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listCategoriesRequest } from "../../services/categoryService.js";
import { createCategoryRequest, deleteCategoryRequest } from "../../services/adminService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";

export function AdminCategories() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: listCategoriesRequest });

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategoryRequest({ name: name.trim() });
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create category");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCategoryRequest(id);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Categories</h1>

      <form onSubmit={handleCreate} className="mt-6 flex max-w-md items-end gap-3">
        <div className="flex-1">
          <Input label="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button type="submit">Add</Button>
      </form>

      {isLoading && <Spinner />}

      {data && (
        <div className="mt-6 max-w-md divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.map((category) => (
            <div key={category._id} className="flex items-center justify-between p-4">
              <span className="text-stone-900">{category.name}</span>
              <Button variant="outline" onClick={() => handleDelete(category._id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
