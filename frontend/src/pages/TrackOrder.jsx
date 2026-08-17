import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Bike,
  Package,
  CreditCard,
  Clock,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { serverUrl } from "../App";
import axios from "axios";
import RiderTracking from "../components/RiderTracking";

function TrackOrder() {
  const navigate = useNavigate();
  const { shop_order_id } = useParams();

  const [shopOrder, setshopOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleGetOrder = async () => {
    try {
      setLoading(true);

      const result = await axios.get(
        `${serverUrl}/api/order/shop-order/${shop_order_id}`,
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      setshopOrder(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetOrder();
  }, [shop_order_id]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="h-9 w-9 border-4 border-gray-200 border-t-[#FF5A36] rounded-full animate-spin mx-auto" />

          <p className="text-sm text-gray-500 mt-3">Loading order...</p>
        </div>
      </div>
    );
  }

  // =========================
  // ORDER NOT FOUND
  // =========================

  if (!shopOrder?.order) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto" />

          <h1 className="text-lg font-bold text-[#1F2023] mt-3">
            Order not found
          </h1>

          <button
            onClick={() => navigate("/")}
            className="mt-5 rounded-lg bg-[#FF5A36] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const order = shopOrder.order;

  // =========================
  // STATUS
  // =========================

  const statuses = [
    {
      value: "confirmed",
      label: "Confirmed",
    },
    {
      value: "preparing",
      label: "Preparing",
    },
    {
      value: "out_for_delivery",
      label: "Out for delivery",
    },
    {
      value: "delivered",
      label: "Delivered",
    },
  ];

  const currentStatusIndex = statuses.findIndex(
    (item) => item.value === order.status,
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* =========================
            BACK
        ========================= */}

        <div
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </div>

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6">
          <p className="text-xs text-gray-500">
            Shop Order #{order.shop_order_id}
          </p>

          <h1 className="text-2xl font-bold text-[#1F2023] mt-1">
            Track Your Shop Order
          </h1>
        </div>

        {/* =========================
            ORDER STATUS
        ========================= */}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400">Current Status</p>

              <h2 className="text-lg font-bold text-[#FF5A36] mt-1">
                {order.status === "out_for_delivery"
                  ? "Out for Delivery"
                  : order.status.replaceAll("_", " ")}
              </h2>
            </div>

            <div className="h-11 w-11 rounded-full bg-[#FF5A36]/10 flex items-center justify-center">
              {order.status === "delivered" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-[#FF5A36]" />
              )}
            </div>
          </div>

          {/* Progress */}

          <div className="flex items-center">
            {statuses.map((status, index) => {
              const completed = currentStatusIndex >= index;

              return (
                <React.Fragment key={status.value}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        completed
                          ? "bg-[#FF5A36] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>

                    <span className="text-[10px] text-gray-500 mt-2 text-center max-w-[70px]">
                      {status.label}
                    </span>
                  </div>

                  {index < statuses.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        currentStatusIndex > index
                          ? "bg-[#FF5A36]"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* =========================
            RESTAURANT
        ========================= */}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-6">
          <div className="flex items-start gap-4">
            <img
              src={order.restaurant.image}
              alt={order.restaurant.name}
              className="h-20 w-20 rounded-xl object-cover bg-gray-100"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-[#FF5A36]" />

                <h2 className="text-lg font-bold text-[#1F2023]">
                  {order.restaurant.name}
                </h2>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {order.restaurant.address}
              </p>

              <p className="text-sm text-gray-500">{order.restaurant.city}</p>

              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                <Phone className="h-3.5 w-3.5 text-[#FF5A36]" />
                {order.restaurant.contact_no}
              </div>
            </div>
          </div>

          {/* Restaurant coordinates */}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="h-3.5 w-3.5" />
              Restaurant location:
              {order.restaurant.latitude}, {order.restaurant.longitude}
            </div>
          </div>
        </div>

        {/* =========================
            ITEMS
        ========================= */}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-[#FF5A36]" />

            <h2 className="text-lg font-bold text-[#1F2023]">Your Items</h2>
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.order_item_id}
                className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
              >
                <img
                  src={item.item_image}
                  alt={item.item_name}
                  className="h-16 w-16 rounded-lg object-cover bg-gray-100"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#1F2023] truncate">
                    {item.item_name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.category} • {item.food_type}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    ৳{item.price} × {item.quantity}
                  </p>
                </div>

                <p className="text-sm font-bold text-[#1F2023]">
                  ৳{item.item_total}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================
            DELIVERY
        ========================= */}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-[#FF5A36]" />

            <h2 className="text-lg font-bold text-[#1F2023]">
              Delivery Location
            </h2>
          </div>

          <p className="text-sm text-gray-600">{order.delivery.address}</p>

          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <Navigation className="h-3.5 w-3.5" />
            {order.delivery.latitude}, {order.delivery.longitude}
          </div>
        </div>

        {/* =========================
            RIDER
        ========================= */}

        {order.rider && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bike className="h-5 w-5 text-[#FF5A36]" />

              <h2 className="text-lg font-bold text-[#1F2023]">Your Rider</h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#FF5A36]/10 flex items-center justify-center">
                  <Bike className="h-6 w-6 text-[#FF5A36]" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#1F2023]">
                    {order.rider.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.rider.contact_no}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-400">Rider GPS</p>

                <p className="text-xs text-gray-500 mt-1">
                  {order.rider.latitude}, {order.rider.longitude}
                </p>
              </div>
            </div>

            {/* Rider location indicator */}

            {order.status === "out_for_delivery" && (
              <div className="mt-4 rounded-lg bg-[#FF5A36]/5 border border-[#FF5A36]/10 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />

                  <p className="text-xs font-medium text-[#1F2023]">
                    Rider is currently on the way
                  </p>
                </div>
              </div>
            )}
            {/** rider tracking */}
            {order.status === "out_for_delivery" && order.rider && (
              <div className="mt-4 rounded-lg bg-[#FF5A36]/5 border border-[#FF5A36]/10 p-3">
                <RiderTracking
                  data={{
                    rider_latitude: order.rider.latitude,
                    rider_longitude: order.rider.longitude,
                    delivery_latitude: order.delivery.latitude,
                    delivery_longitude: order.delivery.longitude,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* =========================
            PAYMENT
        ========================= */}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-[#FF5A36]" />

            <h2 className="text-lg font-bold text-[#1F2023]">Payment</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Payment Method</p>

              <p className="text-sm font-semibold text-[#1F2023] mt-1 uppercase">
                {order.payment.method}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">Shop Total</p>

              <p className="text-lg font-bold text-[#1F2023]">
                ৳{order.subtotal}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">
              Complete Order Total
            </p>

            <p className="text-lg font-bold text-[#FF5A36]">
              ৳{order.payment.total_amount}
            </p>
          </div>
        </div>

        {/* =========================
            ORDER TIME
        ========================= */}

        <div className="text-center text-xs text-gray-400 pb-6">
          Order placed on {new Date(order.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;
