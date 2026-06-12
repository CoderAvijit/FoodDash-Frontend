import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiPhone, FiLock } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
import { errMsg } from "../api/client";
import AuthShell from "./AuthShell";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await login(phone, password);
      toast.success(`Welcome back, ${data.name.split(" ")[0]}!`);
      const dest =
        data.role === "OWNER" ? "/owner" : data.role === "ADMIN" ? "/admin" : "/app/nearby";
      navigate(location.state?.from || dest, { replace: true });
    } catch (err) {
      toast.error(errMsg(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to order, manage, or approve.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Phone</label>
          <div className="relative">
            <FiPhone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              className="input pl-10"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9990001111"
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              className="input pl-10"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        New here?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
