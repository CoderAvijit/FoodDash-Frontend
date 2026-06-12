import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiPhone, FiMail, FiLock } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
import { errMsg } from "../api/client";
import AuthShell from "./AuthShell";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, email: form.email || null };
      const data = await register(payload);
      toast.success(`Welcome, ${data.name.split(" ")[0]}!`);
      navigate(data.role === "OWNER" ? "/owner" : "/app/nearby", { replace: true });
    } catch (err) {
      toast.error(errMsg(err, "Registration failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join as a customer or a restaurant owner.">
      <form onSubmit={submit} className="space-y-4">
        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-orange-50 p-1">
          {[
            { v: "USER", label: "🍽️ I want to order" },
            { v: "OWNER", label: "🧑‍🍳 I run a restaurant" },
          ].map((r) => (
            <button
              type="button"
              key={r.v}
              onClick={() => setForm((f) => ({ ...f, role: r.v }))}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                form.role === r.v ? "bg-white text-brand-700 shadow-soft" : "text-ink-500"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <Field icon={<FiUser />} label="Full name" value={form.name} onChange={set("name")} placeholder="Avijit Rana" required />
        <Field icon={<FiPhone />} label="Phone" value={form.phone} onChange={set("phone")} placeholder="9990001111" required />
        <Field icon={<FiMail />} label="Email (optional)" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
        <Field icon={<FiLock />} label="Password" type="password" value={form.password} onChange={set("password")} placeholder="At least 6 characters" required />

        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ icon, label, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
          {icon}
        </span>
        <input className="input pl-10" {...props} />
      </div>
    </div>
  );
}
