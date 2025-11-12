"use client";
import { useEffect, useState } from "react";

export default function Weather() {
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`
      );
      const data = await res.json();
      setTemp(data.current?.temperature_2m);
    });
  }, []);

  return (
    <div className="card">
      <h2>Live Weather</h2>
      {temp ? <p>🌡️ Current Temp: {temp}°C</p> : <p>Loading...</p>}
    </div>
  );
}
