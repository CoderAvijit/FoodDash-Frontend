import { useState } from "react";
import { FiCreditCard, FiChevronUp } from "react-icons/fi";
import { api } from "../api/client";

const SHOWABLE = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

/**
 * Customer-facing: shows the owner's payment QR for a confirmed QR-payment order.
 * Only rendered for the order's own customer (this is their order view).
 */
export default function PaymentQr({ order }) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState(null);
  const [state, setState] = useState("idle"); // idle | loading | ready | none | error

  if (order.paymentMode !== "QR" || !SHOWABLE.includes(order.status)) return null;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && state === "idle") {
      setState("loading");
      try {
        const { data } = await api.get(`/orders/${order.id}/payment-qr`);
        setQr(data);
        setState("ready");
      } catch (e) {
        setState(e?.response?.status === 404 ? "none" : "error");
      }
    }
  };

  return (
    <div className="border-t border-black/5">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-orange-50"
      >
        <span className="flex items-center gap-2">
          <FiCreditCard /> Pay via QR
        </span>
        {open && <FiChevronUp />}
      </button>
      {open && (
        <div className="grid place-items-center px-5 pb-5">
          {state === "loading" && <p className="py-8 text-sm text-ink-500">Loading QR…</p>}
          {state === "none" && (
            <p className="py-8 text-center text-sm text-ink-500">
              The restaurant hasn't added a payment QR yet — please pay by the method you arranged,
              or ask them on the call.
            </p>
          )}
          {state === "error" && <p className="py-8 text-sm text-red-500">Couldn't load the QR.</p>}
          {state === "ready" && qr && (
            <div className="flex flex-col items-center gap-2 py-2">
              <img
                src={qr.qrImage}
                alt="Payment QR"
                className="h-56 w-56 rounded-xl bg-white object-contain p-2 ring-1 ring-black/5"
              />
              <p className="text-sm font-semibold text-ink-700">Scan to pay {qr.restaurantName}</p>
              <p className="text-lg font-extrabold text-brand-700">₹{Number(order.total).toFixed(2)}</p>
              <p className="text-xs text-ink-500">Paid directly to the owner — GalliEats doesn't handle the money.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
