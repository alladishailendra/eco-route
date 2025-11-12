"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";

const MapComponent = dynamic(() => import("../components/mapcomponent"), { ssr: false });

export default function MapPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Navbar />
      {/* Back to Home Button */}
      <div style={{ position: "absolute", top: 80, left: 20, zIndex: 1000 }}>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "#1a73e8",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          ⬅ Back to Home
        </button>
      </div>

      <MapComponent from={from} to={to} setFrom={setFrom} setTo={setTo} />
    </div>
  );
}
