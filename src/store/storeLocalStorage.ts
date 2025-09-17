const localStorageName = "cartStore";

export const loadState = () => {
  const tempState = {
    cart: {
      items: [],
      isVisible: false,
    },
  };
  
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return tempState;
  }
  
  try {
    const serializedState = localStorage.getItem(localStorageName);
    if (!serializedState) return tempState;
    tempState.cart.items = JSON.parse(serializedState).cart.items;
    return tempState;
  } catch {
    return tempState;
  }
};

//eslint-disable-next-line
export const saveState = (state: any) => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(localStorageName, serializedState);
  } catch {
    console.error("Failed to save state");
  }
};
