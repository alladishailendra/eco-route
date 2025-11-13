"use client";
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

export default function MapComponent() {
  const mapRef = useRef(null);
  const routeRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const normalLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState({ distance: "", eta: "" });
  const [poiMarkers, setPoiMarkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [satelliteView, setSatelliteView] = useState(false);
  const [directions, setDirections] = useState([]);
  const [showDirections, setShowDirections] = useState(false);

  const coordsRef = useRef([]);
  const WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map("map", {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
    });

    normalLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapRef.current);

    satelliteLayerRef.current = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri", maxZoom: 19 }
    );

    L.control.zoom({ position: "bottomleft" }).addTo(mapRef.current);

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      mapRef.current.setView([latitude, longitude], 14);
      vehicleMarkerRef.current = L.marker([latitude, longitude], {
        icon: L.divIcon({
          html: "📍",
          className: "vehicle-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      }).addTo(mapRef.current);
    });

    fetchPOIs();
    const alertInterval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(alertInterval);
  }, []);

  const toggleMapView = () => {
    if (!mapRef.current) return;
    if (!satelliteView) {
      mapRef.current.removeLayer(normalLayerRef.current);
      satelliteLayerRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(satelliteLayerRef.current);
      normalLayerRef.current.addTo(mapRef.current);
    }
    setSatelliteView(!satelliteView);
  };

  const fetchPOIs = async (touristOnly = false) => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

    const query = touristOnly
      ? `[out:json][timeout:25];(node["tourism"~"museum|zoo|park|artwork|attraction|hotel|guest_house|hostel"](${bbox});node["amenity"~"restaurant|cafe|hotel"](${bbox}););out center 50;`
      : `[out:json][timeout:25];(node["amenity"~"restaurant|cafe|hospital|school|college|university|bank"](${bbox});node["shop"~"mall|supermarket|department_store"](${bbox});node["place"~"neighbourhood|suburb|village|locality"](${bbox});node["tourism"~"hotel|guest_house|hostel"](${bbox}););out center 50;`;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: { Accept: "application/json" },
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return;

      const data = await res.json();
      poiMarkers.forEach((m) => mapRef.current.removeLayer(m));

      const newMarkers = data.elements
        .map((el) => {
          if (!el.lat || !el.lon) return null;
          return L.marker([el.lat, el.lon])
            .bindPopup(
              `<b>${el.tags.name || "Unknown"}</b><br/>${
                el.tags.amenity ||
                el.tags.tourism ||
                el.tags.shop ||
                el.tags.place ||
                ""
              }`
            )
            .addTo(mapRef.current);
        })
        .filter(Boolean);

      setPoiMarkers(newMarkers);
    } catch (err) {
      console.error("POI fetch error:", err);
    }
  };

  const fetchAlerts = async () => {
    if (!mapRef.current) return;
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );
      const { latitude, longitude } = pos.coords;

      const pollutionRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
      );
      const pollutionData = await pollutionRes.json();
      const aqi = pollutionData?.list?.[0]?.main?.aqi || 0;

      let pollutionMsg = "";
      if (aqi === 1) pollutionMsg = "Air Quality: Good ✅";
      else if (aqi === 2) pollutionMsg = "Air Quality: Fair ⚠️";
      else if (aqi === 3) pollutionMsg = "Air Quality: Moderate ⚠️";
      else if (aqi === 4) pollutionMsg = "Air Quality: Poor ❌";
      else if (aqi === 5) pollutionMsg = "Air Quality: Very Poor ❌";

      const roadProblems = [
        "Bumpy road ahead",
        "Flooded road",
        "Construction work",
      ];
      const randomRoad =
        Math.random() < 0.3
          ? roadProblems[Math.floor(Math.random() * roadProblems.length)]
          : null;

      const newAlerts = [];
      if (pollutionMsg) newAlerts.push(pollutionMsg);
      if (randomRoad) newAlerts.push(randomRoad);
      setAlerts(newAlerts);
    } catch (err) {
      console.error("Alert fetch error:", err);
    }
  };

  const geocodePlace = async (place) => {
    if (!place) return null;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=1&q=${encodeURIComponent(
          place
        )}`,
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      if (data.length > 0)
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      return null;
    } catch {
      return null;
    }
  };

  const startNavigation = async () => {
    setNavigationStarted(true);
    const fromCoord = await geocodePlace(from);
    const toCoord = await geocodePlace(to);
    if (!fromCoord || !toCoord) {
      setNavigationStarted(false);
      return;
    }

    if (routeRef.current && mapRef.current.hasLayer(routeRef.current)) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }
    if (vehicleMarkerRef.current && mapRef.current.hasLayer(vehicleMarkerRef.current)) {
      mapRef.current.removeLayer(vehicleMarkerRef.current);
      vehicleMarkerRef.current = null;
    }

    const router = L.Routing.osrmv1();
    router.route(
      [
        L.Routing.waypoint(L.latLng(fromCoord.lat, fromCoord.lng)),
        L.Routing.waypoint(L.latLng(toCoord.lat, toCoord.lng)),
      ],
      (err, routes) => {
        if (err || !routes || !routes.length) {
          console.error("Route error:", err);
          setNavigationStarted(false);
          return;
        }

        const route = routes[0];
        coordsRef.current = route.coordinates;

        routeRef.current = L.polyline(coordsRef.current, {
          color: "green",
          weight: 6,
        }).addTo(mapRef.current);
        mapRef.current.fitBounds(routeRef.current.getBounds());

        vehicleMarkerRef.current = L.marker(
          [coordsRef.current[0].lat, coordsRef.current[0].lng],
          {
            icon: L.divIcon({
              html: "🚗",
              className: "vehicle-marker",
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            }),
          }
        ).addTo(mapRef.current);

        const distanceKM = (route.summary.totalDistance / 1000).toFixed(2);
        const durationH = Math.floor(route.summary.totalTime / 3600);
        const durationM = Math.floor((route.summary.totalTime % 3600) / 60);
        setDistanceInfo({
          distance: `${distanceKM} km`,
          eta: `${durationH}h ${durationM}m`,
        });

        const steps = route.instructions?.map((i) => i.text) || [];
        setDirections(steps);
      }
    );
  };

  const resetMap = () => {
    setFrom("");
    setTo("");
    setDistanceInfo({ distance: "", eta: "" });
    setNavigationStarted(false);
    setDirections([]);
    setShowDirections(false);
    setAlerts([]);

    if (routeRef.current && mapRef.current.hasLayer(routeRef.current)) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }
    if (vehicleMarkerRef.current && mapRef.current.hasLayer(vehicleMarkerRef.current)) {
      mapRef.current.removeLayer(vehicleMarkerRef.current);
      vehicleMarkerRef.current = null;
    }

    poiMarkers.forEach((m) => {
      if (mapRef.current.hasLayer(m)) mapRef.current.removeLayer(m);
    });
    setPoiMarkers([]);

    document
      .querySelectorAll(".leaflet-routing-container")
      .forEach((el) => el.remove());

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      mapRef.current.setView([latitude, longitude], 14);
      vehicleMarkerRef.current = L.marker([latitude, longitude], {
        icon: L.divIcon({
          html: "📍",
          className: "vehicle-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      }).addTo(mapRef.current);
    });
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <div className="search-container">
        <input placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="press-button" onClick={startNavigation}>Start</button>
        <button className="press-button" onClick={resetMap}>Reset</button>
      </div>

      <div id="map" style={{ height: "100%", width: "100%" }}></div>

      <div className="top-right-buttons">
        <button className="press-button" onClick={toggleMapView}>
          {satelliteView ? "Normal View" : "Satellite View"}
        </button>
        <button className="press-button" onClick={() => fetchPOIs(true)}>Tourist Places</button>
      </div>

      <div className="bottom-right">
        {directions.length > 0 && (
          <button className="press-button" onClick={() => setShowDirections(!showDirections)}>
            {showDirections ? "Hide Directions" : "Directions"}
          </button>
        )}
      </div>

      {showDirections && (
        <div className="directions-panel">
          <h3>Step-by-Step Directions</h3>
          {directions.map((d, i) => (
            <div key={i}>{i + 1}. {d}</div>
          ))}
        </div>
      )}

      <div className="navigation-bar">
        {distanceInfo.distance && distanceInfo.eta && (
          <div>Distance: {distanceInfo.distance} | ETA: {distanceInfo.eta}</div>
        )}
      </div>

      <div className="alerts-panel">
        {alerts.map((a, i) => (
          <div key={i}>⚠️ {a}</div>
        ))}
      </div>

      <style jsx>{`
        * { box-sizing: border-box; }

        #map {
          height: 100%;
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }

        .press-button {
          padding: 8px 14px;
          border-radius: 8px;
          margin: 3px;
          background: #1a73e8;
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          transition: 0.1s;
        }

        .press-button:active {
          transform: scale(0.95);
        }

        .search-container {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .search-container input {
          padding: 8px 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.9rem;
          width: 140px;
        }

        .top-right-buttons {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bottom-right {
          position: absolute;
          bottom: 130px;
          right: 10px;
          z-index: 1000;
        }

        .directions-panel {
          position: absolute;
          bottom: 160px;
          right: 10px;
          max-height: 300px;
          overflow-y: auto;
          width: 85vw;
          max-width: 300px;
          background: #fff;
          padding: 10px;
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
          z-index: 1000;
        }

        .navigation-bar {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: #fff;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: bold;
          font-size: 1rem;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
        }

        .alerts-panel {
          position: absolute;
          bottom: 150px;
          right: 10px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .alerts-panel div {
          background: #ff5722;
          padding: 6px;
          border-radius: 6px;
          color: #fff;
          font-size: 0.9rem;
        }

        /* ✅ RESPONSIVE FIXES */
        @media (max-width: 768px) {
          .search-container {
            top: 10px;
            flex-direction: column;
            width: 90%;
          }
          .search-container input {
            width: 100%;
          }
          .top-right-buttons {
            flex-direction: row;
            bottom: 80px;
            top: auto;
            right: 50%;
            transform: translateX(50%);
          }
          .directions-panel {
            bottom: 200px;
            width: 90%;
            right: 50%;
            transform: translateX(50%);
          }
          .navigation-bar {
            bottom: 10px;
            width: 90%;
            font-size: 0.9rem;
          }
          .alerts-panel {
            bottom: 240px;
            right: 50%;
            transform: translateX(50%);
          }
        }

        @media (min-width: 1600px) {
          .search-container input {
            width: 200px;
            font-size: 1rem;
          }
          .press-button {
            font-size: 1rem;
            padding: 10px 16px;
          }
          .navigation-bar {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
