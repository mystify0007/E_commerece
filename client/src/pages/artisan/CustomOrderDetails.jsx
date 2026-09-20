import { useParams } from "react-router-dom";
import { CustomOrderDetail } from "../../components/custom-order/CustomOrderDetail.jsx";

export function ArtisanCustomOrderDetails() {
  const { id } = useParams();
  return <CustomOrderDetail customOrderId={id} />;
}
