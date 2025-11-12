"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const email = "alladishailendra903@gmail.com";
  const phone = "9381504389";

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #e0f7fa, #ffffff)",
      }}
    >
      <Navbar />
      <div
        style={{
          maxWidth: "600px",
          margin: "80px auto",
          textAlign: "center",
          padding: "30px",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ fontSize: "2rem", color: "#00796b", marginBottom: "20px" }}>
          Contact Me
        </h1>

        <p
          style={{
            color: "#555",
            marginBottom: "20px",
            lineHeight: "1.6",
          }}
        >
          You can reach out to me via email or phone. Tap to contact, long press
          to copy details.
        </p>

        {/* Email Section */}
        <div
          style={{
            marginBottom: "25px",
            cursor: "pointer",
            padding: "12px",
            borderRadius: "12px",
            transition: "0.3s",
            background: "#f1f8e9",
          }}
          onClick={() => window.location.href = `mailto:${email}`}
          onContextMenu={(e) => {
            e.preventDefault();
            handleCopy(email);
          }}
        >
          <h3 style={{ color: "#2e7d32", marginBottom: "8px" }}>📧 Email</h3>
          <p style={{ color: "#33691e", fontSize: "1.1rem" }}>{email}</p>
        </div>

        {/* Phone Section */}
        <div
          style={{
            cursor: "pointer",
            padding: "12px",
            borderRadius: "12px",
            background: "#e3f2fd",
            transition: "0.3s",
          }}
          onClick={() => window.location.href = `tel:${phone}`}
          onContextMenu={(e) => {
            e.preventDefault();
            handleCopy(phone);
          }}
        >
          <h3 style={{ color: "#1565c0", marginBottom: "8px" }}>📞 Phone</h3>
          <p style={{ color: "#0d47a1", fontSize: "1.1rem" }}>{phone}</p>
        </div>

        {copied && (
          <p
            style={{
              marginTop: "20px",
              color: "green",
              fontWeight: "bold",
              animation: "fadeOut 2s ease-out",
            }}
          >
            Copied to clipboard ✅
          </p>
        )}
      </div>
    </div>
  );
}
