"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#111",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <h2 style={{ fontSize: "20px", color: "#00d8ff" }}>EcoRoute</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link href="/home" className="navlink">Home</Link>
        <Link href="/map" className="navlink">Map</Link>
        <Link href="/dashboard" className="navlink">Dashboard</Link>
        <Link href="/compass" className="navlink">Compass</Link>
        <Link href="/about" className="navlink">About</Link>
        <Link href="/contact" className="navlink">Contact</Link>
      </div>
    </nav>
  );
}
