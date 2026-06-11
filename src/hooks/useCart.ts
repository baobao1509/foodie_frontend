import { useState } from 'react';
import { CartItem, MenuItem, Restaurant } from '../types';

export function useCart(restaurants: Restaurant[]) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem, notes?: string) => {
    // Tìm nhà hàng sở hữu món ăn này
    const belongRes = restaurants.find(r => r.menu.some(m => m.id === item.id));
    if (!belongRes) return;

    // Xem thử trong giỏ hàng đã có món ăn của cửa hàng KHÁC chưa
    const otherResInCart = cart.some(c => !belongRes.menu.some(m => m.id === c.menuItem.id));
    if (otherResInCart) {
      const confirmClear = window.confirm(
        'Giỏ hàng của bạn đang chứa món từ một cửa hàng khác. Bạn có muốn xóa sạch giỏ hàng hiện tại để bắt đầu chọn món từ quán này không?'
      );
      if (!confirmClear) return;
      // Xóa giỏ hàng trước, sau đó thêm món mới
      setCart([{ menuItem: item, quantity: 1, notes }]);
      return;
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((idx) => idx.menuItem.id === item.id);
      if (existingIdx > -1) {
        const copy = [...prevCart];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prevCart, { menuItem: item, quantity: 1, notes }];
    });
  };

  const updateCartItemQty = (itemId: string, diff: number) => {
    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.menuItem.id === itemId);
      if (idx === -1) return prevCart;

      const copy = [...prevCart];
      const newQty = copy[idx].quantity + diff;

      if (newQty <= 0) {
        copy.splice(idx, 1);
      } else {
        copy[idx].quantity = newQty;
      }
      return copy;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.menuItem.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Tính toán nhanh metadata của nhà hàng trong giỏ hàng hiện tại
  const getCartRestaurantMeta = () => {
    if (cart.length === 0) return { name: '', deliveryFee: 0, minOrderValue: 0, address: '' };
    const sampleItem = cart[0].menuItem;
    const res = restaurants.find(r => r.menu.some(m => m.id === sampleItem.id));
    return res 
      ? { name: res.name, deliveryFee: res.deliveryFee, minOrderValue: res.minOrderValue, address: res.address }
      : { name: '', deliveryFee: 0, minOrderValue: 0, address: '' };
  };

  const cartMeta = getCartRestaurantMeta();

  return {
    cart,
    addToCart,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    cartMeta,
  };
}
