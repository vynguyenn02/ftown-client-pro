import { AxiosResponse } from "axios";
import {
  ProfileResponse,
  EditProfileRequest,
  EditProfileResponse,
  CreateShippingAddressRequest,
  CreateShippingAddressResponse,
  GetShippingAddress
} from "@/types";
import { get, put, post } from "../utils/axios";

export const END_POINT = {
  GET_CUSTOMER_PROFILE: "/customer/profile/{accountId}",
  EDIT_CUSTOMER_PROFILE: "/customer/edit-profile/{accountId}",
  CREATE_SHIPPING_ADDRESS: "/shippingaddresses",
  GET_SHIPPING_ADDRESS: "/shippingaddresses/account/{accountId}"
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
    data: EditProfileRequest
  ): Promise<AxiosResponse<EditProfileResponse>> {
    const url = END_POINT.EDIT_CUSTOMER_PROFILE.replace("{accountId}", String(accountId));
    return put(url, data);
  }
  getShippingAddress(accountId: number): Promise<AxiosResponse<GetShippingAddress>> {
    const url = END_POINT.GET_SHIPPING_ADDRESS.replace("{accountId}", String(accountId));
    return get(url);
  }
}

export default new ProfileService();
