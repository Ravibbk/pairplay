const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('pairplay_token');
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Sends HTTP-only cookies
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Unexpected server response' };
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Clear local token on auth failure
        localStorage.removeItem('pairplay_token');
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
