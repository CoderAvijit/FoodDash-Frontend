import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Emoji pin icons (avoids bundler issues with Leaflet's default marker images).
const pin = (emoji, ring) =>
  L.divIcon({
    className: "",
    html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));
      ${ring ? "background:#fff;border-radius:9999px;padding:2px 4px;border:2px solid #ea580c;" : ""}">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 28],
  });

const SHOP_ICON = pin("🏪");
const HOME_ICON = pin("📍");
const RIDER_ICON = pin("🛵", true);

/** Haversine distance in meters between [lat,lng] points. */
function distM(a, b) {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Interpolate a point at fraction p (0..1) along a polyline of [lat,lng] points. */
function pointAt(points, p) {
  if (points.length < 2) return points[0];
  const segLen = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = distM(points[i - 1], points[i]);
    segLen.push(d);
    total += d;
  }
  let target = total * Math.max(0, Math.min(1, p));
  for (let i = 0; i < segLen.length; i++) {
    if (target <= segLen[i]) {
      const f = segLen[i] === 0 ? 0 : target / segLen[i];
      const a = points[i];
      const b = points[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    target -= segLen[i];
  }
  return points[points.length - 1];
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(points, { padding: [30, 30] });
    }
  }, [points, map]);
  return null;
}

/**
 * Live delivery map.
 * @param route   { fromLat, fromLng, toLat, toLng, points: [[lat,lng]...], restaurantName, customerName, travelMinutes }
 * @param moving  when true, animate the rider marker along the route (OUT_FOR_DELIVERY)
 * @param storageKey  unique key (orderId) used to persist the start time so progress is stable across refreshes
 */
export default function DeliveryMap({ route, moving, storageKey }) {
  const points = useMemo(
    () => (route?.points?.length ? route.points : [[route.fromLat, route.fromLng], [route.toLat, route.toLng]]),
    [route]
  );
  const [progress, setProgress] = useState(0);
  const startRef = useRef(null);

  // Animate the rider along the route while OUT_FOR_DELIVERY.
  useEffect(() => {
    if (!moving) {
      setProgress(0);
      return;
    }
    const key = `fooddash.deliveryStart.${storageKey}`;
    let start = Number(localStorage.getItem(key));
    if (!start) {
      start = Date.now();
      localStorage.setItem(key, String(start));
    }
    startRef.current = start;
    const travelMs = Math.max(60000, (route.travelMinutes || 10) * 60000); // at least 1 min of animation
    const tick = () => {
      const p = Math.min(1, (Date.now() - startRef.current) / travelMs);
      setProgress(p);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [moving, route, storageKey]);

  const riderPos = moving ? pointAt(points, progress) : null;
  const start = [route.fromLat, route.fromLng];
  const end = [route.toLat, route.toLng];

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
      <MapContainer center={start} zoom={13} scrollWheelZoom={false} style={{ height: 320, width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <Polyline positions={points} pathOptions={{ color: "#ea580c", weight: 5, opacity: 0.85 }} />
        <Marker position={start} icon={SHOP_ICON}>
          <Popup>{route.restaurantName || "Restaurant"}</Popup>
        </Marker>
        <Marker position={end} icon={HOME_ICON}>
          <Popup>Deliver to {route.customerName || "customer"}</Popup>
        </Marker>
        {riderPos && (
          <Marker position={riderPos} icon={RIDER_ICON}>
            <Popup>On the way to {route.customerName}</Popup>
          </Marker>
        )}
      </MapContainer>
      {route.straightLine && (
        <p className="bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
          Showing a straight line (road routing unavailable).
        </p>
      )}
    </div>
  );
}
