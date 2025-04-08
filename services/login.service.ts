// login.service.ts
import { AxiosResponse } from "axios";
import { LoginRequest } from "@/types"; // email, password
import { post } from "../utils/axios";

export const END_POINT = {
  LOGIN: "/auth/login",
};

class LoginService {
  postLogin(data: LoginRequest): Promise<AxiosResponse<any>> {
    // data = { email, password }
    return post(END_POINT.LOGIN, data);
  }
}

const loginService = new LoginService();
export default loginService;
