import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";

function RiderDashboard() {
  const { userData, city } = useSelector((state) => state.user);
 const navigate=useNavigate()
  const [shopOrders, setShopOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAccept = async (shopOrderId) => {
  try {
    console.log("ACCEPTING SHOP ORDER:", shopOrderId);

    const result = await axios.put(
      `${serverUrl}/api/rider/accept-shop-order`,
      {
        shop_order_id: shopOrderId,
      },
      {
        withCredentials: true,
      }
    );

    console.log(
      "SHOP ORDER ACCEPTED:",
      result.data
    );

    // Navigate to the delivery/order page
    //navigate(`/rider/delivery/${shopOrderId}`);

  } catch (error) {
    console.error(
      "ACCEPT SHOP ORDER ERROR:",
      error.response?.data || error.message
    );

    if (error.response?.status === 409) {
      alert(
        "Sorry, another rider has already accepted this delivery."
      );

      // Refresh available offers
      // so the accepted order disappears.
      window.location.reload();
    }
  }
};
  useEffect(() => {
    const getBroadcastedShopOrders = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/rider/broadcasted-shop-orders`,
          {
            withCredentials: true,
          }
        );

        console.log(
          "BROADCASTED SHOP ORDERS:",
          result.data.shopOrders
        );

        setShopOrders(result.data.shopOrders);

      } catch (error) {
        console.error(
          "ERROR FETCHING BROADCASTED SHOP ORDERS:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    getBroadcastedShopOrders();
  }, []);

 

  return (
    <div>
      <Nav />

      <div>
        {/* Header */}
        <div>
          <h1>Welcome {userData?.name}</h1>

          <h2>City : {city}</h2>

          {userData?.location?.coordinates && (
            <h2>
              Latitude : {userData.location.coordinates[1]} ,
              Longitude : {userData.location.coordinates[0]}
            </h2>
          )}
        </div>

        {/* Broadcasted Orders */}
        <div>
          <h2>Available Deliveries</h2>

          {loading && <p>Loading available deliveries...</p>}

          {!loading && shopOrders.length === 0 && (
            <p>No delivery offers available.</p>
          )}

          <div>
            {shopOrders.map((order) => (
              <div key={order.shop_order_id}>

                <h3>
                  {order.restaurant.name}
                </h3>

                <p>
                  Restaurant Address:{" "}
                  {order.restaurant.address}
                </p>

                <p>
                  Delivery Address:{" "}
                  {order.delivery.address}
                </p>

                <p>
                  Payment:{" "}
                  {order.payment.method}
                </p>

                <p>
                  Shop Order Amount: ৳
                  {order.payment.shop_order_amount}
                </p>

                <h4>Items</h4>

                {order.items.map((item) => (
                  <div key={item.id}>
                    <p>
                      {item.name} × {item.quantity}
                    </p>
                  </div>
                ))}

                <button
                  onClick={() =>
                    handleAccept(order.shop_order_id)
                  }
                >
                  Accept
                </button>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default RiderDashboard;