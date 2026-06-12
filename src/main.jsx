import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { CartProvider } from "./cart/CartContext.jsx";
import { LocationProvider } from "./location/LocationContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
