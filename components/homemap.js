"use client"; // ensures this page is client-only
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function HomeMap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // mark as client after mount
  }, []);

  useEffect(() => {
    if (!isClient) return; // only run on client
    if (document.getElementById("map")?._leaflet_id) return;

    const map = L.map("map", {
      zoomControl: true,
      attributionControl: true,
    }).setView([17.385, 78.4867], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          map.setView([lat, lon], 13);

          const userIcon = L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          });

          L.marker([lat, lon], { icon: userIcon })
            .addTo(map)
            .bindPopup("📍 You are here!")
            .openPopup();
        },
        () => console.warn("Geolocation permission denied.")
      );
    }

    return () => map.remove();
  }, [isClient]);

  return (
    <div
      id="map"
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "10px",
        boxShadow: "0 0 15px rgba(0,0,0,0.4)",
      }}
    />
  );
}
