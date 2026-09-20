import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getCartRequest } from "../../services/cartService.js";
import { createOrderRequest } from "../../services/orderService.js";
import { Input } from "../../components/common/Input.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

const SHIPPING_FEE = 150;

const PROVIDERS = [
  { value: "cod", label: "Cash on Delivery", available: true },
  { value: "mock", label: "Test Online Payment (sandbox)", available: true },
  { value: "esewa", label: "eSewa (sandbox)", available: true },
  { value: "khalti", label: "Khalti", available: false },
];

// eSewa's checkout is a signed form POST, not a JSON redirect — build a
// hidden form with the server-provided fields and submit it so the browser
// navigates to eSewa's sandbox payment page.
function redirectToPaymentGateway({ method, url, fields }) {
  const form = document.createElement("form");
  form.method = method;
  form.action = url;
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useQuery({ queryKey: ["cart"], queryFn: getCartRequest });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { paymentProvider: "cod" } });

  async function onSubmit(values) {
    try {
      const order = await createOrderRequest(values);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });

      if (order.paymentRedirect) {
        toast.success("Redirecting you to eSewa…");
        redirectToPaymentGateway(order.paymentRedirect);
        return;
      }

      toast.success("Order placed!");
      navigate(`/orders/${order._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Checkout failed");
    }
  }

  if (isLoading) return <Spinner />;
  if (!cart || cart.items.length === 0) {
    return <p className="mx-auto max-w-2xl px-4 py-16 text-center text-stone-500">Your cart is empty.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <form id="checkout-form" className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="font-medium text-stone-900">Shipping Address</h2>
          <Input
            label="Full name"
            error={errors.shippingAddress?.fullName?.message}
            {...register("shippingAddress.fullName", { required: "Required" })}
          />
          <Input
            label="Phone"
            error={errors.shippingAddress?.phone?.message}
            {...register("shippingAddress.phone", { required: "Required" })}
          />
          <Input
            label="Address line 1"
            error={errors.shippingAddress?.line1?.message}
            {...register("shippingAddress.line1", { required: "Required" })}
          />
          <Input label="Address line 2 (optional)" {...register("shippingAddress.line2")} />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              error={errors.shippingAddress?.city?.message}
              {...register("shippingAddress.city", { required: "Required" })}
            />
            <Input label="District" {...register("shippingAddress.district")} />
          </div>

          <h2 className="pt-2 font-medium text-stone-900">Payment</h2>
          <div className="space-y-2">
            {PROVIDERS.map((p) => (
              <label
                key={p.value}
                className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm ${
                  p.available ? "border-stone-300" : "border-stone-200 opacity-50"
                }`}
              >
                <input type="radio" value={p.value} disabled={!p.available} {...register("paymentProvider")} />
                {p.label}
                {!p.available && <span className="ml-auto text-xs text-stone-400">Sandbox not configured</span>}
              </label>
            ))}
          </div>
        </form>

        <div>
          <h2 className="font-medium text-stone-900">Order Summary</h2>
          <div className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200">
            {cart.items.map((item) => (
              <div key={item._id} className="flex items-center gap-3 p-3">
                <img src={item.product.images?.[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-stone-900">{item.product.name}</p>
                  <p className="text-stone-500">
                    Size {item.size}
                    {item.color && ` · Color ${item.color}`} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-stone-900">{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 rounded-xl border border-stone-200 p-4 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Shipping</span>
              <span>{formatCurrency(SHIPPING_FEE)}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-semibold text-stone-900">
              <span>Total</span>
              <span>{formatCurrency(cart.subtotal + SHIPPING_FEE)}</span>
            </div>
          </div>
          <Button form="checkout-form" type="submit" isLoading={isSubmitting} className="mt-4 w-full">
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}
