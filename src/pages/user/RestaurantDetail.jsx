import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiArrowLeft, FiPhone, FiMapPin, FiShoppingCart } from "react-icons/fi";
import { api, errMsg } from "../../api/client";
import { Loader, Empty, FoodThumb, Money } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { useCart } from "../../cart/CartContext";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const cart = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [r, m] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/restaurants/${id}/menu`),
        ]);
        setRestaurant(r.data);
        setMenu(m.data);
      } catch (err) {
        toast.error(errMsg(err, "Couldn't load this restaurant"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const addItem = (item, plateType) => {
    cart.add(restaurant, item, plateType);
    toast.success(`Added ${item.name} (${plateType.toLowerCase()})`);
  };

  if (loading) return <Loader label="Loading menu…" />;
  if (!restaurant) return <Empty title="Restaurant not found" />;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="btn-ghost px-3 py-2">
        <FiArrowLeft /> Back
      </button>

      {/* Banner */}
      <div className="card overflow-hidden">
        <FoodThumb seed={restaurant.id} className="relative h-44 sm:h-56">
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 to-transparent p-6">
            <div className="text-white">
              <h1 className="text-3xl font-extrabold drop-shadow">{restaurant.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
                {restaurant.address && (
                  <span className="flex items-center gap-1">
                    <FiMapPin /> {restaurant.address}
                  </span>
                )}
                {restaurant.phone && (
                  <span className="flex items-center gap-1">
                    <FiPhone /> {restaurant.phone}
                  </span>
                )}
              </p>
            </div>
          </div>
        </FoodThumb>
        {restaurant.description && (
          <p className="px-6 py-4 text-ink-700">{restaurant.description}</p>
        )}
      </div>

      {/* Menu */}
      <div>
        <h2 className="mb-3 text-xl font-extrabold">Today's menu</h2>
        {menu.length === 0 ? (
          <Empty title="No items available today" hint="The owner hasn't published today's menu yet." />
        ) : (
          <div className="space-y-3">
            {menu.map((item) => (
              <MenuRow key={item.id} item={item} onAdd={addItem} />
            ))}
          </div>
        )}
      </div>

      {/* Floating cart bar */}
      {cart.count > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto max-w-md animate-pop-in">
          <button
            onClick={() => navigate("/app/cart")}
            className="btn-primary w-full justify-between px-5 py-3.5 text-base"
          >
            <span className="flex items-center gap-2">
              <FiShoppingCart /> {cart.count} item{cart.count > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-2">
              <Money value={cart.total} /> · View cart
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function MenuRow({ item, onAdd }) {
  return (
    <div className="card flex items-center gap-4 p-4 animate-fade-up">
      <FoodThumb seed={item.id} className="grid h-16 w-16 shrink-0 place-items-center rounded-xl text-2xl">
        🍛
      </FoodThumb>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold">{item.name}</h3>
        {item.description && <p className="line-clamp-1 text-sm text-ink-500">{item.description}</p>}
        <div className="mt-1 flex flex-wrap gap-2 text-sm font-semibold text-ink-700">
          <span>Full <Money value={item.priceFull} /></span>
          {item.priceHalf != null && (
            <span className="text-ink-500">· Half <Money value={item.priceHalf} /></span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <button onClick={() => onAdd(item, "FULL")} className="btn-primary px-3 py-1.5 text-sm">
          <FiPlus /> Full
        </button>
        {item.priceHalf != null && (
          <button onClick={() => onAdd(item, "HALF")} className="btn-soft px-3 py-1.5 text-sm">
            <FiPlus /> Half
          </button>
        )}
      </div>
    </div>
  );
}
