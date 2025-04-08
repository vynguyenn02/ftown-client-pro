import { AxiosResponse } from "axios";
import { get, post } from "@/utils/axios";
import { CartResponse, CheckoutRequest, CheckoutResponse, Store, AddCartPayload } from "@/types";

export const CART_ENDPOINT = {
  GET_CART: "/cart/{accountId}",
  ADD_PRODUCT: "/cart/{accountId}/add",
  CHECKOUT: "/checkout",
  GET_ALL_STORE: "/stores",
};


class CartService {
  // Lấy giỏ hàng
  getCart(accountId: number): Promise<AxiosResponse<CartResponse>> {
    const url = CART_ENDPOINT.GET_CART.replace("{accountId}", String(accountId));
    return get(url);
  }

  // Thêm sản phẩm vào giỏ
  addProductToCart(accountId: number, payload: AddCartPayload): Promise<AxiosResponse<CartResponse>> {
    const url = CART_ENDPOINT.ADD_PRODUCT.replace("{accountId}", String(accountId));
    return post(url, payload);
  }

  // Checkout: Gửi danh sách sản phẩm đã chọn
  checkout(payload: CheckoutRequest): Promise<AxiosResponse<CheckoutResponse>> {
    return post(CART_ENDPOINT.CHECKOUT, payload);
  }
  getAllStores(): Promise<AxiosResponse<Store[]>> {
    return get(CART_ENDPOINT.GET_ALL_STORE);
  }
}

const cartService = new CartService();
export default cartService;
