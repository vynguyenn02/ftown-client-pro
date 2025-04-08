import { AxiosResponse } from "axios";
import { Store, ResponseObject } from "@/types";
import { get } from "@/utils/axios";
export const END_POINT = {
    GET_ALL_STORE:"/stores",
  };
  class StoreService {
    getAllStores(): Promise<AxiosResponse<ResponseObject<Store[]>>> {
      return get(END_POINT.GET_ALL_STORE);
    }
}
export default new StoreService();
  