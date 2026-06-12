import { useEffect, useState } from "react";
import { FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import { api, errMsg } from "../api/client";
import { useToast } from "./Toast";

const MAX_BYTES = 600 * 1024; // ~600 KB is plenty for a QR

/** Owner modal to upload / preview / remove a restaurant's payment QR. */
export default function QrManager({ restaurant, onClose }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/restaurants/${restaurant.id}/qr`)
      .then((r) => setImage(r.data.image))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurant.id]);

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > MAX_BYTES) return toast.error("Image too large (max 600 KB)");
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setBusy(true);
    try {
      await api.put(`/restaurants/${restaurant.id}/qr`, { image });
      toast.success("Payment QR saved");
      setDirty(false);
      onClose();
    } catch (err) {
      toast.error(errMsg(err, "Couldn't save QR"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/restaurants/${restaurant.id}/qr`);
      toast.success("Payment QR removed");
      setImage(null);
      setDirty(false);
    } catch (err) {
      toast.error(errMsg(err, "Couldn't remove QR"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm p-6 animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Payment QR · {restaurant.name}</h2>
          <button onClick={onClose} className="btn-ghost px-2 py-2">
            <FiX />
          </button>
        </div>

        <p className="mb-4 text-sm text-ink-500">
          Upload your UPI/payment QR. Customers see it <b>only after you confirm their order</b>.
        </p>

        <div className="grid place-items-center rounded-2xl border-2 border-dashed border-black/10 bg-orange-50/50 p-4">
          {loading ? (
            <span className="py-10 text-sm text-ink-500">Loading…</span>
          ) : image ? (
            <img src={image} alt="Payment QR" className="h-48 w-48 rounded-lg object-contain" />
          ) : (
            <span className="py-10 text-sm text-ink-500">No QR uploaded yet</span>
          )}
        </div>

        <label className="btn-soft mt-4 w-full cursor-pointer">
          <FiUpload /> {image ? "Replace image" : "Choose QR image"}
          <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
        </label>

        <div className="mt-3 flex gap-2">
          {image && (
            <button onClick={remove} disabled={busy} className="btn-ghost flex-1 text-red-600">
              <FiTrash2 /> Remove
            </button>
          )}
          <button onClick={save} disabled={busy || !dirty || !image} className="btn-primary flex-1">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
