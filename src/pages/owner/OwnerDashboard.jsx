import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiMapPin, FiClipboard, FiList, FiPower, FiBell, FiCreditCard } from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { Loader, Empty, StatusBadge } from "../../components/ui";
import { useToast } from "../../components/Toast";
import QrManager from "../../components/QrManager";

const ACTIVE = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"];

export default function OwnerDashboard() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [counts, setCounts] = useState({}); // restaurantId -> { newCount, activeCount }
  const [loading, setLoading] = useState(true);
  const [qrFor, setQrFor] = useState(null); // restaurant whose QR modal is open

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/restaurants/mine");
      setList(data);

      // Fetch order counts per restaurant so the dashboard shows what needs attention.
      const entries = await Promise.all(
        data.map(async (r) => {
          try {
            const res = await api.get(`/restaurants/${r.id}/orders`, {
              params: { page: 0, size: 100 },
            });
            const orders = res.data.content || [];
            return [
              r.id,
              {
                newCount: orders.filter((o) => o.status === "PLACED").length,
                activeCount: orders.filter((o) => ACTIVE.includes(o.status)).length,
                total: res.data.totalElements ?? orders.length,
              },
            ];
          } catch {
            return [r.id, { newCount: 0, activeCount: 0, total: 0 }];
          }
        })
      );
      setCounts(Object.fromEntries(entries));
    } catch (err) {
      if (!silent) toast.error(errMsg(err, "Couldn't load your restaurants"));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Poll so new orders surface on the dashboard automatically.
  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 10000);
    return () => clearInterval(t);
  }, [load]);

  const toggleOpen = async (r) => {
    try {
      await api.put(`/restaurants/${r.id}`, { open: !r.open });
      toast.success(r.open ? "Marked closed" : "Marked open");
      load(true);
    } catch (err) {
      toast.error(errMsg(err, "Update failed"));
    }
  };

  if (loading) return <Loader label="Loading your restaurants…" />;

  const totalNew = Object.values(counts).reduce((n, c) => n + (c?.newCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Your restaurants</h1>
          <p className="text-sm text-ink-500">Manage menus, accept orders, set delivery times.</p>
        </div>
        <Link to="/owner/restaurants/new" className="btn-primary">
          <FiPlus /> Add restaurant
        </Link>
      </div>

      {/* New-orders banner */}
      {totalNew > 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-card animate-pop-in">
          <FiBell className="text-xl" />
          <p className="font-semibold">
            You have {totalNew} new order{totalNew > 1 ? "s" : ""} waiting to be confirmed.
          </p>
        </div>
      )}

      {list.length === 0 ? (
        <Empty
          title="No restaurants yet"
          hint="Create your first shop — it goes live once an admin approves it."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {list.map((r) => {
            const c = counts[r.id] || { newCount: 0, activeCount: 0, total: 0 };
            return (
              <div key={r.id} className="card p-5 animate-fade-up">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold">{r.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-500">
                      <FiMapPin /> {r.address || "No address"}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`chip ${r.open ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {r.open ? "Open" : "Closed"}
                  </span>
                  {c.newCount > 0 && (
                    <span className="chip bg-brand-100 text-brand-700">{c.newCount} new</span>
                  )}
                  {c.activeCount > 0 && (
                    <span className="chip bg-blue-100 text-blue-700">{c.activeCount} active</span>
                  )}
                  <span className="text-xs text-ink-500">{c.total} total orders</span>
                  {r.status === "PENDING" && (
                    <span className="text-xs text-ink-500">· Awaiting admin approval</span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to={`/owner/restaurants/${r.id}/menu`} className="btn-soft text-sm">
                    <FiList /> Menu
                  </Link>
                  <Link
                    to={`/owner/restaurants/${r.id}/orders`}
                    className={`btn text-sm ${c.newCount > 0 ? "btn-primary" : "btn-soft"}`}
                  >
                    <FiClipboard /> Orders{c.newCount > 0 ? ` (${c.newCount})` : ""}
                  </Link>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={() => toggleOpen(r)} className="btn-ghost text-sm">
                    <FiPower /> {r.open ? "Close" : "Open"}
                  </button>
                  <button onClick={() => setQrFor(r)} className="btn-ghost text-sm">
                    <FiCreditCard /> Payment QR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {qrFor && <QrManager restaurant={qrFor} onClose={() => setQrFor(null)} />}
    </div>
  );
}
