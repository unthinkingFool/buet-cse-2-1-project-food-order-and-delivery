import React from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup, Polyline } from "react-leaflet";

import "leaflet/dist/leaflet.css";
const riderIcon = "Rider";
const customerIcon = "Home";
function RiderTracking({ data }) {
  const riderLat = data.rider_latitude;
  const riderLon = data.rider_longitude;
  const deliveryLat = data.delivery_latitude;
  const deliveryLon = data.delivery_longitude;

  const path = [
    [riderLat, riderLon],
    [deliveryLat, deliveryLon],
  ];
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const center = [riderLat, riderLon];

  return (
    <div>
      <div>
        <div>
          To Reach Your Destination : {getDistance(riderLat,riderLon,deliveryLat,deliveryLon)} meters
        </div>
        <MapContainer
          center={center}
          zoom={15}
          style={{
            height: "400px",
            width: "100%",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[deliveryLat, deliveryLon]}>
            <Popup>Destination</Popup>
          </Marker>
          <Marker position={[riderLat, riderLon]}>
            <Popup>Rider</Popup>
          </Marker>
          <Polyline positions={path} color="orange"/>
        </MapContainer>
       
      </div>
    </div>
  );
}

export default RiderTracking;
