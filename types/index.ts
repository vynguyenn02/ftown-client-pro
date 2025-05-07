// types.ts
export type Feedback = {
  feedbackId: number;
  accountId: number;
  productId: number;
  title: string;
  rating: number;
  comment: string;
  createdDate: string;
  imagePath: string;
  orderDetailId: number;
  account: string;
}
export type FeedbackListResponse = {
  data: Feedback[];
  status: boolean;
  message: string;
}
export type Product = {
  productId: number;
  name: string;
  productName: string; // Tên sản phẩm
  imagePath: string;
  price: number;
  discountedPrice: number;
  categoryName: string;
  colors: string[]; // Mảng mã màu
};
export type ProductListResponse = {
  data: Product[];
  status: boolean;
  message: string;
};
export type ProductDetailResponse = {
  data: ProductDetail;
  status: boolean;
  message: string;
};
export type Variant = {
  variantId: number;
  productName: string;
  size: string;
  color: string;
  price: number;
  discountedPrice: number;
  stockQuantity: number | null;
  imagePath: string;
  sku: string;
  barcode: string;
  weight: number;
};
export type AddCartPayload = {
  productId: number;
  size: string;
  color: string;
  quantity: number;
};

export type ProductDetail = {
  productId: number;
  name: string;
  description: string;
  imagePath: string;
  imagePaths: string[];  
  origin: string;
  model: string;
  occasion: string;
  style: string;
  material: string;
  isFavorite: boolean;
  categoryName: string;
  variants: Variant[];
};
export type Store = {
  storeId: string;
  storeName: string;
  storeDescription: string;
  location: string; 
  imagePath: string;
  storeEmail: string;
  storePhone: string;
}

export type ResponseObject<T> = {
  data: T;  // Directly return data as an array of products
  message: string;
  status: number;
};

export type Pagination<T> = {
  items: T[]
  pageCount: number
  pageNo: number
  pageSize: number
  totalCount: number
}

export type Role = {
  roleId: string
  
}

export type RegisterRequest = {
  username: string;
  isActive: boolean; // true
  password: string;
  email: string;
};

export type LoginRequest = {
  email: string
  password: string 
}
export type LoginResponse = {
  username: string
  fullName: string
  
}
// CartItem: mô tả 1 sản phẩm trong giỏ
export type CartItem = {
  productVariantId: number;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  imagePath: string;
  price: number;
  discountedPrice: number;
  // Thêm field này để hỗ trợ UI checkbox (nếu chưa có)
  isSelected?: boolean;
  isValid?: boolean; // Để xác định sản phẩm có hợp lệ hay không
  message?: string; // Thông báo lỗi nếu sản phẩm không hợp lệ
};

// Định nghĩa response khi gọi API getCart
export type CartResponse = {
  data: CartItem[]; // Mảng các sản phẩm trong giỏ hàng
  status: boolean;
  message: string;
};
export type EditCart = {
  productVariantId: number;
  quantityChange: number;
}
export type DateOfBirth = {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
  dayOfYear: number;
  dayNumber: number;
};

export type Profile = {
  accountId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  imagePath?: string;
  createdDate: string;
  lastLoginDate: string;
  isActive: boolean;
  loyaltyPoints: number;
  membershipLevel: string;
  dateOfBirth: string;
  gender: string;
  customerType: string;
  preferredPaymentMethod: string;
};

export type ProfileResponse = {
  data: Profile;
  status: boolean;
  message: string;
};
export type EditProfileRequest = {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  imagePath?: string;
  dateOfBirth: string; // Sẽ gửi dạng "YYYY-MM-DD"
  gender: string;
  customerType: string;
  preferredPaymentMethod: string;
};
export type CreateShippingAddressRequest = {
  accountId: number;
  address: string;
  city: string;
  province: string;
  district: string;
  country: string;
  recipientName: string;
  recipientPhone: string;
  email: string;
  isDefault: boolean;
}
// Nếu backend trả về địa chỉ mới với đầy đủ trường của ShippingAddress
export type CreateShippingAddressResponse = {
  data: ShippingAddress;  // <-- Sửa chỗ này thành ShippingAddress
  status: boolean;
  message: string;
};
export type UpdateShippingAddressRequest = {
  accountId: number;
  address: string;
  city: string;
  province: string;
  district: string;
  country: string;
  recipientName: string;
  recipientPhone: string;
  email: string;
  isDefault: boolean;
}
export type UpdateShippingAddressResponse = {
  data: ShippingAddress;  // <-- Sửa chỗ này thành ShippingAddress
  status: boolean;
  message: string;  
};
export type ShippingAddress = {
  addressId: number
  accountId: number;
  address: string;
  city: string;
  province: string;
  district: string;
  country: string;
  postalCode?: string;
  recipientName: string;
  recipientPhone: string;
  email: string;
  isDefault: boolean;
}
export type GetShippingAddress = {
  data: ShippingAddress[]
  status: boolean;
  message: string;
}

