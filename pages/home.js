"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import WeatherTicker from "../components/weatherticker"; // ✅ lowercase import

// Load map dynamically (client-side only)
const HomeMap = dynamic(() => import("../components/homemap"), { ssr: false });

export default function HomePage() {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    const cities = [
      { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
      { name: "Mumbai", lat: 19.076, lon: 72.8777 },
      { name: "Delhi", lat: 28.6139, lon: 77.209 },
      { name: "Chennai", lat: 13.0827, lon: 80.2707 },
      { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    ];

    async function fetchWeather() {
      const apiKey = "YOUR_API_KEY"; // ⚠️ Replace with your actual key
      const results = [];

      for (const city of cities) {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`
          );
          const data = await res.json();

          if (data.main && data.weather) {
            const temp = data.main.temp;
            const condition = data.weather[0].main;
            const emoji =
              condition === "Rain"
                ? "🌧️"
                : condition === "Clouds"
                ? "☁️"
                : condition === "Clear"
                ? "☀️"
                : condition === "Haze"
                ? "🌫️"
                : "🌤️";

            results.push(`${emoji} ${city.name}: ${condition}, ${temp.toFixed(1)}°C`);
          } else {
            results.push(`⚠️ ${city.name}: Data unavailable`);
          }
        } catch {
          results.push(`⚠️ ${city.name}: Error fetching data`);
        }
      }

      setWeatherData(results);
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Refresh every 10 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "linear-gradient(to bottom right, #0f2027, #203a43, #2c5364)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <WeatherTicker data={weatherData} />
      <div style={{ flex: 1 }}>
        <HomeMap />
      </div>
    </div>
  );
}
