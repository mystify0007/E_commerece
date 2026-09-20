const STAGES = [
  { key: "request_submitted", label: "Request Submitted" },
  { key: "design_review", label: "Design Review" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "customer_approved", label: "Approved" },
  { key: "material_preparation", label: "Material Prep" },
  { key: "crafting", label: "Crafting" },
  { key: "quality_check", label: "Quality Check" },
  { key: "ready_for_shipment", label: "Ready to Ship" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export function ProductionTimeline({ status }) {
  if (status === "rejected" || status === "cancelled") {
    return (
      <span className="inline-block rounded-full bg-stone-100 px-3 py-1 text-sm font-medium capitalize text-stone-600">
        {status}
      </span>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="flex flex-wrap gap-x-1 gap-y-4">
      {STAGES.map((stage, i) => (
        <div key={stage.key} className="flex min-w-[80px] flex-1 flex-col items-center">
          <div className={`h-3 w-3 rounded-full ${i <= currentIndex ? "bg-brand-600" : "bg-stone-200"}`} />
          <span className={`mt-2 text-center text-xs ${i <= currentIndex ? "text-stone-900" : "text-stone-400"}`}>
            {stage.label}
          </span>
        </div>
      ))}
    </div>
  );
}
