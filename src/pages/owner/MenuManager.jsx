import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { Loader, Empty, Money } from "../../components/ui";
import { useToast } from "../../components/Toast";

const BLANK = { name: "", description: "", priceFull: "", priceHalf: "", availableToday: true };

export default function MenuManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // item id or "new"
  const [form, setForm] = useState(BLANK);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/restaurants/${id}/menu/all`);
      setItems(data);
    } catch (err) {
      toast.error(errMsg(err, "Couldn't load the menu"));
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm(BLANK);
    setEditing("new");
  };
  const openEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description || "",
      priceFull: item.priceFull,
      priceHalf: item.priceHalf ?? "",
      availableToday: item.availableToday,
    });
    setEditing(item.id);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || null,
      priceFull: Number(form.priceFull),
      priceHalf: form.priceHalf === "" ? null : Number(form.priceHalf),
      availableToday: form.availableToday,
    };
    try {
      if (editing === "new") {
        await api.post(`/restaurants/${id}/menu`, payload);
        toast.success("Item added");
      } else {
        await api.put(`/menu/${editing}`, payload);
        toast.success("Item updated");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, "Couldn't save the item"));
    }
  };

  const remove = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await api.delete(`/menu/${item.id}`);
      toast.success("Item deleted");
      load();
    } catch (err) {
      toast.error(errMsg(err, "Couldn't delete (it may be in past orders)"));
    }
  };

  const toggleAvail = async (item) => {
    try {
      await api.put(`/menu/${item.id}`, {
        name: item.name,
        description: item.description,
        priceFull: item.priceFull,
        priceHalf: item.priceHalf,
        availableToday: !item.availableToday,
      });
      load();
    } catch (err) {
      toast.error(errMsg(err, "Update failed"));
    }
  };

  if (loading) return <Loader label="Loading menu…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button onClick={() => navigate("/owner")} className="btn-ghost px-3 py-2">
        <FiArrowLeft /> Dashboard
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Menu</h1>
        <button onClick={openNew} className="btn-primary">
          <FiPlus /> Add item
        </button>
      </div>

      {items.length === 0 ? (
        <Empty title="No menu items yet" hint="Add your first dish to start taking orders." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4 animate-fade-up">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{item.name}</p>
                {item.description && (
                  <p className="line-clamp-1 text-sm text-ink-500">{item.description}</p>
                )}
                <p className="mt-0.5 text-sm font-semibold text-ink-700">
                  Full <Money value={item.priceFull} />
                  {item.priceHalf != null && (
                    <span className="text-ink-500"> · Half <Money value={item.priceHalf} /></span>
                  )}
                </p>
              </div>
              <button
                onClick={() => toggleAvail(item)}
                className={`chip ${item.availableToday ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                title="Toggle today's availability"
              >
                {item.availableToday ? "On menu" : "Hidden"}
              </button>
              <button onClick={() => openEdit(item)} className="btn-ghost px-2.5 py-2">
                <FiEdit2 />
              </button>
              <button onClick={() => remove(item)} className="btn-ghost px-2.5 py-2 text-red-600">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit / add modal */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="card w-full max-w-md p-6 animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">{editing === "new" ? "Add item" : "Edit item"}</h2>
              <button onClick={() => setEditing(null)} className="btn-ghost px-2 py-2">
                <FiX />
              </button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input className="input" value={form.name} onChange={set("name")} required />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" value={form.description} onChange={set("description")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Full plate ₹</label>
                  <input className="input" type="number" step="0.01" value={form.priceFull} onChange={set("priceFull")} required />
                </div>
                <div>
                  <label className="label">Half plate ₹</label>
                  <input className="input" type="number" step="0.01" value={form.priceHalf} onChange={set("priceHalf")} placeholder="optional" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                <input
                  type="checkbox"
                  checked={form.availableToday}
                  onChange={(e) => setForm((f) => ({ ...f, availableToday: e.target.checked }))}
                  className="h-4 w-4 accent-brand-600"
                />
                Available on today's menu
              </label>
              <button className="btn-primary w-full">{editing === "new" ? "Add item" : "Save changes"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
