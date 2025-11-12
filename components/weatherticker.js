"use client";
import { useEffect, useState } from "react";

export default function WeatherTicker() {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("Fetching location...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather(lat, lon) {
      try {
        // 🌦️ Free weather API
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m`
        );
        const data = await res.json();

        const codeMap = {
          0: "☀️ Clear Sky",
          1: "🌤️ Mainly Clear",
          2: "⛅ Partly Cloudy",
          3: "☁️ Overcast",
          45: "🌫️ Fog",
          48: "🌁 Rime Fog",
          51: "🌦️ Light Drizzle",
          61: "🌧️ Rain",
          71: "🌨️ Snow",
          95: "⛈️ Thunderstorm",
        };

        setWeather({
          temp: data.current.temperature_2m,
          condition: codeMap[data.current.weathercode] || "🌈 Unknown",
          humidity: data.current.relative_humidity_2m,
          wind: data.current.windspeed_10m,
        });
      } catch (error) {
        console.error("Weather fetch failed:", error);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    }

    async function getLocationAndWeather() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            // 🌍 Reverse geocode using BigDataCloud (free & global)
            try {
              const geoRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
              );
              const geoData = await geoRes.json();

              const city =
                geoData.city ||
                geoData.locality ||
                geoData.principalSubdivision ||
                geoData.countryName ||
                "Unknown Area";

              const country = geoData.countryName
                ? `, ${geoData.countryName}`
                : "";

              setLocationName(city + country);
            } catch (e) {
              console.warn("Geocoding failed:", e);
              setLocationName("Unknown Area");
            }

            fetchWeather(lat, lon);
          },
          (err) => {
            console.warn("Location denied:", err);
            setLocationName("Location access denied ❌");
            setWeather(null);
            setLoading(false);
          }
        );
      } else {
        setLocationName("Location not supported ❌");
        setLoading(false);
      }
    }

    getLocationAndWeather();

    // 🔁 Auto-refresh every 10 minutes
    const interval = setInterval(getLocationAndWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-black text-white text-center py-2 animate-pulse">
        Fetching live weather updates...
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="w-full bg-gray-800 text-white text-center py-2">
        Weather data unavailable ❌
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2">
      <div className="whitespace-nowrap animate-scroll px-2 text-sm md:text-base">
        🌍 <b>{locationName}</b> — {weather.condition} | 🌡️ {weather.temp}°C | 💧{" "}
        {weather.humidity}% | 💨 {(weather.wind * 3.6).toFixed(1)} km/h
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll {
          display: inline-block;
          animation: scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
