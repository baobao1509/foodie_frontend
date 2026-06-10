import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { PlusCircle } from 'lucide-react';

interface AddDishFormProps {
  selectedResId: string;
  onAddMenuItem: (restaurantId: string, item: MenuItem) => void;
}

export default function AddDishForm({ selectedResId, onAddMenuItem }: AddDishFormProps) {
  // States for adding new menu item
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubCat, setNewSubCat] = useState('Đặc sản mới');
  const [newPrice, setNewPrice] = useState(45000);
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80');
  const [isPopular, setIsPopular] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  // Handle adding a dish
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice || !selectedResId) return;

    const newDish: MenuItem = {
      id: `m-custom-${Math.floor(Math.random() * 10000)}`,
      name: newName,
      description: newDesc || 'Đĩa thức ăn nóng sốt đậm đà hương vị thơm ngon hấp dẫn.',
      price: Number(newPrice),
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      category: newSubCat || 'Đặc sản mới',
      isPopular: isPopular
    };

    onAddMenuItem(selectedResId, newDish);
    setNewName('');
    setNewDesc('');
    setIsPopular(false);
    setFormSuccess('Đã lưu và thêm món vị ngon mới vào thực đơn thành công!');
    setTimeout(() => setFormSuccess(''), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
      <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <PlusCircle className="w-4 h-4 text-emerald-600" />
        <span>Thêm vị ngon mới vào bếp</span>
      </h3>

      <form onSubmit={handleAddDish} className="flex flex-col gap-3 text-xs text-gray-500">
        <div>
          <label className="block font-bold mb-1 uppercase tracking-wide text-gray-400">Tên món ăn</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ví dụ: Bún đậu mắm tôm thập cẩm"
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 font-medium outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold mb-1 uppercase tracking-wide text-gray-400">Giá thành (đ)</label>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(Number(e.target.value))}
            placeholder="45000"
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 font-mono outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold mb-1 uppercase tracking-wide text-gray-400">Mô tả ngắn</label>
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Có thịt dải nướng, chả cốm giòn..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 font-medium outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold mb-1 uppercase tracking-wide text-gray-400">Nhóm phân loại (Sub-category)</label>
          <input
            type="text"
            value={newSubCat}
            onChange={(e) => setNewSubCat(e.target.value)}
            placeholder="Ví dụ: Đặc sản vùng miền"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 font-medium outline-hidden"
          />
        </div>

        <div>
          <label className="block font-bold mb-1 uppercase tracking-wide text-gray-400">Đường dẫn hình ảnh (URL)</label>
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://unsplash.com/..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 outline-hidden font-mono"
          />
        </div>

        <div className="flex items-center gap-2 mt-2 py-1.5 border-t border-b border-gray-50">
          <input
            type="checkbox"
            id="popular_toggle"
            checked={isPopular}
            onChange={(e) => setIsPopular(e.target.checked)}
            className="accent-emerald-600 cursor-pointer h-4 w-4"
          />
          <label htmlFor="popular_toggle" className="font-semibold text-gray-700 cursor-pointer select-none">
            Đánh dấu món bán chạy (Best Seller ⭐)
          </label>
        </div>

        {formSuccess && (
          <p className="bg-emerald-50 text-emerald-700 text-[10px] font-bold p-2.5 rounded-lg border border-emerald-100 flex items-center gap-1">
            ✓ {formSuccess}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 py-2.5 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
        >
          Lưu món ăn & Xuất bản thực đơn
        </button>
      </form>
    </div>
  );
}
