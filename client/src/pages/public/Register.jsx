import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { Input } from "../../components/common/Input.jsx";
import { Button } from "../../components/common/Button.jsx";

export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: "customer" } });

  const role = watch("role");

  async function onSubmit(values) {
    try {
      const user = await registerUser(values);
      toast.success("Account created!");
      navigate(user.role === "artisan" ? "/artisan" : "/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-stone-900">Create your account</h1>
      <p className="mt-1 text-sm text-stone-500">Join JuttaX as a customer or a footwear artisan.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full name"
          error={errors.name?.message}
          {...register("name", { required: "Name is required", minLength: { value: 2, message: "Too short" } })}
        />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "At least 8 characters" },
          })}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-stone-700">I am joining as</span>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium ${
                role === "customer" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-300 text-stone-600"
              }`}
            >
              <input type="radio" value="customer" className="sr-only" {...register("role")} />
              Customer
            </label>
            <label
              className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium ${
                role === "artisan" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-300 text-stone-600"
              }`}
            >
              <input type="radio" value="artisan" className="sr-only" {...register("role")} />
              Artisan
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
