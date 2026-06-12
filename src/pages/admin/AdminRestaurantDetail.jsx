import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiCheck, FiSlash, FiMapPin, FiPhone, FiUser, FiMail, FiClock, FiExternalLink,
} from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { Loader, Empty, StatusBadge, Money, FoodThumb } from "../../components/ui";
import { useToast } from "../../components/Toast";

export default function AdminRestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, m, o] = await Promise.all([
        api.get(`/admin/restaurants/${id}`),
        api.get(`/admin/restaurants/${id}/menu`),
        api.get(`/admin/restaurants/${id}/orders`, { params: { page: 0, size: 50 } }),
      ]);
      setDetail(d.data);
      setMenu(m.data);
      setOrders(o.data.content || []);
    } catch (err) {
      toast.error(errMsg(err, "Couldn't load restaurant"));
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (action) => {
    try {
      await api.put(`/admin/restaurants/${id}/${action}`);
      toast.success(action === "approve" ? "Approved" : "Suspended");
      load();
    } catch (err) {
      toast.error(errMsg(err, "Action failed"));
    }
  };

  if (loading) return <Loader label="Loading restaurant…" />;
  if (!detail) return <Empty title="Restaurant not found" />;

  const revenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/admin")} className="btn-ghost px-3 py-2">
        <FiArrowLeft /> All restaurants
      </button>

      {/* Header */}
      <div className="card overflow-hidden">
        <FoodThumb seed={detail.id} className="relative h-40">
          <div className="absolute inset-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/55 to-transparent p-6">
            <div className="text-white">
              <h1 className="text-3xl font-extrabold drop-shadow">{detail.name}</h1>
              <p className="mt-1 text-sm text-white/90">{detail.description || "No description"}</p>
            </div>
            <StatusBadge status={detail.status} />
          </div>
        </FoodThumb>

        <div className="flex flex-wrap items-center gap-2 p-4">
          {detail.status !== "APPROVED" && (
            <button onClick={() => act("approve")} className="btn-primary px-4 py-2 text-sm">
              <FiCheck /> Approve
            </button>
          )}
          {detail.status !== "SUSPENDED" && (
            <button onClick={() => act("suspend")} className="btn-ghost px-4 py-2 text-sm text-red-600">
              <FiSlash /> Suspend
            </button>
          )}
          <span className={`chip ${detail.open ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
            {detail.open ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Restaurant</h2>
          <Row icon={<FiMapPin />} label="Address" value={detail.address || "—"} />
          <Row icon={<FiPhone />} label="Phone" value={detail.phone || "—"} />
          <Row
            icon={<FiMapPin />}
            label="Location"
            value={
              detail.lat != null ? (
                <a
                  className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                  href={`https://www.google.com/maps?q=${detail.lat},${detail.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {detail.lat.toFixed(5)}, {detail.lng.toFixed(5)} <FiExternalLink />
                </a>
              ) : "—"
            }
          />
          <Row icon={<FiClock />} label="Created" value={new Date(detail.createdAt).toLocaleString()} />
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Owner</h2>
          <Row icon={<FiUser />} label="Name" value={detail.owner.name} />
          <Row icon={<FiPhone />} label="Phone" value={detail.owner.phone} />
          <Row icon={<FiMail />} label="Email" value={detail.owner.email || "—"} />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="Menu items" value={menu.length} />
            <Stat label="Orders" value={orders.length} />
            <Stat label="Revenue" value={<Money value={revenue} />} />
          </div>
        </div>
      </div>

      {/* Menu */}
      <section>
        <h2 className="mb-3 text-xl font-extrabold">Menu ({menu.length})</h2>
        {menu.length === 0 ? (
          <Empty title="No menu items" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {menu.map((m) => (
              <div key={m.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-bold">{m.name}</p>
                  {m.description && <p className="text-sm text-ink-500">{m.description}</p>}
                  <p className="mt-0.5 text-sm font-semibold">
                    Full <Money value={m.priceFull} />
                    {m.priceHalf != null && <span className="text-ink-500"> · Half <Money value={m.priceHalf} /></span>}
                  </p>
                </div>
                <span className={`chip ${m.availableToday ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  {m.availableToday ? "On menu" : "Hidden"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders */}
      <section>
        <h2 className="mb-3 text-xl font-extrabold">Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <Empty title="No orders yet" />
        ) : (
          <div className="card divide-y divide-black/5">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div>
                  <p className="font-semibold">{o.userName}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(o.placedAt).toLocaleString()} ·{" "}
                    {o.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold"><Money value={o.total} /></span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-b border-black/5 py-2.5 last:border-0">
      <span className="mt-0.5 text-brand-500">{icon}</span>
      <span className="w-24 shrink-0 text-sm text-ink-500">{label}</span>
      <span className="text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-orange-50 p-3">
      <p className="text-lg font-extrabold text-brand-700">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
}
