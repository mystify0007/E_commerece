import { useParams } from "react-router-dom";
import { CustomOrderDetail } from "../../components/custom-order/CustomOrderDetail.jsx";

export function CustomerCustomOrderDetails() {
  const { id } = useParams();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <CustomOrderDetail customOrderId={id} />
    </div>
  );
}
