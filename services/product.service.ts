// product.service.ts
import { AxiosResponse } from "axios";
import { ProductListResponse, ProductDetailResponse, FavoriteProduct, FavoriteProductResponse } from "@/types";
import { get, post, remove } from "@/utils/axios";

export const END_POINT = {
  GET_ALL_PRODUCT: "/products/view-all",   // GET /api/products/view-all?page=1&pageSize=10
  GET_PRODUCT_BYID: "/products/{productId}",
  POST_FAVORITE_PRODUCT: "/favorites/{accountId}/{productId}",
  DELETE_FAVORITE_PRODUCT: "/favorites/{accountId}/{productId}",
  GET_ALL_FAVORITE_PRODUCT: "/favorites/{accountId}"

};

class ProductService {
  // Lấy danh sách sản phẩm (có phân trang)
  getAllProducts(page = 1, pageSize = 30): Promise<AxiosResponse<ProductListResponse>> {
    const url = `${END_POINT.GET_ALL_PRODUCT}?page=${page}&pageSize=${pageSize}`;
    return get(url);
  }

  // Lấy chi tiết sản phẩm theo id
  getProductById(productId: number, accountId?: number): Promise<AxiosResponse<ProductDetailResponse>> {
    let url = END_POINT.GET_PRODUCT_BYID.replace("{productId}", String(productId));
    if (accountId) {
      url += `?accountId=${accountId}`;
    }
    return get(url);
  }
  getAllFavoriteProducts(accountId: number, page = 1, pageSize = 10): Promise<AxiosResponse<FavoriteProductResponse>> {
    const url = END_POINT.GET_ALL_FAVORITE_PRODUCT.replace("{accountId}", String(accountId)) + `?page=${page}&pageSize=${pageSize}`;
    return get(url);
  }
  
  postFavoriteProduct(accountId: number, productId: number): Promise<AxiosResponse<FavoriteProductResponse>> {
    const url = END_POINT.POST_FAVORITE_PRODUCT
      .replace("{accountId}", String(accountId))
      .replace("{productId}", String(productId));
    return post(url);
  }
  deleteFavoriteProduct(accountId: number, productId: number): Promise<AxiosResponse<FavoriteProductResponse>> {
    const url = END_POINT.DELETE_FAVORITE_PRODUCT
      .replace("{accountId}", String(accountId))
      .replace("{productId}", String(productId));
    return remove(url);
  }
}

export default new ProductService();
