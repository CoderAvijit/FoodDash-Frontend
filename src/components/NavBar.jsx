import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiShoppingBag, FiLogOut, FiUser, FiMapPin } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";

export default function NavBar() {
  const { isAuthed, role, auth, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition ${
      isActive ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-orange-50"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-card">
            <FiShoppingBag />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Galli<span className="text-brand-600">Eats</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {role === "USER" && (
            <>
              <NavLink to="/app/nearby" className={linkClass}>
                <span className="hidden sm:inline">Nearby</span>
                <FiMapPin className="sm:hidden" />
              </NavLink>
              <NavLink to="/app/orders" className={linkClass}>
                Orders
              </NavLink>
              <NavLink to="/app/cart" className={linkClass}>
                <span className="relative inline-flex items-center">
                  Cart
                  {count > 0 && (
                    <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </span>
              </NavLink>
            </>
          )}
          {role === "OWNER" && (
            <NavLink to="/owner" className={linkClass}>
              Dashboard
            </NavLink>
          )}
          {role === "ADMIN" && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}

          {isAuthed ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-semibold text-ink-700 sm:flex">
                <FiUser className="text-brand-500" />
                {auth.name?.split(" ")[0]}
              </span>
              <button onClick={handleLogout} className="btn-ghost px-3 py-2" title="Log out">
                <FiLogOut />
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link to="/login" className="btn-ghost px-4 py-2">
                Log in
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
