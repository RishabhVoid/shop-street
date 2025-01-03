import { useToast } from "@/components/ui/use-toast";
import { ResponseCodes } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { OrderType, ProductType } from "@/types";
import { useEffect, useState } from "react";

const useHandleOrders = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [pageLoading, setPageLoading] = useState(false);

  const { authState } = useAuth();
  const { toast } = useToast();

  const popUp = (title: string, description: string) => {
    toast({
      title,
      description,
    });
  };

  const getOrders = async (email: string) => {
    const rawRes = await fetch(`/api/order?isSeller=false&email=${email}`);
    const jsonRes = await rawRes.json();

    if (jsonRes.status === ResponseCodes.UNKNOWN_ERROR) {
      popUp(
        "Oops! something went wrong!",
        "Something went wrong on our side while getting your orders. Please try again if the problem persues."
      );
      setPageLoading(false);
      return;
    } else if (jsonRes.status === ResponseCodes.SUCCESS) {
      setOrders(jsonRes.data.orders as OrderType[]);
      setPageLoading(false);
    }
    setPageLoading(false);
  };

  const getProductsByIds = async (
    idsString: string
  ): Promise<ProductType[]> => {
    const rawRes = await fetch(`/api/productsByIds?prodIds=${idsString}`);
    const jsonRes = await rawRes.json();

    if (jsonRes.status === ResponseCodes.UNKNOWN_ERROR) {
      return [];
    } else if (jsonRes.status === ResponseCodes.SUCCESS) {
      return jsonRes.data as ProductType[];
    } else return [];
  };

  useEffect(() => {
    if (authState?.isLoading || !authState?.user || !authState?.user?.email) return;
    setPageLoading(true);
    (async () => await getOrders(authState?.user?.email!))();
  }, [authState?.isLoading, authState?.user, authState?.user?.email]);

  return {
    orders,
    getProductsByIds,
    pageLoading,
  };
};

export default useHandleOrders;
