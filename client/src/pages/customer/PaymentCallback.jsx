import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyPaymentRequest } from "../../services/paymentService.js";
import { Spinner } from "../../components/common/Spinner.jsx";

// Landed on after eSewa redirects the browser back from its sandbox
// checkout page. We never trust that redirect (or its query params) as
// proof of payment — we always ask our own backend to re-verify the
// payment against eSewa's status-check API before showing a result.
export function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const [state, setState] = useState({ status: "checking", payment: null, error: null });

  useEffect(() => {
    if (!orderId) {
      setState({ status: "error", payment: null, error: "Missing order reference." });
      return;
    }
    verifyPaymentRequest(orderId)
      .then((payment) => setState({ status: "done", payment, error: null }))
      .catch((err) =>
        setState({
          status: "error",
          payment: null,
          error: err?.response?.data?.message || "Could not verify payment status.",
        })
      );
  }, [orderId]);

  if (state.status === "checking") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <Spinner />
        <p className="mt-4 text-stone-500">Confirming your eSewa payment…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold text-stone-900">Couldn&apos;t confirm payment</h1>
        <p className="mt-2 text-sm text-stone-500">{state.error}</p>
        {orderId && (
          <Link to={`/orders/${orderId}`} className="mt-6 font-medium text-brand-600 hover:text-brand-700">
            View order
          </Link>
        )}
      </div>
    );
  }

  const success = state.payment.status === "success";
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold text-stone-900">
        {success ? "Payment successful" : "Payment not completed"}
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        {success
          ? "Your eSewa payment was confirmed. Thank you for your order!"
          : `Payment status: ${state.payment.status}. You can retry payment from your order page.`}
      </p>
      <Link to={`/orders/${orderId}`} className="mt-6 font-medium text-brand-600 hover:text-brand-700">
        View order
      </Link>
    </div>
  );
}
