"use client";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "linear-gradient(180deg, #e3f2fd, #ffffff)",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          maxWidth: "800px",
          margin: "100px auto",
          textAlign: "center",
          padding: "30px",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            color: "#0d47a1",
            marginBottom: "20px",
            fontWeight: "700",
          }}
        >
          About DreamRoute
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "1.1rem",
            lineHeight: "1.8",
            marginBottom: "20px",
          }}
        >
          <b>DreamRoute</b> isn’t just a navigation tool — it’s a vision for the
          future of Earth. We believe that every journey should not only be fast
          and smart but also sustainable and eco-friendly. 🌱
        </p>

        <p
          style={{
            color: "#444",
            fontSize: "1.05rem",
            lineHeight: "1.8",
          }}
        >
          Pollution, traffic congestion, and careless route planning contribute
          heavily to global emissions. DreamRoute takes a stand — by finding
          cleaner routes, analyzing vehicle health, and alerting users about
          environmental impact, we lead the change for a greener tomorrow. 🌍
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{
            marginTop: "40px",
            background: "linear-gradient(90deg, #64b5f6, #81c784)",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "1.8rem",
              marginBottom: "10px",
            }}
          >
            🌟 Innovator & Visionary
          </h2>
          <h3
            style={{
              color: "#fff",
              fontSize: "1.4rem",
              fontWeight: "600",
            }}
          >
            ALLADI SHAILENDRA
          </h3>
          <p
            style={{
              color: "#f1f8e9",
              marginTop: "10px",
              fontStyle: "italic",
            }}
          >
            “Building the path that connects technology, sustainability, and
            humanity — one smart route at a time.”
          </p>
        </motion.div>

        <p
          style={{
            marginTop: "40px",
            color: "#333",
            fontSize: "1.05rem",
          }}
        >
          Together, let’s drive toward a cleaner sky and a brighter world.
          Because the future of Earth deserves the smartest DreamRoute. 🚗💨
        </p>
      </motion.div>
    </div>
  );
}
