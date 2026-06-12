import { useEffect, useState, useCallback } from "react";
import { FiClock, FiX, FiRefreshCw } from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { Loader, Empty, StatusBadge, Money } from "../../components/ui";
import { useToast } from "../../components/Toast";
import OrderTrackingMap from "../../components/OrderTrackingMap";
import PaymentQr from "../../components/PaymentQr";

const FLOW = ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function MyOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/orders/me", { params: { page: 0, size: 50 } });
      setOrders(data.content || []);
    } catch (err) {
      if (!silent) toast.error(errMsg(err, "Couldn't load your orders"));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Poll for live status / ETA updates.
  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
  }, [load]);

  const cancel = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success("Order cancelled");
      load(true);
    } catch (err) {
      toast.error(errMsg(err, "Couldn't cancel"));
    }
  };

  if (loading) return <Loader label="Loading your orders…" />;
  if (orders.length === 0)
    return <Empty title="No orders yet" hint="Your placed orders will show up here with live tracking." />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Your orders</h1>
        <button onClick={() => load()} className="btn-ghost px-3 py-2 text-sm">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {orders.map((o) => (
        <OrderCard key={o.id} o={o} onCancel={cancel} />
      ))}
    </div>
  );
}

function OrderCard({ o, onCancel }) {
  const stepIndex = FLOW.indexOf(o.status);
  const terminal = o.status === "REJECTED" || o.status === "CANCELLED";

  return (
    <div className="card overflow-hidden animate-fade-up">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
        <div>
          <h3 className="font-bold">{o.restaurantName}</h3>
          <p className="text-xs text-ink-500">
            {new Date(o.placedAt).toLocaleString()} · {o.paymentMode}
          </p>
        </div>
        <StatusBadge status={o.status} />
      </div>

      {/* ETA banner */}
      {o.status === "CONFIRMED" || o.status === "PREPARING" || o.status === "OUT_FOR_DELIVERY" ? (
        <div className="flex items-center gap-2 bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700">
          <FiClock /> Arriving in about {o.etaMinutes} min
        </div>
      ) : null}

      {/* Progress timeline */}
      {!terminal && (
        <div className="px-5 pt-4">
          <div className="flex items-center">
            {FLOW.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    i <= stepIndex ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                {i < FLOW.length - 1 && (
                  <div className={`h-1 flex-1 ${i < stepIndex ? "bg-brand-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-medium text-ink-500">
            <span>Placed</span>
            <span>Confirmed</span>
            <span>Preparing</span>
            <span>On the way</span>
            <span>Delivered</span>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="px-5 py-4">
        <ul className="space-y-1 text-sm">
          {o.items.map((it, idx) => (
            <li key={idx} className="flex justify-between">
              <span className="text-ink-700">
                {it.quantity}× {it.name}{" "}
                <span className="text-ink-500">({it.plateType.toLowerCase()})</span>
              </span>
              <Money value={it.lineTotal} />
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
          <span className="font-bold">
            Total <Money value={o.total} />
          </span>
          {o.status === "PLACED" && (
            <button onClick={() => onCancel(o.id)} className="btn-ghost px-3 py-1.5 text-sm text-red-600">
              <FiX /> Cancel
            </button>
          )}
          {o.restaurantPhone && (o.status === "CONFIRMED" || o.status === "PREPARING") && (
            <a href={`tel:${o.restaurantPhone}`} className="btn-soft px-3 py-1.5 text-sm">
              Call restaurant
            </a>
          )}
        </div>
      </div>

      <PaymentQr order={o} />
      <OrderTrackingMap order={o} />
    </div>
  );
}
