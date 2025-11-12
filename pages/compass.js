"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Robust Compass
 * - Uses real device sensor when available (requestPermission for iOS)
 * - Falls back to mouse-driven heading on desktop
 * - Smooths heading to avoid jitter
 */

export default function CompassPage() {
  const router = useRouter();

  const [heading, setHeading] = useState(0); // displayed heading (0-360)
  const [enabled, setEnabled] = useState(false); // true after user taps Enable
  const [usingSensor, setUsingSensor] = useState(false); // true if sensor data received
  const [permissionDenied, setPermissionDenied] = useState(false);
  const targetRef = useRef(0); // raw target heading
  const smoothedRef = useRef(0); // for smoothing
  const rafRef = useRef(null);

  // small smoothing function (lerp)
  const smoothTo = (from, to, alpha = 0.18) => {
    // choose shortest rotation direction across 0/360 boundary
    let diff = ((to - from + 540) % 360) - 180;
    return (from + diff * alpha + 360) % 360;
  };

  // request permission (iOS) or enable sensor flow
  const enableCompass = async () => {
    setPermissionDenied(false);

    // If permission API exists (iOS Safari)
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
          setEnabled(true); // still enable mouse fallback
        }
      } catch (err) {
        console.warn("permission error", err);
        setPermissionDenied(true);
        setEnabled(true);
      }
    } else {
      // No permission API — enable and try sensors
      setEnabled(true);
    }
  };

  // handle device orientation events (mobile)
  useEffect(() => {
    if (!enabled) return;

    let gotSensor = false;

    const handleOrientation = (event) => {
      // event may provide webkitCompassHeading (iOS) or alpha
      let alpha = null;
      if (typeof event.webkitCompassHeading !== "undefined" && event.webkitCompassHeading !== null) {
        alpha = event.webkitCompassHeading; // degrees; 0 = North
      } else if (typeof event.alpha === "number") {
        alpha = event.alpha;
      }

      if (alpha === null || alpha === undefined || isNaN(alpha)) {
        return;
      }

      // Screen orientation compensation (if needed)
      const screenAngle = (() => {
        if (typeof window.screen !== "undefined" && window.screen.orientation && typeof window.screen.orientation.angle === "number") {
          return window.screen.orientation.angle;
        }
        if (typeof window.orientation === "number") return window.orientation;
        return 0;
      })();

      // Some browsers give alpha relative to device, we subtract screen rotation
      let headingNow = (alpha - screenAngle + 360) % 360;

      // If webkitCompassHeading (iOS) it's already earth-referenced; keep it
      if (typeof event.webkitCompassHeading !== "undefined") {
        headingNow = event.webkitCompassHeading;
      }

      targetRef.current = (headingNow + 360) % 360;
      gotSensor = true;
      setUsingSensor(true);
    };

    // add listeners
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    // wait a short time — if no sensor event arrives, we'll fallback to mouse simulation
    const checkSensorTimeout = setTimeout(() => {
      if (!gotSensor) {
        setUsingSensor(false);
      }
    }, 1200);

    return () => {
      clearTimeout(checkSensorTimeout);
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [enabled]);

  // mouse fallback (desktop) — active if enabled but no sensor data
  useEffect(() => {
    if (!enabled) return;

    const handleMouse = (e) => {
      if (usingSensor) return; // if sensor starts working, ignore mouse
      const compass = document.getElementById("compass");
      if (!compass) return;

      const rect = compass.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = cy - e.clientY; // invert y so up is 0 deg
      let ang = (Math.atan2(dx, dy) * 180) / Math.PI; // [-180,180]
      ang = (ang + 360) % 360;
      targetRef.current = ang;
    };

    // if permission denied we still allow mouse
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [enabled, usingSensor]);

  // animation frame to smoothly update displayed heading (run always after enabled)
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      const current = smoothedRef.current || 0;
      const next = smoothTo(current, targetRef.current, 0.14); // smoothing factor
      smoothedRef.current = next;
      setHeading(Number(next.toFixed(2)));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  const getCardinal = (deg) => {
    const arr = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return arr[Math.round(((deg % 360) / 45)) % 8];
  };

  // small UI: initial enable prompt
  if (!enabled) {
    return (
      <div style={styles.container}>
        <button onClick={enableCompass} style={styles.enableBtn}>
          Enable Compass (Tap)
        </button>
        <p style={{ marginTop: 16, color: "#333" }}>
          If on mobile, allow motion permission when prompted. On desktop, move your mouse to simulate direction.
        </p>
        {permissionDenied && <p style={{ color: "red", marginTop: 8 }}>Permission denied — using mouse fallback.</p>}
      </div>
    );
  }

  // main compass UI
  return (
    <div style={styles.container}>
      <button onClick={() => router.push("/")} style={styles.backBtn}>
        ⬅ Home
      </button>

      <div id="compass" style={styles.compass}>
        {/* rotating dial (we rotate the ticks opposite to needle for natural feel) */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: `rotate(${-heading}deg)`,
            transition: "transform 0.06s linear",
          }}
        >
          {/* marks every 10 deg (draw a subset for performance) */}
          {Array.from({ length: 36 }, (_, i) => {
            const deg = i * 10;
            const style = {
              position: "absolute",
              top: "50%",
              left: "50%",
              width: deg % 30 === 0 ? 4 : 2,
              height: deg % 30 === 0 ? 18 : 10,
              background: deg % 90 === 0 ? "#ff3b30" : "#ddd",
              transform: `rotate(${deg}deg) translateY(-126px)`,
              transformOrigin: "center bottom",
              borderRadius: 2,
            };
            return <div key={deg} style={style} />;
          })}

          {/* N E S W labels */}
          {["N", "E", "S", "W"].map((lbl, idx) => {
            const deg = idx * 90;
            const rad = (deg * Math.PI) / 180;
            const x = 160 + Math.sin(rad) * 110;
            const y = 160 - Math.cos(rad) * 110;
            return (
              <div
                key={lbl}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                  color: lbl === "N" ? "#ff3b30" : "#fff",
                  fontWeight: "700",
                  fontSize: 18,
                }}
              >
                {lbl}
              </div>
            );
          })}
        </div>

        {/* Needle: red north pointer */}
        <div
          style={{
            position: "absolute",
            width: 6,
            height: 132,
            background: "linear-gradient(#ff6b6b,#ff0000)",
            top: "50%",
            left: "50%",
            transform: `rotate(${heading}deg) translate(-50%, -100%)`,
            transformOrigin: "bottom center",
            borderRadius: 3,
            boxShadow: "0 0 10px rgba(255,0,0,0.5)",
          }}
        />

        {/* tail */}
        <div
          style={{
            position: "absolute",
            width: 6,
            height: 90,
            background: "linear-gradient(#4da6ff,#0077ff)",
            top: "50%",
            left: "50%",
            transform: `rotate(${heading + 180}deg) translate(-50%, -100%)`,
            transformOrigin: "bottom center",
            borderRadius: 3,
            boxShadow: "0 0 8px rgba(0,120,255,0.4)",
          }}
        />

        {/* center pivot */}
        <div style={styles.pivot} />
      </div>

      <div style={{ marginTop: 18, fontSize: 20, fontWeight: 700 }}>
        {heading.toFixed(0)}° {getCardinal(heading)}
      </div>

      <div style={{ marginTop: 8, color: "#666" }}>
        Mode: {usingSensor ? "Sensor (mobile)" : "Mouse fallback (desktop)"}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at center, #0f1724, #071422)",
    color: "#fff",
    position: "relative",
  },
  enableBtn: {
    padding: "14px 36px",
    fontSize: 18,
    borderRadius: 10,
    border: "none",
    background: "#0ea5a4",
    color: "#012",
    fontWeight: 700,
    cursor: "pointer",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#0ea5a4",
    color: "#012",
    fontWeight: 700,
    cursor: "pointer",
  },
  compass: {
    position: "relative",
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "radial-gradient(circle at center, #1f2937, #0b1220)",
    border: "6px solid rgba(255,255,255,0.03)",
    boxShadow: "inset 0 0 20px rgba(255,255,255,0.02), 0 8px 30px rgba(0,0,0,0.7)",
  },
  pivot: {
    position: "absolute",
    width: 20,
    height: 20,
    background: "#111",
    borderRadius: "50%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 10px rgba(255,255,255,0.04)",
  },
};
