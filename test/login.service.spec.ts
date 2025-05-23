// test/login.service.spec.ts
import loginService, { END_POINT } from '../services/login.service';
const axiosUtils = require('../utils/axios');

import type { AxiosResponse } from 'axios';
import type {
  LoginRequest,
  GoogleLoginRequest,
  GoogleLoginResponse
} from '../types/index';

function mockAxiosResponse<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: {} as any, config: { headers: {} as any } };
}

describe('LoginService', () => {
  it('calls POST /auth/login', async () => {
    spyOn(axiosUtils, 'post')
      .and.returnValue(Promise.resolve(mockAxiosResponse({ token: 'abc123' })));
    const res = await loginService.postLogin({ email:'a@b.com',password:'123' });
    expect(axiosUtils.post)
      .toHaveBeenCalledWith(END_POINT.LOGIN, { email:'a@b.com',password:'123' });
    expect(res.data.token).toBe('abc123');
  });

  it('calls POST /auth/google-login', async () => {
    const fakeData: GoogleLoginResponse = {
      data: {
        token: 'xyz',
        account: {
          accountId: 1,
          fullName: 'X',
          email: 'x',
          createdDate: null,
          lastLoginDate: null
        },
        errors: [],
        success: true
      },
      status: true,
      message: 'ok'
    };
    spyOn(axiosUtils, 'post')
      .and.returnValue(Promise.resolve(mockAxiosResponse(fakeData)));
    const res = await loginService.postGoogleLogin({ idToken:'tok' });
    expect(axiosUtils.post)
      .toHaveBeenCalledWith(END_POINT.GOOGLE_LOGIN, { idToken:'tok' });
    expect(res.data.data.token).toBe('xyz');
  });

  // --- Failure scenarios below ---

  it('rejects when POST /auth/login throws an error', async () => {
    const payload: LoginRequest = { email: 'fail@b.com', password: 'wrong' };
    spyOn(axiosUtils, 'post')
      .and.returnValue(Promise.reject(new Error('Network Error')));
    await expectAsync(loginService.postLogin(payload))
      .toBeRejectedWithError('Network Error');
  });

  it('returns success=false when Google login payload indicates failure', async () => {
    const payload: GoogleLoginRequest = { idToken: 'bad_token' };
    // giả lập server trả về success=false
    const fakeData: GoogleLoginResponse = {
      data: {
        token: '',
        account: null as any,
        errors: ['Invalid token'],
        success: false
      },
      status: false,
      message: 'Login failed'
    };
    spyOn(axiosUtils, 'post')
      .and.returnValue(Promise.resolve(mockAxiosResponse(fakeData)));

    const res = await loginService.postGoogleLogin(payload);

    expect(axiosUtils.post)
      .toHaveBeenCalledWith(END_POINT.GOOGLE_LOGIN, payload);
    // Kiểm tra status và errors theo payload giả lập
    expect(res.data.status).toBeFalse();
    expect(res.data.data.errors).toContain('Invalid token');
  });
//    it('INTENTIONAL FAIL: should detect wrong endpoint call', async () => {
//     const payload: LoginRequest = { email: 'test@lab.com', password: '000' };
//     // mock luôn trả về thành công để lệnh service không throw
//     spyOn(axiosUtils, 'post').and.returnValue(
//       Promise.resolve(mockAxiosResponse({ token: 'abc123' }))
//     );

//     await loginService.postLogin(payload);

//     // đây là assertion sai: END_POINT.LOGIN đúng là '/auth/login'
//     // nhưng chúng ta gọi '/auth/loginn' (thừa chữ "n") để test nó fail
//     expect(axiosUtils.post)
//       .toHaveBeenCalledWith('/auth/loginn', payload);
//   });
});
