const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Node 18+ => fetch is available globally (NO node-fetch needed)

async function safeJsonFetch(url) {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("safeJsonFetch: invalid JSON:", text.slice(0, 300));
      throw new Error("Invalid JSON response");
    }
  } catch (err) {
    console.error("safeJsonFetch error", err);
    return null;
  }
}

app.get("/route", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "Missing ?from & ?to" });
  }

  const url =
    "https://router.project-osrm.org/route/v1/driving/" +
    `${from};${to}?overview=full&geometries=geojson`;

  const data = await safeJsonFetch(url);

  if (!data) {
    return res.status(500).json({ error: "Routing failed" });
  }

  res.json(data);
});

app.listen(3001, () => console.log("Server running on port 3001"));
