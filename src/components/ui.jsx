import { FiInbox, FiLoader } from "react-icons/fi";

export function Loader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-500">
      <FiLoader className="animate-spin text-3xl text-brand-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function Empty({ title = "Nothing here yet", hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <FiInbox className="text-4xl text-brand-300" />
      <p className="text-lg font-semibold text-ink-700">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-500">{hint}</p>}
    </div>
  );
}

const STATUS_STYLES = {
  PLACED: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-200 text-gray-600",
  PREPARING: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }) {
  const label = String(status || "").replaceAll("_", " ");
  return (
    <span className={`chip ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>{label}</span>
  );
}

export function Money({ value }) {
  return <span>₹{Number(value || 0).toFixed(2)}</span>;
}

/** A deterministic appetizing gradient header for cards lacking real photos. */
export function FoodThumb({ seed = "", className = "", children }) {
  const palettes = [
    "from-orange-400 to-rose-500",
    "from-amber-400 to-orange-600",
    "from-rose-400 to-red-500",
    "from-yellow-400 to-orange-500",
    "from-orange-500 to-pink-500",
  ];
  let h = 0;
  for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) % palettes.length;
  return (
    <div className={`bg-gradient-to-br ${palettes[h]} ${className}`}>{children}</div>
  );
}
