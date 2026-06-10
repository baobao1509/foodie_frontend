import { Restaurant } from "./types";

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Phở Gia Truyền Hải Nam",
    slug: "pho-gia-truyen-hai-nam",
    coverImageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80",
    address: "229 Nguyễn Công Trứ, Phường Nguyễn Thái Bình",
    city: "Hồ Chí Minh",
    district: "Quận 1",
    deliveryFee: 15000,
    rating: 4.8,
    totalReviews: 312,
    minOrderValue: 50000,
    openingTime: "06:00",
    closingTime: "22:00",
    isOpen: true,
    categories: ["Phở", "Món Nước"],
    estimatedTime: "20-30 phút",
    menu: [
      {
        id: "m1-1",
        name: "Phở Tái Lăn",
        description: "Bánh phở tươi, thịt bò xào sém với tỏi gừng nóng hổi, chan nước dùng béo ngọt thơm ngậy hương gừng hành.",
        price: 65000,
        imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80",
        category: "Phở Bò Đặc Biệt",
        isPopular: true,
        rating: 4.9
      },
      {
        id: "m1-2",
        name: "Phở Bờ Nạm Gầu",
        description: "Thịt nạm mềm xen kẽ gầu giòn thơm ngậy, kết hợp nước dùng bò hầm bí truyền trong 18 giờ.",
        price: 55000,
        imageUrl: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80",
        category: "Phở Bò Đặc Biệt",
        isPopular: true,
        rating: 4.8
      },
      {
        id: "m1-3",
        name: "Phở Gà Ta Cần trứng non",
        description: "Thịt đùi gà ta xé phay giòn da dẻo ngọt, kèm trứng non vàng óng, nước dùng gà thanh mát ngọt dịu.",
        price: 70000,
        imageUrl: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&q=80",
        category: "Món Khác",
        isPopular: false,
        rating: 4.7
      },
      {
        id: "m1-4",
        name: "Quẩy Giòn Sực",
        description: "Bánh quẩy chiên giòn tan, phụ kiện không thể thiếu khi thưởng thức phở nóng.",
        price: 10000,
        imageUrl: "https://images.unsplash.com/photo-1619531006509-009ab53f7abf?w=400&q=80",
        category: "Món Ăn Kèm",
        isPopular: false
      },
      {
        id: "m1-5",
        name: "Trà Đá Sâm dứa",
        description: "Hương vị sâm dứa thơm mát giải nhiệt cực đã mát sảng khoái.",
        price: 5000,
        imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
        category: "Đồ Uống",
        isPopular: false
      }
    ]
  },
  {
    id: "2",
    name: "Cơm Tấm Thuận Kiều",
    slug: "com-tam-thuan-kieu",
    coverImageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80",
    address: "54 Thuận Kiều, Phường 4",
    city: "Hồ Chí Minh",
    district: "Quận 11",
    deliveryFee: 18000,
    rating: 4.7,
    totalReviews: 541,
    minOrderValue: 45000,
    openingTime: "06:00",
    closingTime: "21:30",
    isOpen: true,
    categories: ["Cơm", "Cơm tấm"],
    estimatedTime: "15-25 phút",
    menu: [
      {
        id: "m2-1",
        name: "Cơm Tấm Sườn Bì Chả Trứng",
        description: "Sườn cốt lết dày dặn nướng mật ong sém cạnh, bì heo trộn thính thơm giòn cùng chả chưng trứng vàng ươm chuẩn vị Sài Gòn.",
        price: 58000,
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80",
        category: "Cơm Tấm Truyền Thống",
        isPopular: true,
        rating: 4.9
      },
      {
        id: "m2-2",
        name: "Cơm Tấm Đùi Gà Nướng Ngũ Vị",
        description: "Đùi gà bự chảng tẩm ướp ngũ vị thơm lừng, nướng mật ong da vàng giòn dai dẻo thịt.",
        price: 55000,
        imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80",
        category: "Món Cơm Khác",
        isPopular: true,
        rating: 4.6
      },
      {
        id: "m2-3",
        name: "Cơm Tấm Sườn Non Cây Khổng Lồ",
        description: "Cọng sườn heo nướng mật mong khổng lồ giòn sần sật mọng nước ngon tột bực.",
        price: 85000,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",
        category: "Đặc Sản Thuận Kiều",
        isPopular: true,
        rating: 4.9
      },
      {
        id: "m2-4",
        name: "Canh Khổ Qua Nhồi Thịt",
        description: "Trái khổ quả nhồi thịt băm mộc nhĩ nấm hương thanh mát, đắng nhẹ hậu ngọt giải độc.",
        price: 15000,
        imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
        category: "Canh Kèm",
        isPopular: false
      },
      {
        id: "m2-5",
        name: "Coca-Cola Lon",
        description: "Nước ngọt có gas mát lạnh làm sảng khoái bữa ăn cơm tấm.",
        price: 15000,
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
        category: "Đồ Uống",
        isPopular: false
      }
    ]
  },
  {
    id: "3",
    name: "Bún Chả Hà Nội - Vườn Hoa",
    slug: "bun-cha-ha-noi-vuon-hoa",
    coverImageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&auto=format&fit=crop&q=80",
    address: "18 Lê Thánh Tôn, Bến Nghé",
    city: "Hồ Chí Minh",
    district: "Quận 1",
    deliveryFee: 20000,
    rating: 4.6,
    totalReviews: 189,
    minOrderValue: 40000,
    openingTime: "09:00",
    closingTime: "21:00",
    isOpen: true,
    categories: ["Bún", "Bún chả"],
    estimatedTime: "25-35 phút",
    menu: [
      {
        id: "m3-1",
        name: "Suất Bún Chả Đầy Đủ",
        description: "Bún chả nướng than thơm phức, chả miếng dẻo béo và chả viên ngậy nước nương kèm nộm đu đủ xanh sần sật, chấm nước mắm dấm ớt chua ngọt ấm nóng, rổ rau sống bánh tẻ mơn mởn.",
        price: 55000,
        imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80",
        category: "Món Chính",
        isPopular: true,
        rating: 4.8
      },
      {
        id: "m3-2",
        name: "Nem Hải Sản Chiên Xù (2 cái)",
        description: "Vỏ ngoài giòn tan xù bông, bên trong đẫm hải sản bề bề, tôm thịt hòa quyện cùng sốt mayonnaise béo thơm.",
        price: 25000,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",
        category: "Món Ăn Kèm",
        isPopular: true,
        rating: 4.7
      },
      {
        id: "m3-3",
        name: "Nước Sấu Đá Hà Nội",
        description: "Quả sấu dâm đường ngòn ngọt chua dịu cực chuẩn vị phố cổ Hà Nội cực đã giải nhiệt.",
        price: 18000,
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80",
        category: "Đồ Uống",
        isPopular: false
      }
    ]
  },
  {
    id: "4",
    name: "Lẩu Thái Suk Suk - Phan Xích Long",
    slug: "lau-thai-suk-suk",
    coverImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
    address: "208 Phan Xích Long, Phường 2",
    city: "Hồ Chí Minh",
    district: "Phú Nhuận",
    deliveryFee: 25000,
    rating: 4.9,
    totalReviews: 145,
    minOrderValue: 200000,
    openingTime: "11:00",
    closingTime: "22:00",
    isOpen: true,
    categories: ["Lẩu", "Hải sản"],
    estimatedTime: "35-50 phút",
    menu: [
      {
        id: "m4-1",
        name: "Combo Lẩu Thái Tomyum Hải Sản",
        description: "Nước lẩu Thái Tomyum chua cay đậm đà dậy mùi cốt dừa sả chanh. Gồm khay mực nút, tôm sú, bò viên, bò ba chỉ mỹ, nấm và rau lẩu ăn kèm thả ga cho 2-3 người.",
        price: 289000,
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
        category: "Combo Lẩu",
        isPopular: true,
        rating: 4.9
      },
      {
        id: "m4-2",
        name: "Khay Thịt Ba Chỉ Mỹ Thêm (150g)",
        description: "Thịt ba chỉ bò Mỹ béo mềm thơm lừng khi nhúng nước lẩu Tomyum chua cay sực sực.",
        price: 79000,
        imageUrl: "https://images.unsplash.com/photo-1553163147-622ab57b6874?w=400&q=80",
        category: "Nhúng Lẩu Thêm",
        isPopular: false,
        rating: 4.5
      },
      {
        id: "m4-3",
        name: "Mực Trứng Sữa Tươi Nhúng Thêm",
        description: "Khay 150g mực sữa nhỏ nhỏ xinh xinh tươi rói sần sật béo ngậy trứng chấm muối ớt xanh cực phẩm.",
        price: 95000,
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80",
        category: "Nhúng Lẩu Thêm",
        isPopular: false
      }
    ]
  },
  {
    id: "5",
    name: "Bánh Mì Huỳnh Hoa Sài Gòn",
    slug: "banh-mi-huynh-hoa",
    coverImageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80",
    address: "26 Lê Thị Riêng, Phường Phạm Ngũ Lão",
    city: "Hồ Chí Minh",
    district: "Quận 1",
    deliveryFee: 15000,
    rating: 4.8,
    totalReviews: 2405,
    minOrderValue: 40000,
    openingTime: "11:00",
    closingTime: "22:00",
    isOpen: true,
    categories: ["Bánh mì", "Ăn vặt"],
    estimatedTime: "15-25 phút",
    menu: [
      {
        id: "m5-1",
        name: "Bánh Mì Ô Đê Đầy Đủ Giò Chả Pate",
        description: "Chiếc bánh mì siêu to nặng gần nửa kí trứ danh Sài Gòn. Ruột bánh giòn dày rải xấp bơ vàng láng bóng, pate gan béo bùi tột bậc, xếp lớp chả lụa chả quế, giò thủ, chà bông xốp mềm cùng đồ chua muối cay nồng.",
        price: 58000,
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=80",
        category: "Bánh Mì Trứ Danh",
        isPopular: true,
        rating: 4.9
      },
      {
        id: "m5-2",
        name: "Hộp Bơ & Pate Thêm Huỳnh Hoa (150g)",
        description: "Phần bơ dẻo ngậy cùng hũ pate gan hầm gia truyền cực ngon sành điệu ăn kèm bánh mì phết đã đời.",
        price: 45000,
        imageUrl: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80",
        category: "Đồ Bán Thêm",
        isPopular: false,
        rating: 4.7
      }
    ]
  },
  {
    id: "6",
    name: "Pizza 4P's - Võ Văn Tần",
    slug: "pizza-4ps-vo-van-tan",
    coverImageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    address: "150 Võ Văn Tần, Phường 6",
    city: "Hồ Chí Minh",
    district: "Quận 3",
    deliveryFee: 25000,
    rating: 4.8,
    totalReviews: 1250,
    minOrderValue: 150000,
    openingTime: "10:30",
    closingTime: "22:00",
    isOpen: true,
    categories: ["Pizza", "Món Tây"],
    estimatedTime: "25-40 phút",
    menu: [
      {
        id: "m6-1",
        name: "Pizza Phô Mai Burrata Và Giăm Bông Parma",
        description: "Pizza nướng lò củi kiểu Napoli kinh điển, rải lớp phô mai Burrata tươi mềm béo ngậy chính giữa, xé rải thịt heo muối Parma giăm bông mằn mặn thượng hạng xắt mỏng.",
        price: 250000,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
        category: "Signature Pizza",
        isPopular: true,
        rating: 4.9
      },
      {
        id: "m6-2",
        name: "Mỳ Ý Cua Sốt Kem Cà Chua",
        description: "Sợi mì Ý dẻo giòn Al Dente quyện đẫm sốt trứng cua kem béo cà chua chua nhẹ gợn tơi thịt cua xé giòn tan lôi cuốn khôn cùng.",
        price: 185000,
        imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80",
        category: "Mỳ Ý Ý",
        isPopular: true,
        rating: 4.8
      }
    ]
  }
];

export const CATEGORIES_LIST = [
  { id: "all", label: "Tất cả", icon: "🍽️" },
  { id: "Phở", label: "Phở & Bún bún", icon: "🍜" },
  { id: "Cơm", label: "Cơm tấm", icon: "🍚" },
  { id: "Lẩu", label: "Lẩu nóng hôi hổi", icon: "🫕" },
  { id: "Bánh mì", label: "Bánh mì Việt Nam", icon: "🥖" },
  { id: "Pizza", label: "Pizza & Mỳ Ý", icon: "🍕" },
  { id: "Ăn vặt", label: "Ăn vặt đường phố", icon: "🍢" }
];

export const PROMO_CODES = [
  { code: "FOODIEPROMO", discount: 30000, minOrder: 100000, description: "Giảm 30K cho đơn hàng từ 100K" },
  { code: "FREESHIP", discount: 15000, minOrder: 50000, description: "Ưu đãi phí giao hàng 15K" },
  { code: "ANSANG", discount: 20000, minOrder: 60000, description: "Giảm 20K món ngon ăn sáng" }
];
