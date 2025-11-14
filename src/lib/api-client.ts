// API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Simplified API client (using fetch)
export const api = {
  // GET request
  get: async <T = unknown>(url: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> => {
    const queryString = params 
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    
    const response = await fetch(`/api${url}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // POST request
  post: async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  // PUT request
  put: async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await fetch(`/api${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  // PATCH request
  patch: async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await fetch(`/api${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  // DELETE request
  delete: async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
    const response = await fetch(`/api${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return handleResponse(response);
  },
};

// Common response handling function
async function handleResponse(response: Response) {
  try {
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON response');
    }
    throw error;
  }
}

// Authentication-related API data interfaces
interface RegisterData {
  email: string;
  password: string;
  name?: string;
  referralCode?: string;
}

interface UpdateUserRoleData {
  userId: string;
  role: string;
}

// Authentication-related API - currently mainly for mobile
export const authAPI = {
  // Register (still needed for the registration process)
  register: async (email: string, password: string, name?: string, referralCode?: string) => {
    const data: RegisterData = { email, password, name, referralCode };
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },
};

// User management API
export const userAPI = {
  // Get user list
  getUsers: async (page: number = 1, limit: number = 10) => {
    const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`, {
      credentials: 'include', // Automatically include NextAuth session cookie
    });
    
    return handleResponse(response);
  },

  // Update user role
  updateUserRole: async (userId: string, role: string) => {
    const data: UpdateUserRoleData = { userId, role };
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Automatically include NextAuth session cookie
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },
};

// Backward compatibility: apiClient is an alias for api
export const apiClient = api;