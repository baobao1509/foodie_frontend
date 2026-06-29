import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../../api';
import { 
  X, UtensilsCrossed, Plus, Check, Edit2, Trash2, Save, 
  CloudUpload, Image as ImageIcon, AlertCircle, Loader2, Star,
  ToggleLeft, ToggleRight, Settings
} from 'lucide-react';
import { 
  CategoriesResponseDTO, 
  MenuItemResponseDTO, 
  MenuItemOptionResponseDTO,
  getCategoryForEdit,
  updateCategoryInBackend
} from '../../services/categoryService';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  restaurantId: string;
  onSaveSuccess: () => void;
}

// Helper to calculate SHA-256 hash in Base64 for AWS S3 v2 checksum headers
async function calculateFileSHA256Base64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const binaryString = hashArray.map(b => String.fromCharCode(b)).join('');
  return btoa(binaryString);
}

export default function CategoryEditModal({ 
  isOpen, 
  onClose, 
  categoryId, 
  restaurantId,
  onSaveSuccess 
}: CategoryEditModalProps) {
  
  // Overall state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Category General Info
  const [categoryName, setCategoryName] = useState('');
  const [categoryDisplayOrder, setCategoryDisplayOrder] = useState(1);

  // Menu items list state (local state before saving)
  const [menuItems, setMenuItems] = useState<MenuItemResponseDTO[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null); // null means editing Category Info

  // Menu Item Form States (for the currently selected item)
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<number | string>('');
  const [itemOriginalPrice, setItemOriginalPrice] = useState<number | string>('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemIsAvailable, setItemIsAvailable] = useState(true);
  const [itemIsFeatured, setItemIsFeatured] = useState(false);
  const [itemDisplayOrder, setItemDisplayOrder] = useState(1);
  const [itemImageUrl, setItemImageUrl] = useState('');
  
  // Upload assets
  const [selectedItemFile, setSelectedItemFile] = useState<File | null>(null);
  const [itemPreviewUrl, setItemPreviewUrl] = useState('');
  const [itemFiles, setItemFiles] = useState<Record<string, File>>({}); // Cache of file updates by item id

  // Option states (for toppings of the currently selected item)
  const [options, setOptions] = useState<MenuItemOptionResponseDTO[]>([]);
  const [optGroupName, setOptGroupName] = useState('');
  const [optOptionName, setOptOptionName] = useState('');
  const [optExtraPrice, setOptExtraPrice] = useState<number | string>('');
  const [optIsDefault, setOptIsDefault] = useState(false);

  // Load category details from API
  useEffect(() => {
    if (!isOpen || !categoryId) return;

    const fetchCategoryDetails = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const data = await getCategoryForEdit(categoryId);
        setCategoryName(data.name || '');
        setCategoryDisplayOrder(data.displayOrder ?? 1);
        
        const sortedItems = Array.isArray(data.items) 
          ? [...data.items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          : [];
          
        setMenuItems(sortedItems);
        setSelectedItemId(null); // Focus on Category settings first
        setItemFiles({});
      } catch (err: any) {
        console.error('Lỗi tải chi tiết danh mục:', err);
        setErrorMsg(err.response?.data?.message || 'Không thể tải dữ liệu chi tiết danh mục từ API.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [isOpen, categoryId]);

  // Sync Form elements when selecting a menu item or switching to category configuration
  useEffect(() => {
    if (selectedItemId === null) {
      // Clear item fields
      setItemName('');
      setItemPrice('');
      setItemOriginalPrice('');
      setItemDesc('');
      setItemIsAvailable(true);
      setItemIsFeatured(false);
      setItemDisplayOrder(1);
      setItemImageUrl('');
      setSelectedItemFile(null);
      setItemPreviewUrl('');
      setOptions([]);
      return;
    }

    const item = menuItems.find(it => it.id === selectedItemId);
    if (item) {
      setItemName(item.name || '');
      setItemPrice(item.price ? Number(item.price) : '');
      setItemOriginalPrice(item.originalPrice ? Number(item.originalPrice) : '');
      setItemDesc(item.description || '');
      setItemIsAvailable(item.isAvailable !== false);
      setItemIsFeatured(item.isFeatured || false);
      setItemDisplayOrder(item.displayOrder ?? 1);
      setItemImageUrl(item.imageUrl || '');
      
      const fileCache = itemFiles[selectedItemId];
      if (fileCache) {
        setSelectedItemFile(fileCache);
        setItemPreviewUrl(URL.createObjectURL(fileCache));
      } else {
        setSelectedItemFile(null);
        setItemPreviewUrl(item.imageUrl || '');
      }
      
      setOptions(Array.isArray(item.options) ? [...item.options] : []);
    }
  }, [selectedItemId, menuItems, itemFiles]);

  // Toast notifier helper
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Switch tabs/elements safely after verifying current edits
  const handleSelectMenuItem = (id: string | null) => {
    setSelectedItemId(id);
  };

  // Add new menu item template locally
  const handleAddNewItemLocally = () => {
    const tempId = `new-item-${Date.now()}`;
    const newItem: MenuItemResponseDTO = {
      id: tempId,
      name: 'Món ăn mới',
      description: '',
      price: 0,
      imageUrl: '',
      isAvailable: true,
      isFeatured: false,
      displayOrder: menuItems.length + 1,
      options: []
    };

    setMenuItems([...menuItems, newItem]);
    setSelectedItemId(tempId);
    showToast('Đã tạo phác thảo món ăn mới. Hãy điền thông tin bên phải.');
  };

  // Delete menu item locally
  const handleDeleteItemLocally = (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xoá món "${name || 'không tên'}" khỏi danh mục này?`)) return;

    setMenuItems(prev => prev.filter(it => it.id !== id));
    setItemFiles(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
    showToast(`Đã xoá món "${name}" khỏi khay tạm.`);
  };

  // Apply inputs changes to currently selected item locally
  const handleApplyItemChangesLocally = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;
    if (!itemName.trim()) {
      showToast('Tên món ăn không được trống!', 'error');
      return;
    }
    if (itemPrice === '' || Number(itemPrice) < 0) {
      showToast('Giá bán phải là số dương hoặc 0!', 'error');
      return;
    }

    setMenuItems(prev => prev.map(it => {
      if (it.id === selectedItemId) {
        return {
          ...it,
          name: itemName.trim(),
          description: itemDesc.trim(),
          price: Number(itemPrice),
          originalPrice: itemOriginalPrice ? Number(itemOriginalPrice) : null,
          isAvailable: itemIsAvailable,
          isFeatured: itemIsFeatured,
          displayOrder: Number(itemDisplayOrder) || 1,
          imageUrl: itemPreviewUrl || it.imageUrl,
          options: options
        };
      }
      return it;
    }));

    // Cache the chosen file if exists
    if (selectedItemFile) {
      setItemFiles(prev => ({
        ...prev,
        [selectedItemId]: selectedItemFile
      }));
    }

    showToast('Đã cập nhật thay đổi món ăn vào bộ nhớ tạm!');
  };

  // Options (Toppings) Management
  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optOptionName.trim()) {
      showToast('Tên lựa chọn không để trống!', 'error');
      return;
    }

    const newOpt: MenuItemOptionResponseDTO = {
      groupName: optGroupName.trim() || 'Lựa chọn',
      optionName: optOptionName.trim(),
      extraPrice: Number(optExtraPrice) || 0,
      isDefault: optIsDefault
    };

    let updatedOptions = [...options];
    if (newOpt.isDefault) {
      // Unset other defaults in the same group
      updatedOptions = updatedOptions.map(o => {
        if (o.groupName.toLowerCase() === newOpt.groupName.toLowerCase()) {
          return { ...o, isDefault: false };
        }
        return o;
      });
    }

    const nextOptions = [...updatedOptions, newOpt];
    setOptions(nextOptions);

    // Auto update state back to item list
    if (selectedItemId) {
      setMenuItems(prev => prev.map(it => {
        if (it.id === selectedItemId) {
          return { ...it, options: nextOptions };
        }
        return it;
      }));
    }

    setOptOptionName('');
    setOptExtraPrice('');
    setOptIsDefault(false);
    showToast(`Đã đính kèm lựa chọn "${newOpt.optionName}"`);
  };

  const handleRemoveOption = (index: number) => {
    const nextOptions = options.filter((_, idx) => idx !== index);
    setOptions(nextOptions);
    
    if (selectedItemId) {
      setMenuItems(prev => prev.map(it => {
        if (it.id === selectedItemId) {
          return { ...it, options: nextOptions };
        }
        return it;
      }));
    }
    showToast('Đã gỡ lựa chọn topping.');
  };

  // Upload pictures to S3 and save entire Category to Spring Boot API
  const handleSaveAll = async () => {
    if (!categoryName.trim()) {
      showToast('Tên danh mục không được trống!', 'error');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const resolvedImageUrls: Record<string, string> = {};

      // 1. Upload files to AWS S3 using presigned URLs
      const fileEntries = Object.entries(itemFiles) as [string, File][];
      for (const [itemId, file] of fileEntries) {
        try {
          const sha256Base64 = await calculateFileSHA256Base64(file);

          const presignRes = await api.get('/upload/presign', {
            params: {
              folder: 'menu-items',
              fileName: file.name,
              contentType: file.type,
              fileSize: file.size,
              checksum: sha256Base64
            }
          });

          const { presignedUrl, imageURL } = presignRes.data;
          if (!presignedUrl || !imageURL) {
            throw new Error(`Không nhận được presigned url từ API cho tệp: ${file.name}`);
          }

          // RAW axios PUT request to S3
          await axios.put(presignedUrl, file, {
            headers: {
              'Content-Type': file.type,
              'x-amz-checksum-sha256': sha256Base64,
              'x-amz-sdk-checksum-algorithm': 'SHA256'
            }
          });

          resolvedImageUrls[itemId] = imageURL;
        } catch (uploadErr: any) {
          console.error(`S3 Upload failed for ${file.name}:`, uploadErr);
          throw new Error(`Lỗi tải ảnh món ăn ${file.name} lên S3: ` + (uploadErr.message || uploadErr));
        }
      }

      // 2. Map local menu items list to backend CategoriesRequestDTO
      const itemsPayload = menuItems.map((item, idx) => {
        let finalImageUrl = resolvedImageUrls[item.id] || item.imageUrl || '';
        if (finalImageUrl.startsWith('blob:')) {
          finalImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
        }

        return {
          id: item.id.startsWith('new-item-') ? undefined : item.id,
          name: item.name,
          description: item.description || '',
          imageUrl: finalImageUrl,
          price: Number(item.price) || 0,
          originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
          isAvailable: item.isAvailable !== false,
          isFeatured: item.isFeatured || false,
          displayOrder: item.displayOrder || (idx + 1),
          options: (item.options || []).map(opt => ({
            groupName: opt.groupName,
            optionName: opt.optionName,
            extraPrice: Number(opt.extraPrice) || 0,
            isDefault: opt.isDefault || false
          }))
        };
      });

      // 3. Construct unified CategoriesRequestDTO payload
      const payload = {
        name: categoryName.trim(),
        displayOrder: Number(categoryDisplayOrder) || 1,
        restaurantId: restaurantId,
        restaurantid: restaurantId,
        menuItems: itemsPayload,
        items: itemsPayload
      };

      // 4. PUT request to API
      await updateCategoryInBackend(categoryId, payload);
      
      setSuccessMsg('Đã cập nhật danh mục và toàn bộ danh sách món ăn lên máy chủ thành công!');
      showToast('Cập nhật thành công!');
      
      // Delay closing or refresh slightly for better UX
      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi gửi gói dữ liệu lên server.');
      showToast('Cập nhật thất bại!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs font-sans text-gray-800">
      
      <div className="bg-white rounded-3xl w-[96vw] max-w-7xl h-[92vh] flex flex-col shadow-2xl border border-gray-150 relative overflow-hidden">
        
        {/* Absolute Toast Panel */}
        {toastMsg && (
          <div className={`absolute top-16 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full text-xs font-black z-[110] flex items-center gap-1.5 shadow-lg border animate-bounce ${
            toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Settings className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black text-gray-950 uppercase tracking-wider">Tinh Chỉnh Chi Tiết Danh Mục</h1>
              <p className="text-[10px] text-gray-400 font-medium">Đang chỉnh sửa danh mục: <b className="text-gray-700">{categoryName || 'Mới'}</b> • Phân bổ dữ liệu Master-Detail</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              disabled={isSaving || isLoading}
              type="button"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-900/10 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-white" />
                  <span>Đang đồng bộ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0 text-orange-100" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>

            <button 
              onClick={onClose}
              disabled={isSaving}
              type="button"
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Split container */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-200 overflow-hidden">
          
          {/* SECTION 1: Category Info & Menu Items selection (col-span-4) */}
          <div className="md:col-span-4 flex flex-col h-full overflow-hidden bg-slate-50/50">
            
            {/* Category Settings Block */}
            <div className="p-4 border-b border-gray-150 bg-white space-y-3 shrink-0 text-left">
              <h2 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">1. Thông Tin Danh Mục</h2>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Tên Danh Mục</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Tên danh mục..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-gray-800"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Mã Sắp Xếp</label>
                  <input
                    type="number"
                    min="1"
                    value={categoryDisplayOrder}
                    onChange={(e) => setCategoryDisplayOrder(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold text-gray-800"
                  />
                </div>
              </div>

              {/* Reset selection back to category configuration */}
              <button
                onClick={() => handleSelectMenuItem(null)}
                className={`w-full py-2.5 px-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedItemId === null 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                    : 'bg-orange-50/60 border-orange-100 text-orange-700 hover:bg-orange-50'
                }`}
              >
                <span>⚙️ Đang tinh chỉnh Tên & Thứ tự Danh mục</span>
                {selectedItemId === null && <Check className="w-3.5 h-3.5 text-orange-400" />}
              </button>
            </div>

            {/* List Menu Items */}
            <div className="p-4 border-b border-gray-150 flex justify-between items-center bg-white shrink-0">
              <h2 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">2. Danh Sách Món Ăn ({menuItems.length})</h2>
              <button
                onClick={handleAddNewItemLocally}
                className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 cursor-pointer text-[10px] font-black flex items-center gap-1 uppercase transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm món</span>
              </button>
            </div>

            {/* Scroll list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-orange-600 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Đang tải danh sách món...</span>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="py-20 text-center text-xs text-gray-400 italic">Chưa có món ăn nào trong danh mục này. Hãy bấm "Thêm món" bên trên để tạo.</div>
              ) : (
                menuItems.map((item) => {
                  const isFocused = item.id === selectedItemId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectMenuItem(item.id)}
                      className={`group p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        isFocused 
                          ? 'bg-orange-550 bg-orange-600 text-white shadow-md shadow-orange-600/10 font-semibold' 
                          : 'hover:bg-gray-150/60 bg-white border border-gray-100 text-gray-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 text-left">
                        <img 
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} 
                          alt="" 
                          className="w-8 h-8 rounded-lg object-cover shrink-0 bg-gray-100 border border-gray-200/50"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{item.name || 'Món không tên'}</p>
                          <p className={`text-[10px] font-mono mt-0.5 ${isFocused ? 'text-orange-200' : 'text-gray-400'}`}>
                            {Number(item.price || 0).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                          item.isAvailable === false 
                            ? 'bg-red-100 text-red-700' 
                            : isFocused ? 'bg-orange-700 text-orange-100' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.isAvailable === false ? 'Hết' : 'Bán'}
                        </span>
                        
                        <button
                          onClick={() => handleDeleteItemLocally(item.id, item.name)}
                          className={`p-1 rounded-lg cursor-pointer ${
                            isFocused ? 'hover:bg-orange-700 text-orange-200 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'
                          }`}
                          title="Xoá món ăn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* SECTION 2: Menu Item Edit Form (col-span-8) */}
          <div className="md:col-span-8 flex flex-col h-full overflow-hidden bg-white">
            
            {selectedItemId === null ? (
              // Empty selection or Category info tab focus
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/30 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-4">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">Đang tập trung tinh chỉnh danh mục</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                  Bạn có thể cập nhật Tên danh mục và Thứ tự hiển thị ở bảng bên trái. Để sửa đổi, thêm mới món ăn hoặc topping đi kèm, hãy chọn một món ăn cụ thể từ danh sách bên trái.
                </p>
              </div>
            ) : (
              // Detailed form for editing the selected menu item
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
                
                {/* Save Local Notice */}
                <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Chế độ Nháp Cục Bộ:</span> Mọi chỉnh sửa ở form này cần bấm <b className="text-amber-950">"Xác nhận lưu món"</b> phía dưới để lưu vào bộ nhớ tạm, sau đó bấm nút <b className="text-amber-950">"Lưu thay đổi"</b> ở góc trên cùng để đồng bộ chính thức lên server Spring Boot.
                  </div>
                </div>

                <form onSubmit={handleApplyItemChangesLocally} className="space-y-6">
                  
                  <div>
                    <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-1.5 pb-2 border-b border-gray-100">
                      <span>🍔</span>
                      <span>Thông tin chi tiết món ăn</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tên món ăn <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="ví dụ: Bún đậu đặc biệt"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-mono">Giá bán (VND) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={itemPrice}
                          onChange={(e) => setItemPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                          placeholder="ví dụ: 65000"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-mono font-bold text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-mono font-normal">Giá niêm yết cũ (Gạch đi - VND)</label>
                        <input
                          type="number"
                          min="0"
                          value={itemOriginalPrice}
                          onChange={(e) => setItemOriginalPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                          placeholder="bỏ trống nếu không giảm giá"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-mono text-gray-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mô tả món ăn</label>
                        <textarea
                          rows={2}
                          value={itemDesc}
                          onChange={(e) => setItemDesc(e.target.value)}
                          placeholder="Thành phần: bún tươi, giò heo chấm mắm tôm nướng chuẩn vị..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-gray-800 resize-none"
                        />
                      </div>

                      {/* Display configs toggles */}
                      <div className="md:col-span-2 grid grid-cols-3 gap-3 pt-1">
                        
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-150 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-gray-800">Trạng thái bán</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{itemIsAvailable ? 'Đang bán' : 'Tạm dừng bán'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setItemIsAvailable(!itemIsAvailable)}
                            className="text-gray-600 hover:text-orange-600 transition-colors cursor-pointer"
                          >
                            {itemIsAvailable ? (
                              <ToggleRight className="w-8 h-8 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-gray-400" />
                            )}
                          </button>
                        </div>

                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-150 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-gray-800">Gợi ý nổi bật</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{itemIsFeatured ? 'Bán chạy (HOT)' : 'Mặc định'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setItemIsFeatured(!itemIsFeatured)}
                            className="text-gray-600 hover:text-orange-600 transition-colors cursor-pointer"
                          >
                            {itemIsFeatured ? (
                              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                            ) : (
                              <Star className="w-5 h-5 text-gray-350" />
                            )}
                          </button>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Mã Sắp Xếp Món</label>
                          <input
                            type="number"
                            min="1"
                            value={itemDisplayOrder}
                            onChange={(e) => setItemDisplayOrder(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-mono font-bold text-gray-800"
                          />
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* S3 File image upload block */}
                  <div>
                    <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-1.5 pb-2 border-b border-gray-100">
                      <span>📸</span>
                      <span>Ảnh minh hoạ sản phẩm</span>
                    </h3>

                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          if (!file.type.startsWith('image/')) {
                            showToast('Chỉ chấp nhận các tệp tin có định dạng hình ảnh!', 'error');
                            return;
                          }
                          setSelectedItemFile(file);
                          setItemPreviewUrl(URL.createObjectURL(file));
                          showToast('Đã ghi nhận ảnh kéo thả thành công!');
                        }
                      }}
                      onClick={() => document.getElementById('modal-edit-item-file-input')?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-orange-500 rounded-2xl p-4 text-center cursor-pointer bg-gray-50/50 hover:bg-orange-50/5 transition-all relative group flex flex-col items-center justify-center min-h-[140px]"
                    >
                      <input 
                        id="modal-edit-item-file-input"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!file.type.startsWith('image/')) {
                              showToast('Chỉ chấp nhận các tệp tin có định dạng hình ảnh!', 'error');
                              return;
                            }
                            setSelectedItemFile(file);
                            setItemPreviewUrl(URL.createObjectURL(file));
                            showToast('Đã nạp ảnh thành công!');
                          }
                        }}
                      />

                      {itemPreviewUrl ? (
                        <div className="relative w-full max-w-xs h-32 rounded-xl overflow-hidden shadow-inner group/preview border border-gray-200">
                          <img 
                            src={itemPreviewUrl} 
                            alt="Preview" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-350"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white font-black uppercase tracking-wider bg-orange-600 px-2.5 py-1.5 rounded-lg shadow-md">Đổi ảnh mới</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="w-10 h-10 bg-orange-100/60 text-orange-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-700">Kéo & thả ảnh món ăn vào đây hoặc nhấp chọn tệp</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">Chấp nhận tệp ảnh JPEG, PNG, WEBP dưới 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toppings option group list */}
                  <div>
                    <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-1.5 pb-2 border-b border-gray-100">
                      <span>🍡</span>
                      <span>Tuỳ chọn Toppings kèm theo ({options.length})</span>
                    </h3>

                    {/* Inline adding option option */}
                    <div className="p-3.5 bg-gray-50 border border-gray-150 rounded-2xl text-xs space-y-3 mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Thêm Topping mới vào món:</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Nhóm Tuỳ Chọn</label>
                          <input
                            type="text"
                            placeholder="ví dụ: Kích cỡ, Thêm kem..."
                            value={optGroupName}
                            onChange={(e) => setOptGroupName(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium text-gray-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Tên Topping</label>
                          <input
                            type="text"
                            placeholder="ví dụ: Size L, Trân châu..."
                            value={optOptionName}
                            onChange={(e) => setOptOptionName(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium text-gray-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Giá Cộng Thêm (VND)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="ví dụ: 10000"
                            value={optExtraPrice}
                            onChange={(e) => setOptExtraPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono text-gray-800"
                          />
                        </div>

                        <div className="flex items-end gap-2">
                          <label className="flex items-center gap-1.5 mb-2.5 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={optIsDefault}
                              onChange={(e) => setOptIsDefault(e.target.checked)}
                              className="accent-orange-600 rounded"
                            />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Mặc định</span>
                          </label>

                          <button
                            type="button"
                            onClick={handleAddOption}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-lg py-2 text-[10px] uppercase cursor-pointer text-center h-9 shrink-0 flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Đính kèm</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Display current toppings */}
                    {options.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic">Món này chưa thiết lập tùy chọn topping.</p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-150 rounded-xl bg-white shadow-inner">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-200">
                            <tr>
                              <th className="p-2 pl-3">Nhóm</th>
                              <th className="p-2">Tên Lựa chọn</th>
                              <th className="p-2 text-right">Giá cộng thêm</th>
                              <th className="p-2 text-center">Mặc định</th>
                              <th className="p-2 text-center w-12">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {options.map((opt, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-2 pl-3 font-bold text-gray-900">{opt.groupName}</td>
                                <td className="p-2 text-gray-700">{opt.optionName}</td>
                                <td className="p-2 text-right font-mono text-gray-950">+{Number(opt.extraPrice || 0).toLocaleString('vi-VN')} đ</td>
                                <td className="p-2 text-center">
                                  {opt.isDefault ? (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase">DEFAULT</span>
                                  ) : (
                                    <span className="text-gray-350">-</span>
                                  )}
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(idx)}
                                    className="p-1 hover:bg-red-50 text-gray-450 hover:text-red-600 rounded-md cursor-pointer"
                                    title="Xoá Topping"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Form Footer action buttons */}
                  <div className="pt-5 border-t border-gray-150 flex justify-between items-center bg-white">
                    <p className="text-[10px] text-gray-400 italic">
                      * Nhớ nhấn nút này để lưu tạm món ăn vào danh sách trước khi đồng bộ.
                    </p>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-slate-950/10 active:scale-95"
                    >
                      <Check className="w-4 h-4 text-orange-400" />
                      <span>Xác nhận lưu món</span>
                    </button>
                  </div>

                </form>

              </div>
            )}

          </div>

        </div>

        {/* Global error block */}
        {errorMsg && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-750 text-xs font-bold leading-relaxed z-[110] shadow-md animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Global success block */}
        {successMsg && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-850 text-xs font-bold leading-relaxed z-[110] shadow-md animate-fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-600 animate-bounce" />
            <span>{successMsg}</span>
          </div>
        )}

      </div>
    </div>
  );
}
