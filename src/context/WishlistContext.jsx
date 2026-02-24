import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

const WishlistContext = createContext({
  wishlistIds: [],
  wishlistCount: 0,
  toggleWishlist: () => { },
  isInWishlist: () => false,
  fetchWishlistProducts: async () => [],
});

const STORAGE_KEY = "wishlistIds";

function getLocalIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return [];
}

function setLocalIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export const WishlistProvider = ({ children }) => {
  const auth = useAuth() || {};
  const user = auth.user || null;
  const token = auth.token || null;
  const [wishlistIds, setWishlistIds] = useState(() => getLocalIds());
  const hasSynced = useRef(false);

  // ============================
  // SINCRONIZAR AL LOGUEARSE
  // ============================
  useEffect(() => {
    if (!user || !token || user.isAdmin) return;
    if (hasSynced.current) return;

    const localIds = getLocalIds();

    // Si hay IDs locales, hacer merge con DB
    if (localIds.length > 0) {
      fetch(apiPath("/wishlist/sync"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productIds: localIds }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.wishlist) {
            setWishlistIds(data.wishlist);
            localStorage.removeItem(STORAGE_KEY);
          }
        })
        .catch(console.error);
    } else {
      // Sin IDs locales, cargar desde DB
      fetch(apiPath("/wishlist"), {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.wishlist) setWishlistIds(data.wishlist);
        })
        .catch(console.error);
    }
    hasSynced.current = true;
  }, [user, token]);

  // ============================
  // RESET AL DESLOGUEARSE
  // ============================
  useEffect(() => {
    if (!user) {
      hasSynced.current = false;
      // Cargar IDs locales (puede haber desde antes)
      setWishlistIds(getLocalIds());
    }
  }, [user]);

  // ============================
  // GUARDAR EN LOCALSTORAGE SOLO SI NO LOGUEADO
  // ============================
  useEffect(() => {
    if (!user || !token) {
      setLocalIds(wishlistIds);
    }
  }, [wishlistIds, user, token]);

  // ============================
  // TOGGLE WISHLIST
  // ============================
  const toggleWishlist = useCallback(
    async (productId) => {
      if (!productId) return;

      const isLoggedIn = user && token && !user.isAdmin;

      if (isLoggedIn) {
        // Optimistic update
        const wasIn = wishlistIds.includes(productId);
        const newIds = wasIn
          ? wishlistIds.filter((id) => id !== productId)
          : [...wishlistIds, productId];
        setWishlistIds(newIds);

        try {
          const res = await fetch(apiPath("/wishlist/toggle"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
          });
          const data = await res.json();
          if (data.wishlist) setWishlistIds(data.wishlist);
        } catch (err) {
          // Revertir en caso de error
          setWishlistIds(wishlistIds);
          console.error("Error toggling wishlist:", err);
        }
      } else {
        // Guest: solo localStorage
        setWishlistIds((prev) => {
          if (prev.includes(productId)) {
            return prev.filter((id) => id !== productId);
          } else {
            return [...prev, productId];
          }
        });
      }
    },
    [user, token, wishlistIds]
  );

  // ============================
  // VERIFICAR SI ESTA EN WISHLIST
  // ============================
  const isInWishlist = useCallback(
    (id) => wishlistIds.includes(id),
    [wishlistIds]
  );

  // ============================
  // OBTENER PRODUCTOS COMPLETOS (precios frescos del server)
  // ============================
  const fetchWishlistProducts = useCallback(async () => {
    if (wishlistIds.length === 0) return [];
    try {
      const res = await fetch(apiPath("/wishlist/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: wishlistIds }),
      });
      const data = await res.json();
      return data.products || [];
    } catch (err) {
      console.error("Error fetching wishlist products:", err);
      return [];
    }
  }, [wishlistIds]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        toggleWishlist,
        isInWishlist,
        fetchWishlistProducts,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
