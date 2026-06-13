import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiMapPin } from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { useCart } from "../../cart/CartContext";
import { useToast } from "../../components/Toast";
import { Empty, Money } from "../../components/ui";
import { useLocation } from "../../location/LocationContext";
import LocationSearch from "../../components/LocationSearch";

export default function Cart() {
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const { location } = useLocation();
  const [payment, setPayment] = useState("QR");
  const [busy, setBusy] = useState(false);

  const placeOrder = async () => {
    if (cart.lines.length === 0) return;
    if (!location) return toast.error("Please set your delivery location");
    setBusy(true);
    try {
      const body = {
        restaurantId: cart.restaurantId,
        userLat: location.lat,
        userLng: location.lng,
        paymentMode: payment,
        items: cart.lines.map((l) => ({
          menuItemId: l.menuItemId,
          plateType: l.plateType,
          quantity: l.qty,
        })),
      };
      await api.post("/orders", body);
      toast.success("Order placed! Waiting for the restaurant to confirm.");
      cart.reset();
      navigate("/app/orders");
    } catch (err) {
      toast.error(errMsg(err, "Couldn't place the order"));
    } finally {
      setBusy(false);
    }
  };

  if (cart.lines.length === 0) {
    return (
      <Empty
        title="Your cart is empty"
        hint="Browse nearby restaurants and add some delicious items."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-extrabold">Your order</h1>
      <p className="-mt-3 text-sm text-ink-500">
        From <span className="font-semibold text-ink-700">{cart.restaurantName}</span>
      </p>

      <div className="card divide-y divide-black/5">
        {cart.lines.map((l) => (
          <div key={`${l.menuItemId}-${l.plateType}`} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{l.name}</p>
              <p className="text-sm text-ink-500">
                {l.plateType === "HALF" ? "Half plate" : "Full plate"} · <Money value={l.price} />
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => cart.changeQty(l.menuItemId, l.plateType, -1)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-brand-700 hover:bg-brand-100"
              >
                {l.qty === 1 ? <FiTrash2 /> : <FiMinus />}
              </button>
              <span className="w-6 text-center font-bold">{l.qty}</span>
              <button
                onClick={() => cart.changeQty(l.menuItemId, l.plateType, 1)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-brand-700 hover:bg-brand-100"
              >
                <FiPlus />
              </button>
            </div>
            <div className="w-20 text-right font-bold">
              <Money value={l.qty * l.price} />
            </div>
          </div>
        ))}
      </div>

      {/* Delivery location */}
      <div className="card p-4">
        <p className="label flex items-center gap-1.5">
          <FiMapPin className="text-brand-500" /> Deliver to
        </p>
        <LocationSearch />
      </div>

      {/* Payment */}
      <div className="card p-4">
        <p className="label">Payment (paid directly to the owner)</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "QR", label: "📱 QR / UPI" },
            { v: "CASH", label: "💵 Cash" },
          ].map((p) => (
            <button
              key={p.v}
              onClick={() => setPayment(p.v)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold ring-1 transition ${
                payment === p.v
                  ? "bg-brand-50 text-brand-700 ring-brand-300"
                  : "bg-white text-ink-700 ring-black/10 hover:bg-orange-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-500">
          GalliEats doesn't process payments — you'll pay {payment === "QR" ? "by scanning the owner's QR" : "in cash"} on delivery.
        </p>
      </div>

      {/* Total + place */}
      <div className="card flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-ink-500">Total</p>
          <p className="text-2xl font-extrabold">
            <Money value={cart.total} />
          </p>
        </div>
        <button onClick={placeOrder} disabled={busy} className="btn-primary px-6 py-3 text-base">
          <FiShoppingCart /> {busy ? "Placing…" : "Place order"}
        </button>
      </div>
    </div>
  );
}
