import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Popup,
  Polyline,
} from "react-leaflet";
import { Navigation, Bike, Home } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { motion } from "framer-motion";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Custom marker icons — orange bike badge for the rider, dark home pin for the destination
// Uses the actual lucide-react icon components, rendered to markup for Leaflet's divIcon
const riderIconSvg = renderToStaticMarkup(
  <Bike color="white" size={17} strokeWidth={2.5} />,
);
const customerIconSvg = renderToStaticMarkup(
  <Home color="white" size={16} strokeWidth={2.5} />,
);

const riderIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:34px;height:34px;border-radius:9999px;
      background:#FF5A36;border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      display:flex;align-items:center;justify-content:center;
    ">
      ${riderIconSvg}
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

const customerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:34px;height:34px;border-radius:9999px 9999px 9999px 0;
      background:#1F2023;border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">
        ${customerIconSvg}
      </div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border-2 border-[#1F2023] bg-white overflow-hidden"
    >
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 border-gray-100 bg-[#FAFAF8]">
        <Navigation className="h-3.5 w-3.5 text-[#FF5A36]" />
        <span className="text-xs font-bold uppercase tracking-wide text-[#1F2023]">
          To Reach Your Destination :{" "}
          {Math.round(
            getDistance(riderLat, riderLon, deliveryLat, deliveryLon),
          )}{" "}
          meters
        </span>
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

        <Marker position={[deliveryLat, deliveryLon]} icon={customerIcon}>
          <Popup>Destination</Popup>
        </Marker>
        <Marker position={[riderLat, riderLon]} icon={riderIcon}>
          <Popup>Rider</Popup>
        </Marker>
        <Polyline positions={path} color="orange" />
      </MapContainer>
    </motion.div>
  );
}

export default RiderTracking;