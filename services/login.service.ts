// login.service.ts
import { AxiosResponse } from "axios";
import { LoginRequest, GoogleLoginResponse, GoogleLoginRequest } from "@/types"; // email, password
import { post } from "../utils/axios";

export const END_POINT = {
  LOGIN: "/auth/login",
  GOOGLE_LOGIN: "/auth/google-login",
};

class LoginService {
  postLogin(data: LoginRequest): Promise<AxiosResponse<any>> {
    // data = { email, password }
    return post(END_POINT.LOGIN, data);
  }
  
  postGoogleLogin(
    data: GoogleLoginRequest
  ): Promise<AxiosResponse<GoogleLoginResponse>> {
    return post(END_POINT.GOOGLE_LOGIN, data);
  }
}

const loginService = new LoginService();
export default loginService;
