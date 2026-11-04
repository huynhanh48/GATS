import axios from 'axios';

const baseURL = import.meta.env.PUBLIC_API_URL || 'https://api.gats.vn';

class HttpClient {
  constructor(config = {}) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
      ...config,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request Interceptor: đính kèm Bearer token nếu có
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: chuẩn hóa dữ liệu & xử lý lỗi tập trung
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';

        if (status === 401) {
          // Xử lý token hết hạn / chưa đăng nhập
          localStorage.removeItem('access_token');
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }

        return Promise.reject({
          status,
          message,
          errors: error.response?.data?.errors,
          originalError: error,
        });
      }
    );
  }

  get(url, config) {
    return this.client.get(url, config);
  }

  post(url, data, config) {
    return this.client.post(url, data, config);
  }

  put(url, data, config) {
    return this.client.put(url, data, config);
  }

  patch(url, data, config) {
    return this.client.patch(url, data, config);
  }

  delete(url, config) {
    return this.client.delete(url, config);
  }
}

export const httpClient = new HttpClient();
export { HttpClient };
