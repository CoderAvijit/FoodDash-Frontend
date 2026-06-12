import { useEffect, useState } from "react";
import { FiMap, FiChevronUp } from "react-icons/fi";
import { api, errMsg } from "../api/client";
import DeliveryMap from "./DeliveryMap";
import { useToast } from "./Toast";

const TRACKABLE = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"];

/**
 * Shows a "Track on map" toggle for an order. Auto-expands while OUT_FOR_DELIVERY,
 * where the rider marker animates along the real road route.
 */
export default function OrderTrackingMap({ order }) {
  const toast = useToast();
  const moving = order.status === "OUT_FOR_DELIVERY";
  const [open, setOpen] = useState(moving);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || route) return;
    setLoading(true);
    api
      .get(`/orders/${order.id}/route`)
      .then((r) => setRoute(r.data))
      .catch((e) => toast.error(errMsg(e, "Couldn't load the route")))
      .finally(() => setLoading(false));
  }, [open, route, order.id, toast]);

  if (!TRACKABLE.includes(order.status)) return null;

  return (
    <div className="border-t border-black/5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-orange-50"
      >
        <span className="flex items-center gap-2">
          <FiMap /> {moving ? "Live delivery tracking" : "Track on map"}
        </span>
        {open && <FiChevronUp />}
      </button>
      {open && (
        <div className="px-3 pb-3">
          {loading || !route ? (
            <div className="grid h-40 place-items-center text-sm text-ink-500">Loading map…</div>
          ) : (
            <>
              <DeliveryMap route={route} moving={moving} storageKey={order.id} />
              <p className="mt-2 px-1 text-xs text-ink-500">
                {moving ? (
                  <>🛵 On the way to <b>{route.customerName}</b> · {route.distanceKm} km · ~{route.travelMinutes} min by road</>
                ) : (
                  <>Route to <b>{route.customerName}</b> · {route.distanceKm} km · ~{route.travelMinutes} min</>
                )}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