// Response trả về khi edit profile
export type EditProfileResponse = {
  data: {
    success: boolean;
    message: string;
  };
  status: boolean;
  message: string;
};
// Request
export type CheckoutRequest = {
  accountId: number;
  selectedProductVariantIds: number[];
};

// Item trong response "items"
export type CheckoutItem = {
  productVariantId: number;
  productName: string;
  quantity: number;
  imageUrl: string ;
  size: string;
  color: string;
  priceAtPurchase: number;
  discountApplied: number;
};

// Store trong "availableStores"
export type CheckoutStore = {
  storeId: number;
  storeName: string;
  storeDescription: string;
  location: string;
  managerId: number;
  createdDate: string;
  imagePath: string;
  storeEmail: string;
  storePhone: string;
  operatingHours: string;
  // ... tuỳ BE trả về thêm field gì thì bổ sung
};

// Địa chỉ giao hàng (shippingAddresses, shippingAddress)


// Response
export type CheckoutResponse = {
  checkOutSessionId: string;
  subTotal: number;
  shippingCost: number;
  availableStores: CheckoutStore[];
  availablePaymentMethods: string[];
  shippingAddresses: ShippingAddress[];
  shippingAddress: ShippingAddress;
  items: CheckoutItem[];
};
// Định nghĩa type cho request gửi lên backend
export type CreateOrderRequest = {
  accountId: number;
  checkOutSessionId: string;
  shippingAddressId: number;
  paymentMethod: string;
  storeId?: number;
};

// Định nghĩa type cho mỗi sản phẩm (item) trong đơn hàng
export type OrderItem = {
  productVariantId: number;
  productName: string;
  quantity: number;
  imageUrl: string;
  size: string;
  color: string;
  priceAtPurchase: number;
  discountApplied: number;
  productId: number; // Thêm trường productId nếu cần thiết
};

// Định nghĩa type cho dữ liệu đơn hàng (order)
export type Order = {
  orderId: number;
  status: string;
  subTotal: number;
  shippingCost: number;
  paymentMethod: string;
  paymentUrl: string;
  storeId: number;
  items: OrderItem[];
  ghnid: string;
};

// Định nghĩa type cho response trả về từ backend
export type CreateOrderResponse = {
  data: Order;
  status: boolean;
  message: string;
};
export type GetOrdersResponse = {
  data: Pagination<Order>;
  status: boolean;
  message: string;
};
// Mỗi item trong orderItems
export type OrderDetailItem = {
  productVariantId: number;
  productName: string;
  quantity: number;
  imageUrl: string;
  size: string;
  color: string;
  priceAtPurchase: number;
  discountApplied: number;
  productId: number; // Thêm trường productId nếu cần thiết
};

// Thông tin store
export type StoreInfo = {
  storeId: number;
  storeName: string;
  storeDescription: string;
  location: string;
  imagePath: string;
  storeEmail: string;
  storePhone: string;
};

// Thông tin chi tiết của 1 order
export type OrderDetailData = {
  orderId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  district: string;
  province: string;
  country: string;
  paymentMethod: string;
  store: StoreInfo | null;    // BE trả về store, có thể là null nếu ko có
  orderTotal: number;
  shippingCost: number;
  status: string;
  createdDate: string;
  orderItems: OrderDetailItem[];
  isFeedback: boolean; // Thêm trường này nếu cần thiết
};

