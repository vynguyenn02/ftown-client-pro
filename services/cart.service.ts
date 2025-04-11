import { AxiosResponse } from "axios";
import { get, post, remove } from "@/utils/axios";
import { CartResponse, CheckoutRequest, CheckoutResponse, Store, AddCartPayload, EditCart } from "@/types";

export const CART_ENDPOINT = {
  GET_CART: "/cart/{accountId}",
  ADD_PRODUCT: "/cart/{accountId}/add",
  CHECKOUT: "/checkout",
  GET_ALL_STORE: "/stores",
  REMOVE_CART_ITEM: "/cart/{accountId}/remove/{productVariantId}",
  EDIT_CART: "/cart/{accountId}/change-quantity",
  REMOVE_ALL_CART_ITEM: "/cart/{accountId}/clear",
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
  editCart(accountId: number, payload: EditCart): Promise<AxiosResponse<CartResponse>> {
    const url = CART_ENDPOINT.EDIT_CART.replace("{accountId}", String(accountId));
    return post(url, payload);
  }
  removeCartItem(accountId: number, productVariantId: number): Promise<AxiosResponse<CartResponse>> {
    const url = CART_ENDPOINT.REMOVE_CART_ITEM.replace("{accountId}", String(accountId)).replace("{productVariantId}", String(productVariantId));
    return remove(url);
  }
  removeAllCartItem(accountId: number): Promise<AxiosResponse<CartResponse>> {
    const url = CART_ENDPOINT.REMOVE_ALL_CART_ITEM.replace("{accountId}", String(accountId));
    return remove(url);
  }

}

const cartService = new CartService();
export default cartService;
