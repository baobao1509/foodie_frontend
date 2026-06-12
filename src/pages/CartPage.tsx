import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AppContextType, Order } from '../types';
import { PROMO_CODES } from '../data';
import { Trash2, Plus, Minus, CreditCard, Tag, Landmark, Wallet, Truck, AlertCircle } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    updateCartItemQty,
    removeFromCart,
    onPlaceOrder,
    clearCart,
    cartMeta,
    restaurants,
  } = useOutletContext<AppContextType>();

  const {
    name: restaurantName,
    address: restaurantAddress,
    deliveryFee,
    minOrderValue,
  } = cartMeta;

  const sampleItem = cart[0]?.menuItem;
  const currentRes = restaurants.find(r => r.menu.some(m => m.id === sampleItem?.id));
  const restaurantId = currentRes?.id || null;
  // Recipient details form states
  const [recipientName, setRecipientName] = useState('Nguyễn Gia Bảo');
  const [recipientPhone, setRecipientPhone] = useState('0901234567');
  const [shippingAddress, setShippingAddress] = useState('123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh');
  
  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MOMO' | 'VNPAY' | 'CREDIT_CARD'>('CASH');

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Cart calculations
  const subtotal = cart.reduce((acc, c) => acc + (c.menuItem.price * c.quantity), 0);
  const discount = appliedPromo ? Math.min(appliedPromo.discount, subtotal) : 0;
  const deliveryCostForOrder = subtotal > 0 ? deliveryFee : 0;
  const total = Math.max(0, subtotal + deliveryCostForOrder - discount);

  const meetsMinOrder = subtotal >= minOrderValue;

  // Apply promo code action
  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    
    if (!promoInput.trim()) {
      setPromoError('Vui lòng nhập mã giảm giá!');
      return;
    }

    const codeObj = PROMO_CODES.find(p => p.code.toUpperCase() === promoInput.toUpperCase().trim());
    
    if (!codeObj) {
      setPromoError('Mã ưu đãi không tồn tại hoặc đã hết hạn!');
      setAppliedPromo(null);
      return;
    }

    if (subtotal < codeObj.minOrder) {
      setPromoError(`Mã này chỉ áp dụng cho đơn hàng từ ${(codeObj.minOrder/1000).toFixed(0)}k đ trở lên!`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo({
      code: codeObj.code,
      discount: codeObj.discount
    });
    setPromoSuccess(`Áp dụng thành công mã ${codeObj.code}! Bạn được giảm ${codeObj.discount.toLocaleString('vi-VN')} đ`);
  };

  // Submit Order logic
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) return;

    if (!recipientName.trim() || !recipientPhone.trim() || !shippingAddress.trim()) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    if (!meetsMinOrder) {
      alert(`Đơn hàng tối thiểu của nhà hàng này là ${(minOrderValue / 1000).toFixed(0)}k đ. Bạn cần mua thêm để đặt đơn!`);
      return;
    }

    const newOrder: Order = {
      id: `F-${Math.floor(100000 + Math.random() * 900000)}`,
      restaurantId: restaurantId || 'unknown',
      restaurantName: restaurantName,
      restaurantAddress: restaurantAddress,
      items: [...cart],
      subtotal,
      deliveryFee: deliveryCostForOrder,
      discount,
      total,
      status: 'PENDING',
      shippingAddress,
      recipientName,
      recipientPhone,
      paymentMethod,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timeline: [
        {
          status: 'PENDING',
          title: 'Đã nhận đơn hàng',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          description: 'Hệ thống đã ghi nhận đơn hàng của quý khách.'
        }
      ]
    };

    onPlaceOrder(newOrder);
    clearCart();
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-150 shadow-xs">
          <span className="text-5xl select-none">🛒</span>
          <h2 className="text-xl font-extrabold text-gray-950 mt-4 mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-sm text-gray-500 mb-6">Bạn chưa có món ăn ngon nào trong giỏ hàng cả. Hãy ghé trang chủ để lựa chọn một vài món yêu thích nhé!</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Quay lại tìm món ngon
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <main className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Cart Items & Details Form (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Cart Header Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <div>
                <h1 className="text-xl font-black text-gray-950">Giỏ hàng từ quán</h1>
                <p className="text-xs text-orange-600 font-bold mt-1 uppercase tracking-wide">🍲 {restaurantName}</p>
              </div>
              <button
                onClick={() => { if(confirm('Xoá toàn bộ giỏ hàng?')) clearCart(); }}
                className="text-xs text-gray-400 hover:text-red-600 font-medium transition-colors cursor-pointer"
              >
                Xoá tất cả
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex flex-col">
              {cart.map((item, idx) => (
                <div
                  key={item.menuItem.id}
                  className={`flex gap-4 py-4 ${idx !== cart.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <img
                    src={item.menuItem.imageUrl}
                    alt={item.menuItem.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-50"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-gray-950">{item.menuItem.name}</h3>
                      <p className="text-[10px] text-gray-400 font-medium">Đơn giá: {item.menuItem.price.toLocaleString('vi-VN')} đ</p>
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="text"
                        placeholder="Thêm lưu ý (ví dụ: Không hành, cay vừa...)"
                        value={item.notes || ''}
                        onChange={(e) => {
                          // Allow typing note
                          item.notes = e.target.value;
                        }}
                        className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 w-full max-w-sm outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0">
                    <span className="font-bold text-sm text-gray-950">
                      {(item.menuItem.price * item.quantity).toLocaleString('vi-VN')} đ
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-1.5 py-0.5 border border-gray-100">
                        <button
                          onClick={() => updateCartItemQty(item.menuItem.id, -1)}
                          className="p-1 rounded-sm text-gray-500 hover:bg-white hover:text-orange-600 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center select-none">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQty(item.menuItem.id, 1)}
                          className="p-1 rounded-sm text-gray-500 hover:bg-white hover:text-orange-600 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Xoá món"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Minimum order requirement warning */}
            {!meetsMinOrder && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2.5 text-amber-800">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Chưa đạt đơn tối thiểu!</h4>
                  <p className="text-xs mt-0.5">
                    Nhà hàng này yêu cầu giá trị tối thiểu là <b>{minOrderValue.toLocaleString('vi-VN')} đ</b>. Bạn hiện mới đạt <b>{subtotal.toLocaleString('vi-VN')} đ</b>. Hãy chọn thêm món ăn trước khi thanh toán!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Details Form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <h2 className="text-lg font-black text-gray-950 pb-4 border-b border-gray-100 mb-4 flex items-center gap-2">
              <span>📍</span>
              <span>Thông tin giao hàng</span>
            </h2>

            <form className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Họ tên người nhận</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-hidden font-medium text-gray-800"
                    placeholder="Nhập tên người nhận"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Số điện thoại liên lạc</label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-hidden font-medium text-gray-800"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Địa chỉ nhận hàng chi tiết</label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-hidden font-medium text-gray-800 resize-none"
                  placeholder="Nhập số nhà, hẻm, tên đường, tên phường/quận"
                />
              </div>
            </form>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <h2 className="text-lg font-black text-gray-950 pb-4 border-b border-gray-100 mb-4 flex items-center gap-2">
              <span>💳</span>
              <span>Phương thức thanh toán</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'CASH', label: 'Tiền mặt (COD)', desc: 'Thanh toán khi nhận', icon: <Truck className="w-5 h-5 text-gray-600" /> },
                { id: 'MOMO', label: 'Ví MoMo', desc: 'Sử dụng app MoMo', icon: <Wallet className="w-5 h-5 text-fuchsia-600" /> },
                { id: 'VNPAY', label: 'Cổng VNPAY', desc: 'Thẻ ATM / QR ngân hàng', icon: <Landmark className="w-5 h-5 text-blue-600" /> },
                { id: 'CREDIT_CARD', label: 'Thẻ tín dụng', desc: 'Visa / Mastercard', icon: <CreditCard className="w-5 h-5 text-emerald-600" /> },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPaymentMethod(p.id as any)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-28 relative ${
                    paymentMethod === p.id
                      ? 'border-orange-500 bg-orange-500/[0.03] shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-xl bg-gray-100/80">{p.icon}</div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === p.id ? 'border-orange-600 bg-orange-600' : 'border-gray-300'
                    }`}>
                      {paymentMethod === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-[11px] text-gray-900">{p.label}</h4>
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Sticky Checkout Pricing & Promo Sidebar (4 cols) */}
        <div className="lg:col-span-4 self-start flex flex-col gap-6 lg:sticky lg:top-24">
          
          {/* Promo code entry */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-gray-950 mb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-orange-600" />
              <span>Khuyến mại & Voucher</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: FOODIEPROMO"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 rounded-xl p-3 flex-1 uppercase tracking-wider focus:outline-hidden focus:ring-1 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="bg-orange-600 hover:bg-orange-700 active:bg-orange-850 text-white font-bold text-xs px-4 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Áp dụng
              </button>
            </div>

            {/* Hint of coupon */}
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-[10px] text-gray-400 font-medium">Voucher gợi ý: </span>
              {PROMO_CODES.map(c => (
                <button
                  key={c.code}
                  onClick={() => { setPromoInput(c.code); }}
                  className="bg-gray-100 p-1 rounded-sm text-[9px] font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-transparent transition-colors cursor-pointer"
                >
                  {c.code}
                </button>
              ))}
            </div>

            {promoError && (
              <p className="text-[11px] text-red-600 font-bold mt-2.5 flex items-center gap-1">
                ⚠️ {promoError}
              </p>
            )}

            {promoSuccess && (
              <p className="text-[11px] text-emerald-600 font-bold mt-2.5 flex items-center gap-1">
                ✓ {promoSuccess}
              </p>
            )}
          </div>

          {/* Pricing calculations total window */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md shadow-gray-100/50">
            <h3 className="font-bold text-gray-950 text-base mb-4 pb-3 border-b border-gray-50">
              Tổng quan thanh toán
            </h3>

            <div className="flex flex-col gap-3 pb-4 border-b border-gray-50 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tổng tiền hàng</span>
                <span className="font-semibold text-gray-900">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển giao tận nơi</span>
                <span className="font-semibold text-gray-900">{deliveryCostForOrder.toLocaleString('vi-VN')} đ</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Ưu đãi áp dụng ({appliedPromo.code})</span>
                  <span>- {discount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 mb-6">
              <span className="font-bold text-sm text-gray-950">Tổng số tiền cần trả</span>
              <span className="font-black text-xl text-orange-600 font-sans tracking-tight">
                {total.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Checkout CTA block */}
            <button
              onClick={handleCheckoutSubmit}
              disabled={!meetsMinOrder}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                meetsMinOrder
                  ? 'bg-orange-600 hover:bg-orange-700 text-white active:bg-orange-850 cursor-pointer shadow-orange-600/10'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>🛒 Đặt đơn hàng ngay</span>
            </button>
            
            <p className="text-center text-[10px] text-gray-400 font-semibold mt-3.5 leading-normal uppercase">
              Bằng việc bấm đặt hàng, bạn đồng ý với Điều khoản Bảo mật và Giao ước Dịch vụ
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}
