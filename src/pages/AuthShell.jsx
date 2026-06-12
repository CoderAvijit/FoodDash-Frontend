import { FiShoppingBag } from "react-icons/fi";

/** Two-column auth layout: marketing panel + form card. */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 py-6 lg:grid-cols-2 lg:items-center">
      <div className="hidden rounded-3xl bg-gradient-to-br from-brand-500 to-rose-600 p-10 text-white shadow-card lg:block">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur">
          <FiShoppingBag />
        </span>
        <h2 className="mt-6 text-3xl font-extrabold leading-snug">
          Good food is just a few taps away.
        </h2>
        <p className="mt-3 text-white/90">
          Join FoodDash to discover nearby kitchens, order today's specials, and track your meal in
          real time.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-white/90">
          <li>✓ Location-based discovery</li>
          <li>✓ Full / half plate ordering</li>
          <li>✓ Live delivery ETA</li>
        </ul>
      </div>

      <div className="card mx-auto w-full max-w-md p-8 animate-pop-in">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
