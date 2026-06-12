import { useEffect, useRef, useState } from "react";
import { FiMapPin, FiCrosshair, FiSearch, FiLoader } from "react-icons/fi";
import { searchPlaces } from "../api/geocode";
import { useLocation } from "../location/LocationContext";

/**
 * "Deliver to" bar: shows the current location label and lets the user type a
 * city / area / district / state / PIN to autocomplete and recenter.
 */
export default function LocationSearch({ onPick }) {
  const { location, status, setLocation, detectCurrent } = useLocation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  // Debounced autocomplete.
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        setResults(await searchPlaces(query, ctrl.signal));
      } catch {
        /* aborted or failed */
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  // Close dropdown on outside click.
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (place) => {
    const loc = { lat: place.lat, lng: place.lng, label: place.label, source: "search" };
    setLocation(loc);
    setQuery("");
    setResults([]);
    setOpen(false);
    onPick?.(loc);
  };

  const useCurrent = async () => {
    setOpen(false);
    await detectCurrent();
    onPick?.();
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            className="input pl-10"
            placeholder="Type a city, area, district, state or PIN…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          {loading && (
            <FiLoader className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-brand-500" />
          )}
        </div>
        <button onClick={useCurrent} className="btn-soft whitespace-nowrap px-3 py-2.5 text-sm" title="Use my current location">
          <FiCrosshair /> {status === "locating" ? "Locating…" : "Current"}
        </button>
      </div>

      {/* Current selection label */}
      <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-600">
        <FiMapPin className="text-brand-500" />
        <span className="font-semibold">Deliver to:</span>{" "}
        {location?.label || "Set your location"}
        {status === "denied" && (
          <span className="ml-1 text-xs text-red-500">(location blocked — type it above)</span>
        )}
      </p>

      {/* Suggestions dropdown */}
      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5 animate-pop-in">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => pick(r)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-orange-50"
              >
                <FiMapPin className="mt-0.5 shrink-0 text-brand-500" />
                <span>
                  <span className="block font-semibold text-ink-900">{r.label}</span>
                  <span className="block text-xs text-ink-500">{r.full}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
