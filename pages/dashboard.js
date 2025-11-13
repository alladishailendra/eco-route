"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });

          try {
            const res = await fetch(
              `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`,
              { headers: { "User-Agent": "EcoRouteDashboard/1.0" } }
            );
            const data = await res.json();
            const instant =
              data?.properties?.timeseries?.[0]?.data?.instant?.details;

            if (instant) {
              const temp = instant.air_temperature ?? 25;
              const humidity = instant.relative_humidity ?? 60;
              const wind = instant.wind_speed ?? 2;
              setWeather({ temp, humidity, wind });
            } else {
              setError("⚠️ Weather data unavailable right now.");
            }
          } catch (err) {
            console.error(err);
            setError("⚠️ Error fetching weather data.");
          }
        },
        () => setError("❌ Location access denied.")
      );
    } else {
      setError("⚠️ Geolocation not supported by this device.");
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        background:
          "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        fontFamily: "Poppins, sans-serif",
        transition: "background 1s ease",
        overflowX: "hidden",
      }}
    >
      <Navbar />

      <div
        style={{
          zIndex: 5,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "80vh",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            marginBottom: "1rem",
            textShadow: "0 0 10px rgba(255,255,255,0.5)",
          }}
        >
          🌍 Real-Time Weather Dashboard
        </h1>

        {error && (
          <p
            style={{
              color: "#ff4d4d",
              background: "rgba(0,0,0,0.4)",
              padding: "10px 20px",
              borderRadius: "10px",
            }}
          >
            {error}
          </p>
        )}

        {!error && !location && <p>📡 Detecting your location...</p>}

        {location && weather && (
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "20px",
              padding: "2rem",
              width: "90%",
              maxWidth: "350px",
              backdropFilter: "blur(6px)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              animation: "fadeIn 1s ease",
            }}
          >
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              🌡️ {weather.temp.toFixed(1)}°C
            </h2>
            <p>💧 Humidity: {weather.humidity}%</p>
            <p>💨 Wind: {(weather.wind * 3.6).toFixed(1)} km/h</p>
            <p style={{ marginTop: "0.8rem" }}>
              📍 Lat: {location.latitude.toFixed(2)}, Lon:{" "}
              {location.longitude.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <footer
        style={{
          zIndex: 5,
          textAlign: "center",
          padding: "1rem",
          opacity: 0.8,
        }}
      >
        🌦️ Powered by MET Norway | Built with ❤️ for EcoRoute
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Fully responsive across devices */
        @media (max-width: 768px) {
          h1 { font-size: clamp(1.8rem, 5vw, 2.5rem); }
        }
        @media (min-width: 1200px) {
          div[style*="maxWidth: 350px"] {
            max-width: 400px;
          }
        }
      `}</style>
    </div>
  );
}
