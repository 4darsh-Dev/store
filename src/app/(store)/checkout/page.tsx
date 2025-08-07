"use client";

import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RootState, toggleCart } from "@/store/shoppingCart";
import Button from "@/shared/components/UI/button";
import { cn } from "@/shared/utils/styling";
import { getCartProducts } from "@/actions/product/product";
import { TCartListItemDB } from "@/shared/types/product";
import { TCartItemData } from "@/shared/types/shoppingCart";
import CartItem from "@/domains/store/shoppingCard/components/shoppingCart/_components/cartItem";
import { ShoppingIconEmpty } from "@/shared/components/icons/svgIcons";
import { useRouter } from "next/navigation";

const paymentMethods = [
  { id: "cod", label: "Cash on Delivery" },
  { id: "card", label: "Credit/Debit Card" },
  { id: "upi", label: "UPI" },
];

const Checkout = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const [selectedPayment, setSelectedPayment] = useState<string>("cod");
  const [cartItems, setCartItems] = useState<TCartItemData[]>([]);
  const dispatch = useDispatch();
  const router = useRouter();
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
        return;
      }
      const response = await getCartProducts(productsIDs);
      if (response.res) {
        const finalResult = convertDBtoCartItems(response.res);
        setCartItems(finalResult);
      }
    };

    if (cart) {
      getProductsFromDB();
    }
  }, [cart]);
  const handleCartVisibility = (visibility: boolean) => {
    dispatch(toggleCart(visibility));
    if (visibility) {
      document.documentElement.classList.add("noScroll");
    } else {
      document.documentElement.classList.remove("noScroll");
    }
  };
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="mt-[136px] bg-white min-h-screen">
      <div className="w-full h-auto md:h-[130px] py-5 px-2.5 md:p-0 flex flex-col justify-center items-center bg-gray-200/80">
        <h1 className="text-2xl font-light text-gray-900 mb-2">Order Summary</h1>
        <div className="flex gap-3 items-center text-sm">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-900 after:content-[''] after:w-1 after:h-2 after:ml-2 after:inline-block after:bg-no-repeat after:bg-center after:bg-[url('/icons/arrowIcon01.svg')] last:after:hidden"
          >
            Home
          </Link>
          <span className="text-gray-800">Order Summary</span>
        </div>
      </div>
      <div className="storeContainer flex flex-col md:flex-row gap-8 py-8">
        {/* Cart Items */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 text-gray-900">Items in your cart</h2>
          {cartItems && cartItems.length ? (
            cartItems.map((item) => (
              <CartItem data={item} onLinkClicked={() => handleCartVisibility(false)} key={item.productId} />
            ))
          ) : (
            <div className="flex flex-col items-center">
              <div className="mt-20 mb-16 p-6 bg-gray-100 rounded-full">
                <ShoppingIconEmpty width={36} className="fill-gray-500" />
              </div>
              <span className="text-center text-gray-500">Shopping Cart is Empty.</span>
            </div>
          )}
        </div>
        {/* Billing & Payment */}
        <div className="w-full md:w-[400px] bg-white rounded-lg shadow p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-900">Billing Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>{subtotal} €</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `${shipping} €`}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-900">Payment Options</h2>
            <div className="flex flex-col gap-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer rounded px-2 py-1",
                    selectedPayment === method.id ? "bg-green-50 border border-green-400" : "bg-gray-100"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={() => setSelectedPayment(method.id)}
                  />
                  {method.label}
                </label>
              ))}
            </div>
          </div>
          <Button
            className="w-full text-base font-semibold text-white bg-green-600 hover:bg-green-700"
            disabled={cartItems.length === 0}
            onClick={() => router.push("/payment_gateway")}
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
