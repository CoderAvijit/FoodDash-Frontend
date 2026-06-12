import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiStar, FiSearch } from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { Loader, Empty, FoodThumb } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { useLocation } from "../../location/LocationContext";
import LocationSearch from "../../components/LocationSearch";

export default function Nearby() {
  const toast = useToast();
  const { location } = useLocation();
  const [radius, setRadius] = useState(5);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameQuery, setNameQuery] = useState("");

  const loadNearby = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    try {
      const { data } = await api.get("/restaurants/nearby", {
        params: { lat: location.lat, lng: location.lng, radiusKm: radius, page: 0, size: 30 },
      });
      setList(data);
    } catch (err) {
      toast.error(errMsg(err, "Couldn't load nearby restaurants"));
    } finally {
      setLoading(false);
    }
  }, [location, radius, toast]);

  // Reload whenever the chosen location or radius changes.
  useEffect(() => {
    loadNearby();
  }, [loadNearby]);

  const searchByName = async (e) => {
    e.preventDefault();
    if (!nameQuery.trim()) return loadNearby();
    setLoading(true);
    try {
      const { data } = await api.get("/restaurants/search", {
        params: { q: nameQuery, page: 0, size: 30 },
      });
      setList(data.content || []);
    } catch (err) {
      toast.error(errMsg(err, "Search failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Location + controls */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-rose-600 px-6 py-6 text-white">
          <h1 className="text-2xl font-extrabold">Restaurants near you</h1>
          <p className="mt-1 text-sm text-white/90">
            Use your current location or search any city, area or PIN code.
          </p>
        </div>

        <div className="space-y-4 p-4">
          <LocationSearch onPick={() => setNameQuery("")} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <label className="whitespace-nowrap text-sm font-semibold text-ink-700">
                Within {radius} km
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="accent-brand-600"
              />
            </div>

            <form onSubmit={searchByName} className="relative sm:w-72">
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                className="input pl-10"
                placeholder="Find a restaurant by name…"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader label="Finding good food…" />
      ) : list.length === 0 ? (
        <Empty
          title="No restaurants found here"
          hint="Try widening the radius, or pick a different location above."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ r }) {
  return (
    <Link
      to={`/app/restaurants/${r.id}`}
      className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-card animate-fade-up"
    >
      <FoodThumb seed={r.id} className="relative h-36">
        <div className="absolute inset-0 flex items-end bg-black/10 p-4">
          <span className="text-3xl drop-shadow">🍲</span>
        </div>
        {!r.open && <span className="chip absolute right-3 top-3 bg-black/60 text-white">Closed</span>}
      </FoodThumb>
      <div className="p-4">
        <h3 className="text-lg font-bold group-hover:text-brand-600">{r.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">{r.address || "Tasty meals nearby"}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="chip bg-green-100 text-green-700">
            <FiStar className="fill-green-600" /> 4.4
          </span>
          {r.open && <span className="chip bg-brand-100 text-brand-700">Open now</span>}
        </div>
      </div>
    </Link>
  );
}
