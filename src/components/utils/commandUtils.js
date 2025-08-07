import { add, toggleCart } from "@/store/shoppingCart";
import { TListItem } from "@/domains/store/productList/types";

export const navigateToSearch = async (query, router, ws) => {
  router.push(`/search?query=${query}`);
  const data = await fetchSearchResults(query);
  if (!data) {
    console.error("Failed to fetch search results");
    return;
  }
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "search_command_results",
        command: "search_results",
        results: data,
      })
    );
  }
  return;
};
export const navigateToProduct = (product_id, router) => {
  router.push(`/product/${product_id}`);
  return;
};
export const addToCart = (product_id, quantity, shoppingCartStore) => {
  shoppingCartStore.dispatch(add({ ...{ productId: product_id, quantity: quantity } }));
  return;
};
export const buyNow = (product_id, quantity, shoppingCartStore, router) => {
  console.log("Buying now");
  shoppingCartStore.dispatch(add({ ...{ productId: product_id, quantity: quantity } }));
  setTimeout(() => {
    shoppingCartStore.dispatch(toggleCart(false));
  }, 1000);
  setTimeout(() => {
    router.push("/checkout");
  }, 1500);
};

export async function fetchSearchResults(query) {
  if (!query.trim()) return [];

  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=100`);
  const data = await response.json();

  if (!response.ok || !data.products) return [];

  return data.products;
}
