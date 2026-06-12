import { Link } from "react-router-dom";
import { FiMapPin, FiClock, FiShoppingBag, FiArrowRight } from "react-icons/fi";

export default function Landing() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-rose-600 px-6 py-16 text-white shadow-card sm:px-12 sm:py-20">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="relative max-w-2xl animate-fade-up">
          <span className="chip bg-white/20 text-white backdrop-blur">🍴 Fresh, local, fast</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">
            Hungry? Find great food <span className="text-amber-200">near you.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Discover nearby restaurants, browse today's menu, and order in a tap. Pay the owner
            directly by QR or cash — and watch your food head your way with a live ETA.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn bg-white text-brand-700 hover:bg-orange-50">
              Get started <FiArrowRight />
            </Link>
            <Link to="/login" className="btn bg-white/15 text-white backdrop-blur hover:bg-white/25">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-5 sm:grid-cols-3">
        {[
          { icon: <FiMapPin />, title: "Find nearby", text: "We use your location to surface open restaurants around you, sorted by distance." },
          { icon: <FiShoppingBag />, title: "Order in a tap", text: "Pick full or half plates, add to cart, and place your order. The owner confirms it." },
          { icon: <FiClock />, title: "Live ETA", text: "Once confirmed, see how long until your food arrives — powered by real road routing." },
        ].map((f) => (
          <div key={f.title} className="card p-6 animate-fade-up">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-2xl text-brand-600">
              {f.icon}
            </span>
            <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
            <p className="mt-1 text-sm text-ink-500">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Roles */}
      <section className="card overflow-hidden">
        <div className="grid gap-6 p-8 sm:grid-cols-3">
          <div>
            <h4 className="font-bold text-brand-600">For Customers</h4>
            <p className="mt-1 text-sm text-ink-500">Browse, order, track. Pay the way you like.</p>
          </div>
          <div>
            <h4 className="font-bold text-brand-600">For Restaurant Owners</h4>
            <p className="mt-1 text-sm text-ink-500">List your shop, manage today's menu, accept orders, set prep time.</p>
          </div>
          <div>
            <h4 className="font-bold text-brand-600">For Admins</h4>
            <p className="mt-1 text-sm text-ink-500">Approve new restaurants and keep the marketplace healthy.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
