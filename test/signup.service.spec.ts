import registerService, { END_POINT } from '../services/signup.service';
const axiosUtils = require('../utils/axios');

import type { AxiosResponse } from 'axios';
import type { RegisterRequest } from '../types/index';

function mockAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {} as any,
    config: { headers: {} as any }
  };
}

describe('RegisterService', () => {
  it('should call POST /auth/register with correct payload', async () => {
    const payload: RegisterRequest = {
      username: 'newuser',
      isActive: true,
      password: 'password123',
      email: 'newuser@example.com'
    };
    const fakeData = { userId: 1, message: 'Registered successfully' };
    spyOn(axiosUtils, 'post').and.returnValue(
      Promise.resolve(mockAxiosResponse(fakeData))
    );

    const res = await registerService.postRegister(payload);

    expect(axiosUtils.post)
      .toHaveBeenCalledWith(END_POINT.REGISTER, payload);
    expect(res.data.message).toBe('Registered successfully');
    expect(res.data.userId).toBe(1);
  });

  it('should reject when POST /auth/register throws an error', async () => {
    const payload: RegisterRequest = {
      username: 'failuser',
      isActive: false,
      password: 'pwd',
      email: 'fail@example.com'
    };
    spyOn(axiosUtils, 'post').and.returnValue(
      Promise.reject(new Error('Network Error'))
    );

    await expectAsync(
      registerService.postRegister(payload)
    ).toBeRejectedWithError('Network Error');
  });
});
