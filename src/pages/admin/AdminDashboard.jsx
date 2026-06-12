import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiSlash, FiMapPin, FiRefreshCw, FiChevronRight } from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { Loader, Empty, StatusBadge } from "../../components/ui";
import { useToast } from "../../components/Toast";

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "SUSPENDED", label: "Suspended" },
  { key: "", label: "All" },
];

export default function AdminDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("PENDING");
  const [page, setPage] = useState({ content: [], totalElements: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 50 };
      if (tab) params.status = tab;
      const { data } = await api.get("/admin/restaurants", { params });
      setPage(data);
    } catch (err) {
      toast.error(errMsg(err, "Couldn't load restaurants"));
    } finally {
      setLoading(false);
    }
  }, [tab, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (r, action) => {
    try {
      await api.put(`/admin/restaurants/${r.id}/${action}`);
      toast.success(action === "approve" ? "Approved" : "Suspended");
      load();
    } catch (err) {
      toast.error(errMsg(err, "Action failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Admin · Restaurants</h1>
          <p className="text-sm text-ink-500">Review and moderate the marketplace.</p>
        </div>
        <button onClick={load} className="btn-ghost px-3 py-2 text-sm">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "bg-brand-600 text-white shadow-card" : "bg-white text-ink-700 ring-1 ring-black/5 hover:bg-orange-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : page.content.length === 0 ? (
        <Empty title="Nothing here" hint="No restaurants in this category." />
      ) : (
        <div className="overflow-hidden card">
          <table className="w-full text-left text-sm">
            <thead className="bg-orange-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">Restaurant</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {page.content.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/admin/restaurants/${r.id}`)}
                  className="cursor-pointer hover:bg-orange-50/40"
                >
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-1 font-bold text-ink-900">
                      {r.name} <FiChevronRight className="text-ink-500" />
                    </p>
                    <p className="text-xs text-ink-500">{r.description || "—"}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-700">
                    <span className="flex items-center gap-1">
                      <FiMapPin className="text-brand-500" /> {r.address || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      {r.status !== "APPROVED" && (
                        <button onClick={() => act(r, "approve")} className="btn-primary px-3 py-1.5 text-xs">
                          <FiCheck /> Approve
                        </button>
                      )}
                      {r.status !== "SUSPENDED" && (
                        <button onClick={() => act(r, "suspend")} className="btn-ghost px-3 py-1.5 text-xs text-red-600">
                          <FiSlash /> Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
