import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getCustomOrderRequest,
  createProposalRequest,
  respondToProposalRequest,
  updateProductionStageRequest,
} from "../../services/customOrderService.js";
import { ProductionTimeline } from "./ProductionTimeline.jsx";
import { Spinner } from "../common/Spinner.jsx";
import { ErrorState } from "../common/EmptyState.jsx";
import { Button } from "../common/Button.jsx";
import { Input } from "../common/Input.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

const NEXT_STAGE = {
  customer_approved: "material_preparation",
  material_preparation: "crafting",
  crafting: "quality_check",
  quality_check: "ready_for_shipment",
  ready_for_shipment: "shipped",
  shipped: "delivered",
};

export function CustomOrderDetail({ customOrderId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showProposalForm, setShowProposalForm] = useState(false);

  const { data: customOrder, isLoading, isError } = useQuery({
    queryKey: ["custom-order", customOrderId],
    queryFn: () => getCustomOrderRequest(customOrderId),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["custom-order", customOrderId] });
  }

  async function submitProposal(values) {
    try {
      await createProposalRequest(customOrderId, values);
      reset();
      setShowProposalForm(false);
      await invalidate();
      toast.success("Proposal sent");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send proposal");
    }
  }

  async function respond(proposalId, action) {
    try {
      await respondToProposalRequest(proposalId, { action });
      await invalidate();
      toast.success("Response recorded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to respond");
    }
  }

  async function advanceStage() {
    const next = NEXT_STAGE[customOrder.status];
    if (!next) return;
    try {
      await updateProductionStageRequest(customOrderId, next);
      await invalidate();
      toast.success(`Marked ${next.replace(/_/g, " ")}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update stage");
    }
  }

  if (isLoading) return <Spinner />;
  if (isError || !customOrder) return <ErrorState message="Custom request not found." />;

  const isCustomer = user?.role === "customer";
  const isArtisan = user?.role === "artisan";
  const canPropose =
    isArtisan && ["request_submitted", "design_review"].includes(customOrder.status);
  const canAdvance = isArtisan && NEXT_STAGE[customOrder.status];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Custom {customOrder.shoeType}</h1>
      <p className="text-sm text-stone-500">Requested {new Date(customOrder.createdAt).toLocaleDateString()}</p>

      <div className="mt-6 rounded-xl border border-stone-200 p-5">
        <ProductionTimeline status={customOrder.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-medium text-stone-900">Request Details</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Size</dt><dd>{customOrder.size}</dd></div>
            {customOrder.preferredColor && (
              <div className="flex justify-between"><dt className="text-stone-500">Color</dt><dd>{customOrder.preferredColor}</dd></div>
            )}
            {customOrder.material && (
              <div className="flex justify-between"><dt className="text-stone-500">Material</dt><dd>{customOrder.material}</dd></div>
            )}
            {customOrder.sole && (
              <div className="flex justify-between"><dt className="text-stone-500">Sole</dt><dd>{customOrder.sole}</dd></div>
            )}
            {customOrder.budget && (
              <div className="flex justify-between"><dt className="text-stone-500">Budget</dt><dd>{formatCurrency(customOrder.budget)}</dd></div>
            )}
          </dl>
          <p className="mt-3 text-sm text-stone-600">{customOrder.designDescription}</p>
          {customOrder.referenceImages?.length > 0 && (
            <div className="mt-3 flex gap-2">
              {customOrder.referenceImages.map((img) => (
                <img key={img} src={img} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        {canAdvance && (
          <div>
            <h2 className="font-medium text-stone-900">Production</h2>
            <Button className="mt-2" onClick={advanceStage}>
              Mark {NEXT_STAGE[customOrder.status].replace(/_/g, " ")}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-medium text-stone-900">Proposals</h2>

        {customOrder.proposals?.length === 0 && <p className="mt-2 text-sm text-stone-500">No proposals yet.</p>}

        <div className="mt-3 space-y-3">
          {customOrder.proposals?.map((proposal) => (
            <div key={proposal._id} className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-stone-900">{proposal.artisan?.shopName}</p>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-600">
                  {proposal.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-stone-600">{proposal.proposedDesignNotes}</p>
              <p className="mt-2 text-sm text-stone-500">
                {formatCurrency(proposal.price)} · {proposal.productionTimeDays} days
                {proposal.depositRequired > 0 && ` · ${formatCurrency(proposal.depositRequired)} deposit`}
              </p>
              {isCustomer && proposal.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => respond(proposal._id, "accept")}>Accept</Button>
                  <Button variant="outline" onClick={() => respond(proposal._id, "revision_requested")}>
                    Request Changes
                  </Button>
                  <Button variant="outline" onClick={() => respond(proposal._id, "reject")}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {canPropose && !showProposalForm && (
          <Button variant="outline" className="mt-4" onClick={() => setShowProposalForm(true)}>
            Submit a Proposal
          </Button>
        )}

        {canPropose && showProposalForm && (
          <form onSubmit={handleSubmit(submitProposal)} className="mt-4 space-y-4 rounded-xl border border-stone-200 p-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">Design notes</span>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm"
                {...register("proposedDesignNotes", { required: true })}
              />
            </label>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Price (NPR)" type="number" min="0" {...register("price", { required: true })} />
              <Input label="Production time (days)" type="number" min="0" {...register("productionTimeDays", { required: true })} />
              <Input label="Deposit required (NPR)" type="number" min="0" {...register("depositRequired")} />
            </div>
            <Button type="submit" isLoading={isSubmitting}>
              Send Proposal
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
