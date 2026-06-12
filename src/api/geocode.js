// Geocoding via OpenStreetMap Nominatim (free, no API key, CORS-enabled).
// Usage policy: low volume + debounce. For production, self-host Nominatim/Photon.

const NOMINATIM = "https://nominatim.openstreetmap.org";

/** Build a concise, readable label from a Nominatim address object. */
export function formatAddress(a = {}) {
  const area =
    a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.hamlet;
  const city = a.city || a.town || a.village || a.municipality || a.county;
  const district = a.state_district || a.county;
  const parts = [];
  if (area && area !== city) parts.push(area);
  if (city) parts.push(city);
  if (district && district !== city) parts.push(district);
  if (a.state) parts.push(a.state);
  if (a.postcode) parts.push(a.postcode);
  return parts.filter(Boolean).join(", ");
}

/** Forward search: a typed query -> list of place suggestions (India). */
export async function searchPlaces(query, signal) {
  const q = query.trim();
  if (q.length < 3) return [];
  const url =
    `${NOMINATIM}/search?q=${encodeURIComponent(q)}` +
    `&format=jsonv2&addressdetails=1&limit=6&countrycodes=in`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("geocode failed");
  const data = await res.json();
  return data.map((d) => ({
    lat: Number(d.lat),
    lng: Number(d.lon),
    label: formatAddress(d.address) || d.display_name,
    full: d.display_name,
    address: d.address,
  }));
}

/** Reverse: lat/lng -> a readable label + structured address. */
export async function reverseGeocode(lat, lng, signal) {
  const url =
    `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}` +
    `&format=jsonv2&addressdetails=1`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("reverse geocode failed");
  const d = await res.json();
  return { label: formatAddress(d.address) || d.display_name, address: d.address };
}