// Response trả về khi gọi GET /orders/{orderId}/details
export type GetOrderDetailResponse = {
  data: OrderDetailData;
  status: boolean;
  message: string;
};
// response cua return-item khi goi GET /return-requests/order-items
export type GetReturnItemResponse = {
  data: ReturnData[];
  status: boolean;
  message: string;

}
export type ReturnData = {
  orderDetailId: number;
  productId: number;
  productVariantId: number;
  productName: string;
  quantity: number;
  imageUrl : string;
  size: string;
  color: string;
  priceAtPurchase: number;
  discountApplied: number;

}
export type ReturnItems = {
  productVariantId: number;
  productName: string;
  color: string;
  size: string;
  imageUrl: string;
  quantity: number;
  price: number;
}
export type RefundMethod = {
  refundMethod: string;
}
export type ReturnReasons = {
  returnReasons: string;
}
export type ReturnOptions = {
  returnOptions: string;
}
export type MediaUrl = {
  mediaUrl: string;
  
}
export type ReturnCheckOut = {
  returnCheckoutSessionId : string;
  orderId: string;
  accountId: string;
  returnItems: ReturnItems[];
  totalRefundAmount: number;
  refundMethods: RefundMethod[];
  returnReasons: ReturnReasons[];
  returnOptions: ReturnOptions [];
  email: string;
  mediaUrl: MediaUrl[];
  returnDescription: string;

}
export type SelectedItems = {
  productVariantId: number;
  quantity: number;
}

// Thêm kiểu cho phản hồi của API checkoutReturn
export type ReturnCheckOutResponse = {
  returnCheckoutSessionId: string;
  orderId: number;
  accountId: number;
  returnItems: {
    productVariantId: number;
    productName: string;
    color: string;
    size: string;
    imageUrl: string;
    quantity: number;
    price: number;
  }[];
  totalRefundAmount: number;
  refundMethods: string[];      // Ví dụ: ["Ngân hàng"]
  returnReasons: string[];      // Ví dụ: ["Sản phẩm bị lỗi", ...]
  returnOptions: string[];      // Ví dụ: ["Đổi hàng", "Hoàn tiền"]
  returnDescription: string;
  mediaUrls: string[];          // Mảng URL ảnh (nếu có)
  email: string;
};

// Kiểu cho request trả về BE
export type CreateCheckoutRequest = {
  orderId: string;
  accountId: number;
  selectedItems: {
    productVariantId: number;
    quantity?: number;
  }[];
};

export type SubmitReturnRequest = { 
  returnCheckoutSessionId: string;
  email: string;
  returnReason: string;
  returnOption: string;
  refundMethod?: string;
  returnDescription?: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  mediaFiles: File[];  
};


export type SubmitReturnResponse = {
  data: {
    returnOrderId: number;
    status: string; 
  };
  status: boolean;
  message: string;
};

// Giả sử kiểu CreateFeedbackRequest của bạn như sau:
export type CreateFeedbackRequest = {
  orderDetailId?: number;   // vì int? bên C#
  accountId: number;        // int bên C#
  productId: number;        // int bên C#
  Title?: string;           // string? bên C#
  rating?: number;          // int? bên C#
  comment?: string;         // string? bên C#
  createdDate?: string;     // DateTime? => gửi chuỗi ISO
  imageFile?: string;       // string? bên C#
};

export type CreateFeedbackResponse = {
  data: {
    feedbackId: number;
    status: string; // ví dụ: "Created"
  };
  status: boolean;
  message: string;
};

export type FavoriteProduct = {
  productId: number;
  name: string;
  imagePath: string;
  price: number;
  discountedPrice: number;
  categoryName: string;
  promotionTitle: string;
  isFavorite: boolean;
};
export type FavoriteProductResponse = {
  data: FavoriteProduct[];
  status: boolean;
  message: string;
};
export type NotificationItem = {
  notificationId: number;
  title: string;
  content: string;
  isRead: boolean;
  createdDate: string;
}
export type NotificationResponse = {
  data: NotificationItem[];
  status: boolean;
  message: string;
}

export type ConfirmReceive = {
  status: boolean;
  message: string;
}

// export type GoogleLoginResponse = {
//   token: string;
//   account: {
//     accountId: number;
//     fullName: string;
//     email?: string;
//     createdDate?: string | null;
//     lastLoginDate?: string | null;
//   };
//   // nếu BE có trả thêm message hay status, bạn cũng có thể thêm vào
//   status?: boolean;
//   message?: string;
// }
export type GoogleLoginResponse = {
  data: {
    token: string;
    account: {
      accountId: number;
      fullName: string;
      email?: string;
      createdDate?: string | null;
      lastLoginDate?: string | null;
    };
    errors: any[];
    success: boolean;
  };
  status: boolean;
  message: string;
}
export type GoogleLoginRequest = {
  idToken: string;
};

export type GHNRequest = {
  order_code: string;
}
export type GHNResponse = {
  status: string;
  updateDate: string;
};
export type PreferredStyle = {
  styleId: number;
  styleName: string;
  isSelected: boolean;
}
export type GetPrefferResponse = {
  data: PreferredStyle[];
  status: boolean;
  message: string;
}