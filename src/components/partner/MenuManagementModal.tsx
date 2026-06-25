import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Restaurant, MenuItem } from '../../types';
import { 
  createCategoryInBackend, 
  deleteCategoryInBackend, 
  createMenuItemInBackend, 
  deleteMenuItemInBackend,
  submitFullMenuToBackend,
  api
} from '../../api';
import { 
  X, Plus, Edit2, Trash2, Check, ArrowRight, Save, ToggleLeft, 
  ToggleRight, Award, DollarSign, ListOrdered, Layers, Grid, UtensilsCrossed,
  CloudUpload, Code, Copy, Database, Image
} from 'lucide-react';

interface MenuManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  setRestaurants: (restaurants: Restaurant[]) => void;
  allRestaurants: Restaurant[];
}

interface CategoryDTO {
  id: string;
  name: string;
  displayOrder: number;
}

interface OptionDTO {
  groupName: string;
  optionName: string;
  extraPrice: number;
  isDefault: boolean;
}

// Helper functions to calculate SHA-256 hash of a file on client-side
async function calculateFileSHA256Hex(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function calculateFileSHA256Base64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const binaryString = hashArray.map(b => String.fromCharCode(b)).join('');
  return btoa(binaryString);
}

export default function MenuManagementModal({
  isOpen,
  onClose,
  restaurant,
  setRestaurants,
  allRestaurants
}: MenuManagementModalProps) {
  // Categories list state representation
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  
  // Create Category forms
  const [newCatName, setNewCatName] = useState('');
  const [newCatOrder, setNewCatOrder] = useState(1);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatOrder, setEditingCatOrder] = useState(1);

  // Active Menu Item in Detail Form (null = not editing/creating, 'new' = creating, MenuItem = editing)
  const [activeItem, setActiveItem] = useState<MenuItem | null | 'new'>(null);

  // Menu Item DTO form fields
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemPrice, setItemPrice] = useState(30000);
  const [itemOriginalPrice, setItemOriginalPrice] = useState<number | ''>('');
  const [itemIsAvailable, setItemIsAvailable] = useState(true);
  const [itemIsFeatured, setItemIsFeatured] = useState(false);
  const [itemDisplayOrder, setItemDisplayOrder] = useState(1);
  const [itemOptions, setItemOptions] = useState<OptionDTO[]>([]);

  // Local File Upload states for each active menu item
  const [selectedItemFile, setSelectedItemFile] = useState<File | null>(null);
  const [itemPreviewUrl, setItemPreviewUrl] = useState<string>('');
  const [itemFiles, setItemFiles] = useState<Record<string, File>>({});

  // Form states to add custom option rows
  const [optGroupName, setOptGroupName] = useState('Size');
  const [optOptionName, setOptOptionName] = useState('');
  const [optExtraPrice, setOptExtraPrice] = useState(0);
  const [optIsDefault, setOptIsDefault] = useState(false);

  // Toast / Status messaging
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // States for showing the sent payload preview
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);
  const [generatedPayload, setGeneratedPayload] = useState<any>(null);
  const [showJsonDetail, setShowJsonDetail] = useState(false);

  const handleSubmitCollectiveData = async () => {
    setIsLoading(true);
    try {
      // Step 0: Validate collective list sizes
      if (categories.length === 0) {
        throw new Error('Thực đơn phải có ít nhất 1 danh mục món ăn!');
      }
      if (categories.length > 20) {
        throw new Error('Số lượng danh mục không được vượt quá 20 danh mục!');
      }

      let totalMenuItemsCount = 0;
      for (const cat of categories) {
        const itemsForCat = restaurant.menu.filter(
          item => (item.category || '').toLowerCase() === cat.name.toLowerCase()
        );
        if (itemsForCat.length === 0) {
          throw new Error(`Danh mục "${cat.name}" hiện không có món ăn nào! Hãy thêm ít nhất 1 món ăn hoặc xoá danh mục này.`);
        }
        if (itemsForCat.length > 50) {
          throw new Error(`Danh mục "${cat.name}" vượt quá giới hạn cho phép (tối đa 50 món mỗi danh mục)!`);
        }
        totalMenuItemsCount += itemsForCat.length;

        for (const item of itemsForCat) {
          const options = (item as any).options || [];
          if (options.length > 25) {
            throw new Error(`Món ăn "${item.name}" trong danh mục "${cat.name}" có quá nhiều tuỳ chọn (tối đa 25 tuỳ chọn)!`);
          }
        }
      }

      if (totalMenuItemsCount > 200) {
        throw new Error('Tổng số lượng món ăn trong thực đơn của nhà hàng không được vượt quá 200 món!');
      }

      // Step A: Upload all new files for menu items to S3 and resolve their S3 Keys
      const resolvedImageUrls: Record<string, string> = {};

      for (const [itemId, fileObj] of Object.entries(itemFiles)) {
        const file = fileObj as File;
        try {
          // Double check file size before upload (must be <= 10MB)
          if (file.size > 10485760) {
            throw new Error(`Kích thước tệp tin ${file.name} vượt quá giới hạn cho phép (10MB)!`);
          }

          // Calculate SHA-256 hash on client-side
          const sha256Base64 = await calculateFileSHA256Base64(file);

          // Get presigned URL with fileSize and checksum params
          const presignRes = await api.get('/upload/presign', {
            params: {
              folder: 'menu-items',
              fileName: file.name,
              contentType: file.type,
              fileSize: file.size, // Pass fileSize to backend so it can double check
              checksum: sha256Base64, // Must be SHA-256 Base64 format for AWS S3 SDK v2 .checksumSHA256()
            }
          });

          const { presignedUrl, imageURL } = presignRes.data;
          if (!presignedUrl || !imageURL) {
            throw new Error(`Không nhận được link tải lên cho ${file.name}`);
          }

          // Upload to S3 with headers to enforce SHA-256 integrity check
          await axios.put(presignedUrl, file, {
            headers: {
              'Content-Type': file.type,
              'x-amz-checksum-sha256': sha256Base64, // Standard S3 SHA-256 checksum validation header
              'x-amz-sdk-checksum-algorithm': 'SHA256' // Required to match the AWS SDK v2 presigner's signed headers
            }
          });

          resolvedImageUrls[itemId] = imageURL;
        } catch (uploadErr: any) {
          console.error(`Lỗi tải ảnh của món ${itemId} lên S3:`, uploadErr);
          throw new Error(uploadErr.message || `Tải ảnh cho món ăn thất bại: ${file.name}`);
        }
      }

      // Map categories to list with menuItems nested
      const categoriesPayload = categories
        .sort((a,b) => a.displayOrder - b.displayOrder)
        .map(cat => {
          const itemsForCat = restaurant.menu.filter(
            item => (item.category || '').toLowerCase() === cat.name.toLowerCase()
          );

          const menuItemsPayload = itemsForCat.map((item, index) => {
            let finalImageUrl = resolvedImageUrls[item.id] || item.imageUrl || '';
            if (finalImageUrl.startsWith('blob:')) {
              finalImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
            }

            return {
              name: item.name,
              description: item.description || '',
              imageUrl: finalImageUrl,
              price: item.price,
              originalPrice: (item as any).originalPrice || null,
              isAvailable: (item as any).isAvailable !== false,
              isFeatured: item.isPopular || false,
              displayOrder: index + 1,
              options: (item as any).options || []
            };
          });

          return {
            name: cat.name,
            displayOrder: cat.displayOrder,
            menuItems: menuItemsPayload
          };
        });

      const finalPayload = {
        restaurantId: restaurant.id,
        categories: categoriesPayload
      };

      const result = await submitFullMenuToBackend(finalPayload);
      setGeneratedPayload(finalPayload);
      setShowPayloadPreview(true);
      showToast('Đã đồng bộ thực đơn dạng DTO lên API thành công!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gửi dữ liệu lên API thất bại.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger quick informational toast message
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Extract initial categories from restaurant menu
  useEffect(() => {
    if (restaurant) {
      const uniqueCats = Array.from(new Set(restaurant.menu.map(m => m.category || 'Món ăn')));
      const initialCats = uniqueCats.map((cat, index) => {
        // Try parsing database category sequence mapping
        return {
          id: `cat-${index + 1}`,
          name: cat,
          displayOrder: index + 1
        };
      });
      setCategories(initialCats);
      if (initialCats.length > 0) {
        setSelectedCatId(initialCats[0].id);
      }
    }
  }, [restaurant]);

  if (!isOpen) return null;

  // Selected Category representation helper
  const selectedCategory = categories.find(c => c.id === selectedCatId);
  const selectedCategoryName = selectedCategory ? selectedCategory.name : '';

  // Filter food items inside the selected category name
  const filteredMenuItems = restaurant.menu.filter(
    item => (item.category || '').toLowerCase() === selectedCategoryName.toLowerCase()
  );

  // --- CATEGORY OPERATIONS ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const generatedId = `cat-${Date.now()}`;
    const newCategory: CategoryDTO = {
      id: generatedId,
      name: newCatName.trim(),
      displayOrder: Number(newCatOrder) || 1
    };

    setCategories(prev => [...prev, newCategory]);
    setSelectedCatId(generatedId);
    setNewCatName('');
    setNewCatOrder(Number(newCatOrder) + 1);
    setIsAddingCat(false);
    showToast('Đã thêm danh mục mới thành công!');
  };

  const handleStartEditCategory = (cat: CategoryDTO) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
    setEditingCatOrder(cat.displayOrder);
  };

  const handleSaveEditCategory = (catId: string) => {
    if (!editingCatName.trim()) return;

    // Update local state
    setCategories(prev => prev.map(c => {
      if (c.id === catId) {
        return { ...c, name: editingCatName.trim(), displayOrder: Number(editingCatOrder) || 1 };
      }
      return c;
    }));

    // Update menu items matching the old category name to the new name in context
    const currentCatName = categories.find(c => c.id === catId)?.name || '';
    if (currentCatName !== editingCatName.trim()) {
      const updatedMenu = restaurant.menu.map(m => {
        if (m.category === currentCatName) {
          return { ...m, category: editingCatName.trim() };
        }
        return m;
      });

      const updatedRestaurants = allRestaurants.map(r => {
        if (r.id === restaurant.id) {
          return { ...r, menu: updatedMenu };
        }
        return r;
      });
      setRestaurants(updatedRestaurants);
    }

    setEditingCatId(null);
    showToast('Cập nhật danh mục thành công!');
  };

  const handleDeleteCategory = (catId: string, name: string) => {
    if (!confirm(`Bạn chắc chắn muốn xoá danh mục "${name}"? Các món ở danh mục này sẽ bị thu hồi.`)) {
      return;
    }

    // Remove local category
    setCategories(prev => prev.filter(c => c.id !== catId));

    // Wipe out restaurant menu items belonging to deleted category
    const updatedMenu = restaurant.menu.filter(m => m.category !== name);
    const updatedRestaurants = allRestaurants.map(r => {
      if (r.id === restaurant.id) {
        return { ...r, menu: updatedMenu, categories: r.categories.filter(c => c !== name) };
      }
      return r;
    });
    setRestaurants(updatedRestaurants);

    // Select another category if selected was wiped
    if (selectedCatId === catId) {
      const remaining = categories.filter(c => c.id !== catId);
      if (remaining.length > 0) {
        setSelectedCatId(remaining[0].id);
      } else {
        setSelectedCatId('');
      }
    }

    showToast(`Đã xóa danh mục "${name}" thành công.`);
  };

  // --- MENU ITEM FORM TRIGGERS ---
  const handleOpenAddMenuItem = () => {
    if (!selectedCategoryName) {
      showToast('Hãy tạo ít nhất một danh mục trước khi thêm món!', 'error');
      return;
    }
    setActiveItem('new');
    setItemName('');
    setItemDesc('');
    setItemImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');
    setItemPrice(35000);
    setItemOriginalPrice('');
    setItemIsAvailable(true);
    setItemIsFeatured(false);
    setItemDisplayOrder(filteredMenuItems.length + 1);
    setItemOptions([]);
    setSelectedItemFile(null);
    setItemPreviewUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');
  };

  const handleOpenEditMenuItem = (item: MenuItem) => {
    setActiveItem(item);
    setItemName(item.name);
    setItemDesc(item.description || '');
    setItemImageUrl(item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');
    setItemPrice(item.price);
    
    // Setup file preview and raw file selection if already set
    const existingFile = itemFiles[item.id] || null;
    setSelectedItemFile(existingFile);
    setItemPreviewUrl(item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');

    // Find options inside our local MenuItem properties
    const mappedOpts: OptionDTO[] = (item as any).options || [];
    setItemOptions(mappedOpts);

    // Look for tags or prices
    const popularState = item.isPopular;
    setItemIsFeatured(popularState);
    setItemIsAvailable((item as any).isAvailable !== false);
    setItemDisplayOrder((item as any).displayOrder || 1);
    setItemOriginalPrice((item as any).originalPrice || '');
  };

  // --- ITEM OPTION MODIFIERS HANDLERS ---
  const handleAddOptionRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optOptionName.trim()) {
      showToast('Tên lựa chọn không để trống!', 'error');
      return;
    }

    const newOption: OptionDTO = {
      groupName: optGroupName.trim() || 'Lựa chọn',
      optionName: optOptionName.trim(),
      extraPrice: Number(optExtraPrice) || 0,
      isDefault: optIsDefault
    };

    // If marked default, toggle other options in same groupName to non-default
    let updatedOpts = [...itemOptions];
    if (newOption.isDefault) {
      updatedOpts = updatedOpts.map(o => {
        if (o.groupName.toLowerCase() === newOption.groupName.toLowerCase()) {
          return { ...o, isDefault: false };
        }
        return o;
      });
    }

    setItemOptions([...updatedOpts, newOption]);
    setOptOptionName('');
    setOptExtraPrice(0);
    setOptIsDefault(false);
    showToast(`Đã đính kèm tùy chọn "${newOption.optionName}"`);
  };

  const handleRemoveOptionRow = (index: number) => {
    setItemOptions(prev => prev.filter((_, idx) => idx !== index));
    showToast('Đã gỡ bỏ tùy chọn khỏi khay chế biến.');
  };

  // --- SAVE MENU ITEM (LOCAL ONLY) ---
  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !selectedCategoryName) return;

    const itemId = activeItem === 'new' ? `m-custom-${Date.now()}` : (activeItem as MenuItem).id;

    // Use current preview URL as a temporary imageUrl so it renders properly in lists
    const finalImageUrl = itemPreviewUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';

    // Construct local standard MenuItem representation matching global types
    const savedLocalItem: MenuItem = {
      id: itemId,
      name: itemName.trim(),
      description: itemDesc.trim(),
      price: Number(itemPrice),
      imageUrl: finalImageUrl,
      category: selectedCategoryName,
      isPopular: itemIsFeatured
    };
    
    // Store custom DTO attributes options inside local MenuItem
    (savedLocalItem as any).options = itemOptions;
    (savedLocalItem as any).originalPrice = itemOriginalPrice ? Number(itemOriginalPrice) : null;
    (savedLocalItem as any).isAvailable = itemIsAvailable;
    (savedLocalItem as any).displayOrder = Number(itemDisplayOrder) || 1;

    // Cache raw file if chosen
    if (selectedItemFile) {
      setItemFiles(prev => ({ ...prev, [itemId]: selectedItemFile }));
    }

    let updatedMenu: MenuItem[] = [];
    if (activeItem === 'new') {
      updatedMenu = [savedLocalItem, ...restaurant.menu];
      showToast(`Đã thêm món mới "${itemName}" thành công!`);
    } else {
      updatedMenu = restaurant.menu.map(m => {
        if (m.id === itemId) {
          return savedLocalItem;
        }
        return m;
      });
      showToast(`Đã lưu thay đổi món "${itemName}" thành công!`);
    }

    // Sync active menu with restaurant context list
    const updatedRestaurants = allRestaurants.map(r => {
      if (r.id === restaurant.id) {
        // If the broad tags "categories" array doesn't list the category, append it
        const currentTags = r.categories.includes(selectedCategoryName) 
          ? r.categories 
          : [...r.categories, selectedCategoryName];
        return { ...r, menu: updatedMenu, categories: currentTags };
      }
      return r;
    });

    setRestaurants(updatedRestaurants);
    setActiveItem(null);
    setSelectedItemFile(null);
  };

  const handleDeleteMenuItem = (itemId: string, name: string) => {
    if (!confirm(`Bạn muốn xóa món "${name}" khỏi bếp?`)) return;

    // Remove file if any
    setItemFiles(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });

    const updatedMenu = restaurant.menu.filter(m => m.id !== itemId);
    const updatedRestaurants = allRestaurants.map(r => {
      if (r.id === restaurant.id) {
        return { ...r, menu: updatedMenu };
      }
      return r;
    });

    setRestaurants(updatedRestaurants);
    showToast(`Đã gỡ bỏ "${name}" khỏi bếp.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs font-sans text-gray-800">
      
      <div className="bg-white rounded-3xl w-[96vw] max-w-7xl h-[92vh] flex flex-col shadow-2xl border border-gray-150 relative overflow-hidden">
        
        {/* Modal toast and progress notifications */}
        {toastMsg && (
          <div className={`absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full text-[11px] font-black z-100 flex items-center gap-1.5 shadow-md border animate-bounce ${
            toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <Check className="w-3.5 h-3.5" />
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Modal Header banner */}
        <header className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-gray-55 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black text-gray-950 uppercase tracking-wider">Quản Lý Thực Đơn Nhà Hàng</h1>
              <p className="text-[10px] text-gray-400 font-medium">Đối tác: {restaurant.name} | Giao diện quản lý thực đơn chuyên nghiệp</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmitCollectiveData}
              disabled={isLoading}
              type="button"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-950/10 active:scale-95 hover:shadow-md"
              title="Đồng bộ toàn bộ danh mục, món ăn, topping của đối tác lên máy chủ"
            >
              <CloudUpload className="w-4 h-4 shrink-0 text-emerald-100" />
              <span>{isLoading ? 'Đang gửi...' : 'Đồng bộ lên máy chủ'}</span>
            </button>

            <button 
              onClick={onClose}
              type="button"
              className="p-2 text-gray-450 hover:text-gray-750 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Modal body layout split horizontally in exactly 3 sections */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-200 overflow-hidden">
          
          {/* SECTION 1: Categories (width 25% - col-span-3) */}
          <div className="md:col-span-3 flex flex-col h-full overflow-hidden bg-slate-50/50">
            <div className="p-4 border-b border-gray-150 flex justify-between items-center bg-white shrink-0">
              <h2 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">1. Danh Mục Món Ăn</h2>
              <button
                onClick={() => setIsAddingCat(!isAddingCat)}
                className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 cursor-pointer text-[10px] font-black flex items-center gap-1 uppercase transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm</span>
              </button>
            </div>

            {/* Quick adding category input inline */}
            {isAddingCat && (
              <form onSubmit={handleAddCategory} className="p-3 bg-white border-b border-gray-200 animate-fade-in text-xs space-y-2 shrink-0">
                <input
                  type="text"
                  placeholder="Tên danh mục mới..."
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-medium"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Sắp xếp"
                    min="1"
                    value={newCatOrder}
                    onChange={(e) => setNewCatOrder(Number(e.target.value))}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg p-2 font-mono font-bold"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-lg text-[10px] uppercase cursor-pointer"
                  >
                    Tạo Danh Mục
                  </button>
                </div>
              </form>
            )}

            {/* Categories scrollable list container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {categories.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 italic font-medium">Chưa có danh mục nào</div>
              ) : (
                categories
                  .sort((a,b) => a.displayOrder - b.displayOrder)
                  .map((cat) => {
                    const isActive = cat.id === selectedCatId;
                    const isEditing = cat.id === editingCatId;
                    
                    return (
                      <div
                        key={cat.id}
                        className={`group p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          isActive 
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 font-bold' 
                            : 'hover:bg-gray-100 text-gray-700 font-semibold'
                        }`}
                        onClick={() => {
                          if (!isEditing) {
                            setSelectedCatId(cat.id);
                            setActiveItem(null); // Clear item focus on select change
                          }
                        }}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1 w-full text-xs text-slate-900" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="bg-white border rounded p-1 w-24 text-[11px] font-bold"
                            />
                            <input
                              type="number"
                              value={editingCatOrder}
                              onChange={(e) => setEditingCatOrder(Number(e.target.value))}
                              className="bg-white border rounded p-1 w-10 text-[11px] font-mono font-bold"
                            />
                            <button
                              onClick={() => handleSaveEditCategory(cat.id)}
                              className="p-1 bg-emerald-100 hover:bg-emerald-200 rounded text-emerald-800"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingCatId(null)}
                              className="p-1 bg-gray-200 rounded text-gray-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0 text-left">
                              <span className="font-mono text-[9px] opacity-60">#{cat.displayOrder}</span>
                              <span className="truncate text-xs">{cat.name}</span>
                            </div>

                            <div className="hidden group-hover:flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleStartEditCategory(cat)}
                                className={`p-1.5 rounded-lg hover:bg-white cursor-pointer ${
                                  isActive ? 'text-orange-400' : 'text-gray-400 hover:text-gray-700'
                                }`}
                                title="Sửa danh mục"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                                title="Xóa danh mục"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* SECTION 2: Menu Items (width 33% - col-span-4) */}
          <div className="md:col-span-4 flex flex-col h-full overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-150 flex justify-between items-center bg-gray-50/20 shrink-0">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">2. Món Ăn Áp Dụng</span>
                <h3 className="text-xs font-black text-slate-900 truncate max-w-[180px]">
                  {selectedCategoryName || 'Chọn một Category'}
                </h3>
              </div>

              {selectedCategoryName && (
                <button
                  type="button"
                  onClick={handleOpenAddMenuItem}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Món</span>
                </button>
              )}
            </div>

            {/* Menu items scrollable list container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredMenuItems.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-400 italic px-4">
                  Chưa có món nào thuộc danh mục này. Hãy bấm "Thêm Món" để tiến hành cập nhật.
                </div>
              ) : (
                filteredMenuItems.map((item) => {
                  const isItemSelected = typeof activeItem === 'object' && activeItem !== null && activeItem.id === item.id;
                  const optionsLength = (item as any).options?.length || 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                        isItemSelected
                          ? 'bg-orange-50/50 border-orange-300 shadow-xs'
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-2xs'
                      }`}
                      onClick={() => handleOpenEditMenuItem(item)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl border shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 text-left">
                          <h4 className="text-xs font-extrabold text-gray-950 truncate">{item.name}</h4>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.description || 'Chưa có mô tả'}</p>
                          
                          {/* Option Count tags */}
                          <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                            <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                              {item.price.toLocaleString('vi-VN')} đ
                            </span>
                            {optionsLength > 0 && (
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-semibold px-1.5 py-0.5 rounded-sm">
                                📎 {optionsLength} options
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditMenuItem(item)}
                          className="p-1.5 rounded-lg text-gray-450 hover:bg-gray-100 hover:text-gray-700"
                          title="Chỉnh sửa chi tiết"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id, item.name)}
                          className="p-1.5 rounded-lg text-gray-450 hover:bg-red-50 hover:text-red-650"
                          title="Xóa món"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 3: Detailed Form & options (width 42% - col-span-5) */}
          <div className="md:col-span-5 flex flex-col h-full overflow-hidden bg-slate-50/20">
            {activeItem ? (
              <form onSubmit={handleSaveMenuItem} className="flex flex-col h-full overflow-hidden">
                
                {/* Scrollable form body container */}
                <div className="flex-1 overflow-y-auto p-5 text-left space-y-5 text-xs text-gray-600">
                  
                  <div className="pb-3 border-b border-gray-150 flex justify-between items-center shrink-0">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-black tracking-wide text-orange-600 block">
                        3. Chi Tiết Món Ăn & Tùy Chọn
                      </span>
                      <h3 className="text-sm font-black text-gray-950 leading-none mt-1">
                        {activeItem === 'new' ? 'Giao diện Thêm Món mới' : `Hiệu chỉnh: ${itemName}`}
                      </h3>
                    </div>
                  </div>

                  {/* SECTION 3.1: MenuItem details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-700" />
                      <span>Thông tin món ăn cơ bản</span>
                    </h4>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-455 uppercase">Tên món ăn *</label>
                      <input
                        type="text"
                        required
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Ví dụ: Phở bò tái nạm đặc biệt"
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 font-bold outline-hidden focus:ring-1 focus:ring-orange-500 text-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-455 uppercase">Giá bán (đ) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={itemPrice}
                          onChange={(e) => setItemPrice(Number(e.target.value))}
                          placeholder="35000"
                          className="w-full bg-white border border-gray-200 rounded-lg p-2.5 font-bold font-mono text-orange-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-455 uppercase">Giá gốc (Nếu đang Sale)</label>
                        <input
                          type="number"
                          min="0"
                          value={itemOriginalPrice}
                          onChange={(e) => setItemOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Chưa giảm"
                          className="w-full bg-white border border-gray-200 rounded-lg p-2.5 font-mono text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-455 uppercase">Mô tả tóm tắt món ăn</label>
                      <textarea
                        value={itemDesc}
                        onChange={(e) => setItemDesc(e.target.value)}
                        placeholder="Thơm ngon nóng hổi, thịt thà đầy ắp..."
                        rows={2}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 font-medium resize-none text-gray-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-455 uppercase">Tải ảnh món ăn</label>
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            if (!file.type.startsWith('image/')) {
                              showToast('Chỉ chấp nhận các tệp tin có định dạng hình ảnh!', 'error');
                              return;
                            }
                            if (file.size > 10485760) {
                              showToast('Kích thước tệp tin không được vượt quá 10MB (10,485,760 bytes)!', 'error');
                              return;
                            }
                            setSelectedItemFile(file);
                            const localPreview = URL.createObjectURL(file);
                            setItemPreviewUrl(localPreview);
                          }
                        }}
                        className="border border-dashed border-gray-200 hover:border-orange-500 rounded-xl p-4 text-center cursor-pointer bg-gray-50/50 hover:bg-orange-50/5 transition-all relative group flex flex-col items-center justify-center min-h-[110px]"
                        onClick={() => {
                          document.getElementById('menu-item-file-input')?.click();
                        }}
                      >
                        <input 
                          id="menu-item-file-input"
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
                              if (file.size > 10485760) {
                                showToast('Kích thước tệp tin không được vượt quá 10MB (10,485,760 bytes)!', 'error');
                                return;
                              }
                              setSelectedItemFile(file);
                              const localPreview = URL.createObjectURL(file);
                              setItemPreviewUrl(localPreview);
                            }
                          }}
                        />
                        
                        {itemPreviewUrl ? (
                          <div className="relative w-full h-24 rounded-lg overflow-hidden shadow-inner group/preview border border-gray-200 animate-fade-in">
                            <img 
                              src={itemPreviewUrl} 
                              alt="Item Preview" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover/preview:scale-102 transition-all duration-350"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                              <p className="text-[9px] text-white font-black uppercase tracking-wider bg-orange-600 px-2 py-1 rounded-md shadow-md animate-scale-up">Chọn ảnh khác</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="w-8 h-8 bg-orange-100/60 text-orange-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                              <Image className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-700">Kéo & thả ảnh vào đây hoặc nhấp để chọn</p>
                              <p className="text-[8px] text-gray-405">Hỗ trợ JPEG, PNG, WEBP, GIF</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-455 uppercase">Số Order (Thứ tự hiển thị)</label>
                      <input
                        type="number"
                        value={itemDisplayOrder}
                        onChange={(e) => setItemDisplayOrder(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 font-mono font-bold text-gray-900 focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-1.5 font-bold text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={itemIsAvailable}
                          onChange={(e) => setItemIsAvailable(e.target.checked)}
                          className="accent-emerald-600 h-4 w-4 cursor-pointer"
                        />
                        <span>Hiện có bán (isAvailable)</span>
                      </label>
                      <label className="flex items-center gap-1.5 font-bold text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={itemIsFeatured}
                          onChange={(e) => setItemIsFeatured(e.target.checked)}
                          className="accent-amber-500 h-4 w-4 cursor-pointer"
                        />
                        <span>Nổi bật (isFeatured ⭐)</span>
                      </label>
                    </div>
                  </div>

                  {/* SECTION 3.2: MenuItemOption details nested (Master-Detail) */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Grid className="w-3.5 h-3.5 text-orange-600" />
                      <span>Các tùy chọn đi kèm (Toppings, Kích cỡ...)</span>
                    </h4>

                    {/* Adding option card box */}
                    <div className="p-3 bg-white rounded-xl border border-orange-100 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] font-black text-gray-450 uppercase block">Nhóm *</label>
                          <select
                            value={optGroupName}
                            onChange={(e) => setOptGroupName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-black text-slate-800 text-[11px]"
                          >
                            <option value="Size">Size (Kích thước)</option>
                            <option value="Topping">Topping (Thêm kèm)</option>
                            <option value="Sốt">Sốt (Sauce)</option>
                            <option value="Đường">Đường (Sugar)</option>
                            <option value="Đá">Đá (Ice Level)</option>
                          </select>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[9px] font-black text-gray-455 uppercase block">Lọc Gọi *</label>
                          <input
                            type="text"
                            placeholder="vd: Siêu cay, Extra Phô mai"
                            value={optOptionName}
                            onChange={(e) => setOptOptionName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-extrabold text-slate-850 text-[11px]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="space-y-1 text-left flex-1">
                          <label className="text-[9px] font-black text-gray-450 uppercase block">Phụ phí (đ)</label>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={optExtraPrice}
                            onChange={(e) => setOptExtraPrice(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-mono font-bold text-[11px]"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 select-none py-2 shrink-0">
                          <input
                            type="checkbox"
                            id="modal_opt_df"
                            checked={optIsDefault}
                            onChange={(e) => setOptIsDefault(e.target.checked)}
                            className="accent-slate-900 h-4 w-4 cursor-pointer"
                          />
                          <label htmlFor="modal_opt_df" className="text-[10px] font-bold text-gray-500 cursor-pointer">Mặc định</label>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddOptionRow}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-[10px] uppercase font-black cursor-pointer transition-colors"
                        >
                          Thêm option
                        </button>
                      </div>
                    </div>

                    {/* Mapped options lists */}
                    {itemOptions.length === 0 ? (
                      <p className="p-3 bg-gray-50 rounded-xl text-center text-gray-400 italic scale-95 border border-dashed border-gray-200">
                        Chưa đính kèm các tùy chọn phụ phí cho món này.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {itemOptions.map((opt, index) => (
                          <div 
                            key={index} 
                            className="bg-gray-50 p-2 border border-gray-150 rounded-lg flex items-center justify-between text-[11px] font-medium"
                          >
                            <div className="text-left">
                              <span className="bg-orange-100 text-orange-850 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide mr-1.5">
                                {opt.groupName}
                              </span>
                              <b className="text-slate-900 font-bold">{opt.optionName}</b>
                              {opt.extraPrice > 0 && (
                                <span className="text-orange-600 font-bold ml-1.5">+{opt.extraPrice.toLocaleString('vi-VN')} đ</span>
                              )}
                              {opt.isDefault && (
                                <span className="bg-slate-950 text-white font-mono text-[8px] px-1.5 py-0.5 rounded-xs ml-1.5 uppercase font-bold">Default</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionRow(index)}
                              className="text-gray-400 hover:text-red-650 p-1 rounded-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Sticky layout Form Footer buttons */}
                <div className="p-4 border-t border-gray-250 bg-gray-50 shrink-0 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-650 rounded-xl uppercase tracking-wider font-extrabold cursor-pointer text-[10px]"
                  >
                    Hủy và đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl uppercase tracking-wider font-black flex items-center gap-1.5 shadow-md shadow-orange-950/10 cursor-pointer text-[10px]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{activeItem === 'new' ? 'Lưu món mới' : 'Cập nhật món ăn'}</span>
                  </button>
                </div>

              </form>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/10">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                  <Grid className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-black text-slate-900">3. Chi tiết món ăn</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Hãy chọn một món ăn bất kỳ ở danh sách cột bên hoặc nhấn "Thêm Món" để cập nhật hình ảnh, thông số mô tả và các lựa chọn đi kèm.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* POLISHED SUCCESS STATE AND DETAILED JSON COLLAPAPSIBLE DISCLOSURE */}
        {showPayloadPreview && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-110 flex items-center justify-center p-6 animate-fade-in text-slate-100">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl relative text-left overflow-hidden">
              
              <button 
                onClick={() => setShowPayloadPreview(false)}
                className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-all cursor-pointer z-50"
                title="Đóng thông báo"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success Info block */}
              <div className="p-8 text-center shrink-0 border-b border-slate-800 bg-slate-900">
                <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-800/40 shadow-lg shadow-emerald-950/30">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Đồng Bộ Thực Đơn Thành Công!</h3>
                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                  Toàn bộ danh mục món ăn và danh sách món kèm theo các tùy chọn nguyên tử đã được đóng gói và gửi lên hệ thống máy chủ của bạn thành công.
                </p>

                {/* Technical status tags */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                    🟢 API Endpoint: <span className="bg-emerald-950 text-emerald-400 font-mono font-bold px-1 rounded">POST /restaurant/add-new-category</span>
                  </span>
                  <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-semibold text-slate-300">
                    Đối tác ID: <span className="text-amber-400 font-mono font-bold">{restaurant.id}</span>
                  </span>
                </div>
              </div>

              {/* Collapsible area for development inspect */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
                <button
                  type="button"
                  onClick={() => setShowJsonDetail(!showJsonDetail)}
                  className="w-full px-6 py-4 flex items-center justify-between text-[11px] font-black uppercase tracking-wider bg-slate-950 text-slate-450 hover:text-white border-b border-slate-900 transition-all cursor-pointer select-none"
                >
                  <span className="flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-indigo-400" />
                    <span>Dữ liệu JSON Gửi Đi ({generatedPayload?.categories?.length || 0} danh mục)</span>
                  </span>
                  <span className="text-xs font-mono font-bold">{showJsonDetail ? '▼ Thu gọn' : '▶ Xem chi tiết payload'}</span>
                </button>

                {showJsonDetail && (
                  <div className="flex-1 p-5 overflow-y-auto font-mono text-[10.5px] leading-relaxed text-emerald-400 select-all border-b border-slate-900">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <span className="text-[10px] text-slate-450 uppercase font-black">JSON Payload content:</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(generatedPayload, null, 2));
                          showToast('Đã copy chuỗi JSON Payload vào Clipboard!');
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-[9px] text-indigo-200 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Sao chép JSON</span>
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-3 rounded-xl border border-slate-900">{JSON.stringify(generatedPayload, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Footing note */}
              <div className="p-4 bg-slate-950 flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-900 shrink-0">
                <span>💡 Bạn có thể cấu hình API nhận body có cấu trúc JSON lồng nhau như trên để cập nhật nguyên tử.</span>
                <button
                  type="button"
                  onClick={() => setShowPayloadPreview(false)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-all uppercase tracking-wider text-[10px]"
                >
                  Hoàn Thành
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
