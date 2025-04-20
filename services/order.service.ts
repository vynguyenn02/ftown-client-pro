import { AxiosResponse } from "axios";
import { post, get, postMultipart, put } from "@/utils/axios";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersResponse,
  GetOrderDetailResponse,
  GetReturnItemResponse,
  ReturnCheckOutResponse, // kiểu mới
  CreateCheckoutRequest,
  SubmitReturnRequest,
  SubmitReturnResponse,
  ConfirmReceive,
  GHNRequest,
  GHNResponse
} from "@/types";

export const ORDER_ENDPOINT = {
  CREATE_ORDER: "/orders",
  GET_ORDERS: "/orders",
  GET_ORDERS_RETURNABLE: "/orders/returnable",
  GET_ORDERS_RETURNREQUEST: "/return-requests/order-items",
  GET_ORDER_DETAIL: "/orders/{orderId}/details", 
  POST_RETURN_REQUEST_CHECKOUT: "/return-requests/checkout",
  SUBMIT_RETURN_REQUEST: "/return-requests/submit-return-request",
  CONFIRM_RECEIVE: "/orders/{orderId}/status",
  ORDER_STATUS_NEWEST: "/api/ghn/order-status-newest",
};

class OrderService {
  /**
   * Tạo đơn hàng mới.
   */
  createOrder(
    payload: CreateOrderRequest
  ): Promise<AxiosResponse<CreateOrderResponse>> {
    return post(ORDER_ENDPOINT.CREATE_ORDER, payload) as Promise<
      AxiosResponse<CreateOrderResponse>
    >;
  }

  /**
   * Lấy danh sách đơn hàng theo accountId và status.
   */
  getOrdersByAccountId(
    accountId: number,
    status: string
  ): Promise<AxiosResponse<GetOrdersResponse>> {
    return get(`${ORDER_ENDPOINT.GET_ORDERS}?status=${status}&accountId=${accountId}`);
  }
  getOrdersReturnByAccountId(
    accountId: number,
    
  ): Promise<AxiosResponse<GetOrdersResponse>> {
    return get(`${ORDER_ENDPOINT.GET_ORDERS_RETURNABLE}?accountId=${accountId}`);
  }

  /**
   * Lấy tất cả đơn hàng theo accountId.
   */
  getAllOrdersByAccountId(
    accountId: number
  ): Promise<AxiosResponse<GetOrdersResponse>> {
    return get(`${ORDER_ENDPOINT.GET_ORDERS}?accountId=${accountId}`);
  }

  /**
   * Lấy chi tiết đơn hàng theo orderId.
   */
  getOrderDetailByOrderId(
    orderId: number
  ): Promise<AxiosResponse<GetOrderDetailResponse>> {
    const url = ORDER_ENDPOINT.GET_ORDER_DETAIL.replace("{orderId}", String(orderId));
    return get(url);
  }
  getOrdersReturnRequest(
      accountId: number,
      orderId: number,
    ): Promise<AxiosResponse<GetReturnItemResponse>> {
      return get(`${ORDER_ENDPOINT.GET_ORDERS_RETURNREQUEST}?orderId=${orderId}&accountId=${accountId}`);
    }
    checkoutReturn(
      payload: CreateCheckoutRequest
    ): Promise<AxiosResponse<ReturnCheckOutResponse>> {
      return post(ORDER_ENDPOINT.POST_RETURN_REQUEST_CHECKOUT, payload);
    }
    submitReturnRequest(
      payload: SubmitReturnRequest
    ): Promise<AxiosResponse<SubmitReturnResponse>> {
      const formData = new FormData();
    
      // Sử dụng các key theo camelCase như BE yêu cầu
      formData.append("ReturnCheckoutSessionId", payload.returnCheckoutSessionId);
      if (payload.email) formData.append("Email", payload.email);
      formData.append("ReturnReason", payload.returnReason);
      formData.append("ReturnOption", payload.returnOption);
      if (payload.returnDescription) formData.append("ReturnDescription", payload.returnDescription);
    
      if (payload.refundMethod) formData.append("RefundMethod", payload.refundMethod);
      if (payload.bankName) formData.append("BankName", payload.bankName);
      if (payload.bankAccountName) formData.append("BankAccountName", payload.bankAccountName);
      if (payload.bankAccountNumber) formData.append("BankAccountNumber", payload.bankAccountNumber);
    
      // Append file(s)
      if (payload.mediaFiles && payload.mediaFiles.length > 0) {
        payload.mediaFiles.forEach((file) => {
          // Mỗi file được append với key "mediaFiles"
          formData.append("MediaFiles", file);
        });
      }
    
      return postMultipart(ORDER_ENDPOINT.SUBMIT_RETURN_REQUEST, formData);
    }
    confirmReceive(
      orderId: number,
      changedBy: number,              // accountId truyền từ component
      comment: string = "Xác nhận"   // comment mặc định
    ): Promise<AxiosResponse<ConfirmReceive>> {
      const url = ORDER_ENDPOINT.CONFIRM_RECEIVE.replace("{orderId}", String(orderId));
      // Gửi PUT và payload gồm newStatus, changeBy, và comment
      return put(url, {
        newStatus: "completed",
        changedBy,
        comment,
      });
    }
    orderStatusNewest(
      ghnid: string
    ): Promise<AxiosResponse<GHNResponse>> {
      const payload: GHNRequest = { order_code: ghnid };
      return post(ORDER_ENDPOINT.ORDER_STATUS_NEWEST, payload);
    }
    
    
  }

  const orderService = new OrderService();
  export default orderService;
