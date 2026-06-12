import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { reverseGeocode } from "../api/geocode";

const LocationContext = createContext(null);

const KEY = "fooddash.location";
const DEFAULT = { lat: 12.9716, lng: 77.5946, label: "Bengaluru, Karnataka", source: "default" };

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => load());
  const [status, setStatus] = useState("idle"); // idle | locating | ok | denied | error

  const setLocation = useCallback((loc) => {
    setLocationState(loc);
    if (loc) localStorage.setItem(KEY, JSON.stringify(loc));
  }, []);

  /** Detect the device's current position, then reverse-geocode to a readable label. */
  const detectCurrent = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus("error");
      if (!location) setLocation(DEFAULT);
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng, label: "Locating address…", source: "gps" });
        try {
          const { label } = await reverseGeocode(lat, lng);
          setLocation({ lat, lng, label, source: "gps" });
        } catch {
          setLocation({ lat, lng, label: "Your current location", source: "gps" });
        }
        setStatus("ok");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        if (!location) setLocation(DEFAULT);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [location, setLocation]);

  // On first load, if we have no stored location, try to detect it.
  useEffect(() => {
    if (!location) detectCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocationContext.Provider value={{ location, status, setLocation, detectCurrent }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
