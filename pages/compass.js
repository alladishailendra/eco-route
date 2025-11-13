"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Realistic Vintage Compass
 * - Works on all devices (motion sensor or mouse)
 * - Vintage brass-style UI
 * - Smooth animation and real-time updates
 */

export default function CompassPage() {
  const router = useRouter();
  const [heading, setHeading] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [usingSensor, setUsingSensor] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const enableCompass = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === "granted") {
          setEnabled(true);
        } else {
          setPermissionDenied(true);
          setEnabled(true);
        }
      } catch (e) {
        setPermissionDenied(true);
        setEnabled(true);
      }
    } else {
      setEnabled(true);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    let gotSensor = false;
    const handleOrientation = (event) => {
      let alpha = null;
      if (event.webkitCompassHeading != null) alpha = event.webkitCompassHeading;
      else if (typeof event.alpha === "number") alpha = 360 - event.alpha;

      if (alpha != null) {
        gotSensor = true;
        setUsingSensor(true);
        setHeading(alpha);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    const timeout = setTimeout(() => {
      if (!gotSensor) setUsingSensor(false);
    }, 1500);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearTimeout(timeout);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (usingSensor) return;

    const handleMouse = (e) => {
      const rect = document.body.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = e.clientX - cx;
      const dy = cy - e.clientY;
      const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
      setHeading((angle + 360) % 360);
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [enabled, usingSensor]);

  const getDirection = (deg) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  };

  if (!enabled) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <h1 style={styles.title}>🧭 Vintage Compass</h1>
          <button onClick={enableCompass} style={styles.enableBtn}>
            Enable Compass
          </button>
          <p style={{ marginTop: 15, fontSize: 14, color: "#ccc" }}>
            Works with motion sensors on mobile, or mouse movement on desktop.
          </p>
          {permissionDenied && (
            <p style={{ color: "salmon", marginTop: 8 }}>
              Permission denied — using mouse fallback.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button onClick={() => router.push("/")} style={styles.backBtn}>
        ⬅ Home
      </button>

      <div style={styles.compassOuter}>
        <div
          style={{
            ...styles.compassInner,
            transform: `rotate(${-heading}deg)`,
          }}
        >
          {/* Degree markers */}
          {Array.from({ length: 36 }).map((_, i) => {
            const deg = i * 10;
            return (
              <div
                key={deg}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: deg % 30 === 0 ? 3 : 2,
                  height: deg % 30 === 0 ? 16 : 10,
                  background: deg % 90 === 0 ? "#caa84f" : "#d8c37f",
                  transform: `rotate(${deg}deg) translateY(-130px)`,
                  transformOrigin: "center bottom",
                  borderRadius: 2,
                }}
              />
            );
          })}

          {/* Labels N E S W */}
          {["N", "E", "S", "W"].map((lbl, i) => {
            const angle = i * 90;
            const rad = (angle * Math.PI) / 180;
            const x = 150 + Math.sin(rad) * 110;
            const y = 150 - Math.cos(rad) * 110;
            return (
              <div
                key={lbl}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                  color: lbl === "N" ? "#e6b800" : "#f5deb3",
                  fontSize: 20,
                  fontWeight: 700,
                  textShadow: "0 0 5px #000",
                }}
              >
                {lbl}
              </div>
            );
          })}
        </div>

        {/* Needle */}
        <div
          style={{
            ...styles.needle,
            transform: `rotate(${heading}deg) translate(-50%, -100%)`,
          }}
        />

        {/* Needle tail */}
        <div
          style={{
            ...styles.tail,
            transform: `rotate(${heading + 180}deg) translate(-50%, -100%)`,
          }}
        />

        <div style={styles.centerCap} />
      </div>

      <div style={styles.readout}>
        {heading.toFixed(0)}° {getDirection(heading)}
      </div>
      <div style={styles.mode}>
        Mode: {usingSensor ? "Sensor (Mobile)" : "Mouse (Desktop)"}
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "radial-gradient(circle at center, #1c140d, #000)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Poppins, sans-serif",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: "8px 14px",
    background: "#caa84f",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
    color: "#222",
    boxShadow: "0 0 10px rgba(255,255,255,0.3)",
  },
  centerBox: {
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    marginBottom: 20,
    color: "#d4af37",
  },
  enableBtn: {
    padding: "14px 28px",
    background: "linear-gradient(180deg, #d4af37, #8b6b22)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
  },
  compassOuter: {
    position: "relative",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, #3a2e14, #1a1208)",
    border: "8px solid #caa84f",
    boxShadow: "inset 0 0 20px #000, 0 0 25px rgba(255,215,0,0.4)",
  },
  compassInner: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    transition: "transform 0.1s linear",
  },
  needle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 4,
    height: 120,
    background: "linear-gradient(to bottom, #ff4444, #990000)",
    borderRadius: 3,
    transformOrigin: "bottom center",
    boxShadow: "0 0 10px rgba(255,0,0,0.6)",
  },
  tail: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 4,
    height: 90,
    background: "linear-gradient(to bottom, #0055aa, #002244)",
    borderRadius: 3,
    transformOrigin: "bottom center",
    boxShadow: "0 0 8px rgba(0,120,255,0.5)",
  },
  centerCap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 22,
    height: 22,
    background: "radial-gradient(circle, #caa84f, #8b6b22)",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 10px rgba(255,215,0,0.6)",
  },
  readout: {
    marginTop: 25,
    fontSize: 22,
    fontWeight: "700",
    color: "#f5deb3",
    textShadow: "0 0 10px #000",
  },
  mode: {
    marginTop: 10,
    fontSize: 14,
    color: "#aaa",
  },
};
