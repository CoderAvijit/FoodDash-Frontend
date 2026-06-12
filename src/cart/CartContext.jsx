import { createContext, useContext, useMemo, useState, useCallback } from "react";

const CartContext = createContext(null);

/**
 * A single-restaurant cart. Lines are keyed by menuItemId + plateType.
 * Adding an item from a different restaurant resets the cart.
 */
export function CartProvider({ children }) {
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [lines, setLines] = useState([]); // { menuItemId, name, plateType, price, qty }

  const reset = useCallback(() => {
    setRestaurantId(null);
    setRestaurantName("");
    setLines([]);
  }, []);

  const add = useCallback(
    (restaurant, item, plateType) => {
      const price = plateType === "HALF" ? item.priceHalf : item.priceFull;
      if (price == null) return;
      setRestaurantId((prevId) => {
        if (prevId && prevId !== restaurant.id) {
          // switching restaurants -> fresh cart
          setLines([]);
        }
        setRestaurantName(restaurant.name);
        return restaurant.id;
      });
      setLines((prev) => {
        const key = (l) => l.menuItemId === item.id && l.plateType === plateType;
        const existing = prev.find(key);
        if (existing) return prev.map((l) => (key(l) ? { ...l, qty: l.qty + 1 } : l));
        return [
          ...prev,
          { menuItemId: item.id, name: item.name, plateType, price: Number(price), qty: 1 },
        ];
      });
    },
    []
  );

  const changeQty = useCallback((menuItemId, plateType, delta) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.menuItemId === menuItemId && l.plateType === plateType
            ? { ...l, qty: l.qty + delta }
            : l
        )
        .filter((l) => l.qty > 0)
    );
  }, []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const total = useMemo(() => lines.reduce((s, l) => s + l.qty * l.price, 0), [lines]);

  return (
    <CartContext.Provider
      value={{ restaurantId, restaurantName, lines, add, changeQty, reset, count, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
