"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { clear, RootState } from "@/store/shoppingCart";
import Button from "@/shared/components/UI/button";
import { cn } from "@/shared/utils/styling";
import { getCartProducts } from "@/actions/product/product";
import { TCartListItemDB } from "@/shared/types/product";
import { TCartItemData } from "@/shared/types/shoppingCart";

const OrderSummaryPage = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const [cartItems, setCartItems] = useState<TCartItemData[]>([]);

  // Fetch cart items from DB and clear cart on mount
  useEffect(() => {
    const convertDBtoCartItems = (rawData: TCartListItemDB[]) => {
      const cartListItem: TCartItemData[] = [];
      rawData.forEach((item) => {
        cartListItem.push({
          productId: item.id,
          imgUrl: item.images[0],
          price: item.price,
          quantity: cart.items.find((f) => f.productId === item.id)?.quantity || 0,
          productName: item.name,
          dealPrice: item.salePrice || undefined,
        });
      });
      return cartListItem;
    };

    const getProductsFromDB = async () => {
      const productsIDs = cart.items.map((s) => s.productId);
      if (!productsIDs?.length) {
        setCartItems([]);
        dispatch(clear());
        return;
      }
      const response = await getCartProducts(productsIDs);
      if (response.res) {
        const finalResult = convertDBtoCartItems(response.res);
        setCartItems(finalResult);
      }
      dispatch(clear());
    };

    getProductsFromDB();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="mt-[90px] bg-white min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 flex flex-col items-center">
        <h1 className="text-2xl font-light text-green-700 mb-2">Order Placed Successfully!</h1>
        <div className="text-gray-700 mb-4 text-center">
          Thank you for shopping with <span className="font-semibold">Solve Ease</span>.<br />
          Your order has been placed and will be processed soon.
        </div>
        <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium mb-2 text-gray-900">Order Details</h2>
          {cartItems.length === 0 ? (
            <div className="text-gray-500 text-center">Your cart is now empty.</div>
          ) : (
            <ul>
              {cartItems.map((item) => (
                <li key={item.productId} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <img src={item.imgUrl} alt={item.productName} width={60} height={60} />
                    <div>
                      <div className="font-medium text-gray-800">{item.productName}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {item.price} € x {item.quantity} = {item.price * item.quantity} €
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          className="w-full text-base font-semibold text-white bg-green-600 hover:bg-green-700 mb-2 flex justify-center rounded-md p-1"
          href="/"
        >
          Back to Home
        </Link>
        <Link href="/shop" className="text-sm text-gray-500 hover:text-gray-900 mt-2">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
