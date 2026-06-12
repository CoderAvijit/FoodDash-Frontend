import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Nearby from "./pages/user/Nearby";
import RestaurantDetail from "./pages/user/RestaurantDetail";
import Cart from "./pages/user/Cart";
import MyOrders from "./pages/user/MyOrders";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import RestaurantForm from "./pages/owner/RestaurantForm";
import MenuManager from "./pages/owner/MenuManager";
import IncomingOrders from "./pages/owner/IncomingOrders";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRestaurantDetail from "./pages/admin/AdminRestaurantDetail";

/** Sends a logged-in user to their role's home; otherwise shows the landing page. */
function Home() {
  const { isAuthed, role } = useAuth();
  if (isAuthed && role === "USER") return <Navigate to="/app/nearby" replace />;
  if (isAuthed && role === "OWNER") return <Navigate to="/owner" replace />;
  if (isAuthed && role === "ADMIN") return <Navigate to="/admin" replace />;
  return <Landing />;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User */}
          <Route
            path="/app/nearby"
            element={
              <ProtectedRoute roles={["USER"]}>
                <Nearby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/restaurants/:id"
            element={
              <ProtectedRoute roles={["USER"]}>
                <RestaurantDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/cart"
            element={
              <ProtectedRoute roles={["USER"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/orders"
            element={
              <ProtectedRoute roles={["USER"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* Owner */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute roles={["OWNER"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/restaurants/new"
            element={
              <ProtectedRoute roles={["OWNER"]}>
                <RestaurantForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/restaurants/:id/menu"
            element={
              <ProtectedRoute roles={["OWNER"]}>
                <MenuManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/restaurants/:id/orders"
            element={
              <ProtectedRoute roles={["OWNER"]}>
                <IncomingOrders />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/restaurants/:id"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminRestaurantDetail />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
