// register.service.ts
import { AxiosResponse } from "axios";
import { RegisterRequest } from "@/types"; // Import kiểu
import { post } from "@/utils/axios";

export const END_POINT = {
  REGISTER: "/auth/register",
};

class RegisterService {
  postRegister(data: RegisterRequest): Promise<AxiosResponse<any>> {
    return post(END_POINT.REGISTER, data);
  }
}

const registerService = new RegisterService();
export default registerService;
