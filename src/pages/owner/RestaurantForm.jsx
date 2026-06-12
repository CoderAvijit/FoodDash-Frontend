import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCrosshair } from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { useToast } from "../../components/Toast";

export default function RestaurantForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    lat: "",
    lng: "",
  });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not available");
    navigator.geolocation.getCurrentPosition(
      (p) =>
        setForm((f) => ({
          ...f,
          lat: p.coords.latitude.toFixed(6),
          lng: p.coords.longitude.toFixed(6),
        })),
      () => toast.error("Couldn't get your location")
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) return toast.error("Please set the restaurant location");
    setBusy(true);
    try {
      await api.post("/restaurants", {
        name: form.name,
        description: form.description || null,
        address: form.address || null,
        phone: form.phone || null,
        lat: Number(form.lat),
        lng: Number(form.lng),
      });
      toast.success("Restaurant created — pending admin approval");
      navigate("/owner");
    } catch (err) {
      toast.error(errMsg(err, "Couldn't create restaurant"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button onClick={() => navigate(-1)} className="btn-ghost px-3 py-2">
        <FiArrowLeft /> Back
      </button>
      <div className="card p-6">
        <h1 className="text-2xl font-extrabold">Add a restaurant</h1>
        <p className="mt-1 text-sm text-ink-500">
          It will be reviewed by an admin before customers can see it.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Restaurant name</label>
            <input className="input" value={form.name} onChange={set("name")} placeholder="Tasty Corner" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={set("description")} placeholder="Home-style thalis & more" />
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={set("address")} placeholder="MG Road, Bengaluru" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={set("phone")} placeholder="080-1234-5678" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label">Location</label>
              <button type="button" onClick={useMyLocation} className="btn-soft px-3 py-1.5 text-xs">
                <FiCrosshair /> Use my location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" value={form.lat} onChange={set("lat")} placeholder="Latitude" required />
              <input className="input" value={form.lng} onChange={set("lng")} placeholder="Longitude" required />
            </div>
            <p className="mt-1 text-xs text-ink-500">
              Used to show your shop to nearby customers and compute delivery ETA.
            </p>
          </div>

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Creating…" : "Create restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
}
