// product.service.ts
import { AxiosResponse } from "axios";
import { ProductListResponse, ProductDetailResponse, FavoriteProduct, FavoriteProductResponse, GetPrefferResponse} from "@/types";
import { get, post, remove, put } from "@/utils/axios";
import { GET } from "@/app/api/health/route";

export const END_POINT = {
  GET_ALL_PRODUCT: "/products/view-all",   // GET /api/products/view-all?page=1&pageSize=10
  GET_PRODUCT_BYID: "/products/{productId}",
  POST_FAVORITE_PRODUCT: "/favorites/{accountId}/{productId}",
  DELETE_FAVORITE_PRODUCT: "/favorites/{accountId}/{productId}",
  GET_ALL_FAVORITE_PRODUCT: "/favorites/{accountId}",
  GET_ALL_PRODUCT_BY_CATEGORY: "/products/filter-by-category",
  GET_BEST_SELLER_PRODUCT: "/products/top-selling-products",
  POST_INTERACTION: "/customer/products/interactions",
  GET_SUGGESTION: "/customer/suggestions",
  GET_PREFER_STYLE: "/customer/preferred-styles/{accountId}",
  PUT_PREFER_STYLE: "/customer/preferred-styles/{accountId}",
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
  getAllProductsByCategory(
    categoryName: string,
    page = 1,
    pageSize = 30
  ): Promise<AxiosResponse<ProductListResponse>> {
    // encodeURIComponent để tránh lỗi khi categoryName có dấu hoặc ký tự đặc biệt
    const url = `${END_POINT.GET_ALL_PRODUCT_BY_CATEGORY}?categoryName=${encodeURIComponent(
      categoryName
    )}&page=${page}&pageSize=${pageSize}`;

    return get(url);
  }
  getBestSellerProducts(top: number): Promise<AxiosResponse<ProductListResponse>> {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const url = `${END_POINT.GET_BEST_SELLER_PRODUCT}?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&top=${top}`;
    return get(url);
  }
  getPreferredStyles(accountId: number): Promise<AxiosResponse<GetPrefferResponse>> {
    const url = END_POINT.GET_PREFER_STYLE.replace("{accountId}", String(accountId));
    return get(url);
  }
  updatePreferredStyles(
    accountId: number,
    styleIds: number[]
  ): Promise<AxiosResponse<{ status: boolean; message: string }>> {
    const url = END_POINT.PUT_PREFER_STYLE.replace("{accountId}", String(accountId));
    return put(url, { styleIds });
  }
  getAllSuggest(
    accountId: number,
    page = 1,
    pageSize = 10
  ): Promise<AxiosResponse<ProductListResponse>> {
    const url = `${END_POINT.GET_SUGGESTION}` +
      `?accountId=${accountId}` +
      `&page=${page}` +
      `&pageSize=${pageSize}`;
    return get(url);
  }
  postInteraction(
    accountId: number,
    productId: number
  ): Promise<AxiosResponse<{ status: boolean; message: string }>> {
    return post(END_POINT.POST_INTERACTION, {
      accountId,
      productId,
    });
  }
}

export default new ProductService();
