import axios, { AxiosResponse } from "axios"
import { getCookie } from "cookies-next"
import { env } from "env.mjs"
import config from "@/config"

/**
 * Creates an Axios instance for making HTTP requests.
 *
 * @param {string} endpoint - The API endpoint to which the request should be made.
 * @param {string} method - The HTTP method for the request (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [body={}] - An object containing the request body. Default is an empty object.
 * @returns {Promise} - A Promise that resolves to the response of the HTTP request.
 * @param endpoint: string - endpoint của API, ví dụ "/return-requests/submit-return-request"
 * @param formData: FormData - dữ liệu multipart để gửi.
 * @returns Promise<AxiosResponse>
 */
export const request = (
  endpoint: string,
  method: string,
  headers: object = {},
  params: object = {},
  body: object = {}
): Promise<AxiosResponse> => {
  const accessToken = getCookie(config.cookies.accessToken)

  return axios({
    url: env.NEXT_PUBLIC_API_URL + endpoint,
    method: method,
    headers: Object.assign({}, headers, accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    params: Object.assign(params),
    data: body,
  })
}
/**
 * Sends a GET request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to which the GET request should be made.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @returns {Axios} - An Axios instance for making the GET request.
 */
export const get = (endpoint: string, params: object = {}, headers: object = {}): Promise<AxiosResponse> => {
  return request(endpoint, "GET", headers, params)
}

/**
 * Sends a POST request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to which the POST request should be made.
 * @param {object} [body={}] - An object containing the request body. Default is an empty object.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @returns {Axios} - An Axios instance for making the POST request.
 */
export const post = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "POST", headers, params, body)
}

/**
 * Sends a PUT request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to which the PUT request should be made.
 * @param {object} [body={}] - An object containing the request body. Default is an empty object.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @returns {Axios} - An Axios instance for making the PUT request.
 */
export const put = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "PUT", headers, params, body)
}

/**
 * Sends a DELETE request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to which the DELETE request should be made.
 * @param {object} [body={}] - An object containing the request body. Default is an empty object.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @returns {Axios} - An Axios instance for making the DELETE request.
 */
export const remove = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "DELETE", headers, params, body)
}
export const postMultipart = (
  endpoint: string,
  formData: FormData
): Promise<AxiosResponse> => {
  const accessToken = getCookie(config.cookies.accessToken);

  return axios({
    url: env.NEXT_PUBLIC_API_URL + endpoint,
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  });
};

export const putMultipart = (
  endpoint: string,
  formData: FormData
): Promise<AxiosResponse> => {
  const accessToken = getCookie(config.cookies.accessToken);

  return axios({
    url: env.NEXT_PUBLIC_API_URL + endpoint,
    method: "PUT",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  });
};
