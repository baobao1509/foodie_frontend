import React from 'react';
import { ActivePage } from '../types';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🍜</span>
            <span className="font-extrabold text-lg text-white font-display">FoodieVN</span>
          </div>
          <p className="text-xs leading-relaxed max-w-xs text-gray-500 font-medium">
            Cách đơn giản nhất để tiếp cận tinh hoa ẩm thực ba miền. Giao nhanh hỏa tốc đảm bảo độ nóng giòn từ thớt đến bàn ăn.
          </p>
        </div>

        {[
          { title: "Về nhà hàng", links: ["Đặt món nhanh", "Duyệt tìm sành điệu", "Khuyến mãi voucher"] },
          { title: "Hỗ trợ khách hàng", links: ["Trung tâm chăm sóc", "Khiếu nại bồi thường", "Hỏi đáp hữu ích"] },
          { title: "Gia nhập gia đình", links: ["Làm shipper giao hàng", "Làm đối tác thương gia", "Tuyển dụng nhân tài"] },
        ].map((sec) => (
          <div key={sec.title}>
            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-200 mb-4">{sec.title}</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-medium">
              {sec.links.map((link) => (
                <li key={link}>
                  <button 
                    onClick={() => setActivePage('home')} 
                    className="hover:text-orange-500 transition-colors cursor-pointer text-left"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-semibold tracking-wider text-gray-600 text-center">
        <p>© 2026 FOODIEVN PLATFORM. TẤT CẢ CÁC QUYỀN ĐƯỢC BẢO LƯU.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-400 transition-colors">ĐIỀU KHOẢN</a>
          <a href="#" className="hover:text-gray-400 transition-colors font-sans">BẢO MẬT</a>
          <a href="#" className="hover:text-gray-400 transition-colors">TRỢ GIÚP</a>
        </div>
      </div>
    </footer>
  );
}
