export const navigateToSearch = (query, router) => {
  router.push(`/search?query=${query}`);
  return;
};
export const navigateToProduct = (product_id, router) => {
  router.push(`/product/${product_id}`);
  return;
};
export const addToCart = (product_id, quantity, shoppingCartStore, add) => {
  shoppingCartStore.dispatch(add({ ...{ productId: product_id, quantity: quantity } }));
  return;
};
