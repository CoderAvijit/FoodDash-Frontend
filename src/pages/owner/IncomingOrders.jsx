import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiRefreshCw, FiClock } from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { Loader, Empty, StatusBadge, Money } from "../../components/ui";
import { useToast } from "../../components/Toast";
import OrderTrackingMap from "../../components/OrderTrackingMap";

const NEXT = {
  CONFIRMED: { to: "PREPARING", label: "Start preparing" },
  PREPARING: { to: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  OUT_FOR_DELIVERY: { to: "DELIVERED", label: "Mark delivered" },
};

export default function IncomingOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prep, setPrep] = useState({}); // orderId -> minutes

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/restaurants/${id}/orders`, { params: { page: 0, size: 50 } });
      setOrders(data.content || []);
    } catch (err) {
      if (!silent) toast.error(errMsg(err, "Couldn't load orders"));
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
  }, [load]);

  const confirm = async (o) => {
    const minutes = Number(prep[o.id] || 20);
    try {
      await api.put(`/orders/${o.id}/confirm`, { prepMinutes: minutes });
      toast.success(`Confirmed · prep ${minutes} min`);
      load(true);
    } catch (err) {
      toast.error(errMsg(err, "Couldn't confirm"));
    }
  };
  const reject = async (o) => {
    try {
      await api.put(`/orders/${o.id}/reject`);
      toast.info("Order rejected");
      load(true);
    } catch (err) {
      toast.error(errMsg(err, "Couldn't reject"));
    }
  };
  const advance = async (o) => {
    const step = NEXT[o.status];
    if (!step) return;
    try {
      await api.put(`/orders/${o.id}/status`, { status: step.to });
      load(true);
    } catch (err) {
      toast.error(errMsg(err, "Couldn't update status"));
    }
  };

  if (loading) return <Loader label="Loading orders…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button onClick={() => navigate("/owner")} className="btn-ghost px-3 py-2">
        <FiArrowLeft /> Dashboard
      </button>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Incoming orders</h1>
        <button onClick={() => load()} className="btn-ghost px-3 py-2 text-sm">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <Empty title="No orders yet" hint="New orders from customers will appear here in real time." />
      ) : (
        orders.map((o) => (
          <div key={o.id} className="card overflow-hidden animate-fade-up">
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div>
                <h3 className="font-bold">{o.userName}</h3>
                <p className="text-xs text-ink-500">
                  {new Date(o.placedAt).toLocaleString()} · {o.paymentMode}
                </p>
              </div>
              <StatusBadge status={o.status} />
            </div>

            <div className="px-5 py-4">
              <ul className="space-y-1 text-sm">
                {o.items.map((it, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span className="text-ink-700">
                      {it.quantity}× {it.name} <span className="text-ink-500">({it.plateType.toLowerCase()})</span>
                    </span>
                    <Money value={it.lineTotal} />
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 font-bold">
                <span>Total</span>
                <Money value={o.total} />
              </div>
              {o.etaMinutes != null && o.status !== "DELIVERED" && (
                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  <FiClock /> ETA {o.etaMinutes} min (prep {o.prepMinutes} + travel)
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 border-t border-black/5 bg-orange-50/50 px-5 py-3">
              {o.status === "PLACED" && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-ink-700">Prep</span>
                    <input
                      type="number"
                      min="1"
                      value={prep[o.id] ?? 20}
                      onChange={(e) => setPrep((p) => ({ ...p, [o.id]: e.target.value }))}
                      className="w-16 rounded-lg border border-black/10 px-2 py-1.5 text-sm"
                    />
                    <span className="text-sm text-ink-500">min</span>
                  </div>
                  <button onClick={() => confirm(o)} className="btn-primary px-4 py-2 text-sm">
                    <FiCheck /> Confirm
                  </button>
                  <button onClick={() => reject(o)} className="btn-ghost px-4 py-2 text-sm text-red-600">
                    <FiX /> Reject
                  </button>
                </>
              )}
              {NEXT[o.status] && (
                <button onClick={() => advance(o)} className="btn-primary px-4 py-2 text-sm">
                  {NEXT[o.status].label}
                </button>
              )}
              {(o.status === "DELIVERED" || o.status === "REJECTED" || o.status === "CANCELLED") && (
                <span className="text-sm text-ink-500">No further action.</span>
              )}
            </div>

            <OrderTrackingMap order={o} />
          </div>
        ))
      )}
    </div>
  );
}
