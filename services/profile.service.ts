import { AxiosResponse } from "axios";
import {
  ProfileResponse,
  EditProfileRequest,
  EditProfileResponse,
  CreateShippingAddressRequest,
  CreateShippingAddressResponse,
  GetShippingAddress,
  UpdateShippingAddressRequest,
  UpdateShippingAddressResponse
} from "@/types";
import { get, put, post, remove, putMultipart } from "../utils/axios";

export const END_POINT = {
  GET_CUSTOMER_PROFILE: "/customer/profile/{accountId}",
  EDIT_CUSTOMER_PROFILE: "/customer/edit-profile/{accountId}",
  CREATE_SHIPPING_ADDRESS: "/shippingaddresses",
  GET_SHIPPING_ADDRESS: "/shippingaddresses/account/{accountId}",   
  UPDATE_SHIPPING_ADDRESS: "/shippingaddresses/{id}",
  REMOVE_SHIPPING_ADDRESS: "/shippingaddresses/{id}",
};

class ProfileService {
  // API get profile
  getCustomerProfile(accountId: number): Promise<AxiosResponse<ProfileResponse>> {
    const url = END_POINT.GET_CUSTOMER_PROFILE.replace("{accountId}", String(accountId));
    return get(url);
  }
  createShippingAddress(

    data: CreateShippingAddressRequest
  ): Promise<AxiosResponse<CreateShippingAddressResponse>> {
    return post(END_POINT.CREATE_SHIPPING_ADDRESS, data);
  }
  // API edit profile
  editCustomerProfile(
    accountId: number,
    formData: FormData
  ): Promise<AxiosResponse<EditProfileResponse>> {
    const url = END_POINT.EDIT_CUSTOMER_PROFILE.replace(
      "{accountId}",
      String(accountId)
    );
    return putMultipart(url, formData);
  }
  getShippingAddress(accountId: number): Promise<AxiosResponse<GetShippingAddress>> {
    const url = END_POINT.GET_SHIPPING_ADDRESS.replace("{accountId}", String(accountId));
    return get(url);
  }
  updateShippingAddress(
    addressId: number,
    data: UpdateShippingAddressRequest
  ): Promise<AxiosResponse<UpdateShippingAddressResponse>> {
    // Lấy URL endpoint rồi thay thế {id} bằng addressId
    const url = END_POINT.UPDATE_SHIPPING_ADDRESS.replace("{id}", String(addressId));
    
    // Gửi PUT request đến endpoint
    return put(url, data);
}
  removeShippingAddress(addressId: number): Promise<AxiosResponse<any>> {
    // Lấy URL endpoint rồi thay thế {id} bằng addressId
    const url = END_POINT.REMOVE_SHIPPING_ADDRESS.replace("{id}", String(addressId));
    
    // Gửi DELETE request đến endpoint
    return remove(url);
  }
}
export default new ProfileService();
