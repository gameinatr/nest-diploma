const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  title: string;
  image?: string;
  categoryId: number;
  subcategoryId?: number;
  price: number;
  description: string;
  stock?: number;
  isActive?: boolean;
  sku?: string;
  weight?: number;
  category?: Category;
  subcategory?: Subcategory;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      // @ts-expect-error: auth is present
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include", // Include cookies for refresh token
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        try {
          await this.refreshToken();
          // Retry the original request with new token
          if (this.token) {
            // @ts-expect-error: auth is present
            headers.Authorization = `Bearer ${this.token}`;
          }
          const retryResponse = await fetch(url, { ...config, headers });
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        } catch {
          // Refresh failed, redirect to login
          this.logout();
          throw new Error("Authentication failed");
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(response.access_token);
    return response;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(response.access_token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors during logout
    } finally {
      this.clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  async refreshToken(): Promise<void> {
    const response = await this.request<{ access_token: string }>(
      "/auth/refresh",
      {
        method: "POST",
      }
    );
    this.setToken(response.access_token);
  }

  async getProfile(): Promise<User> {
    return this.request<User>("/users/me");
  }

  // Products endpoints
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
  }): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.categoryId)
      searchParams.append("categoryId", params.categoryId.toString());

    const query = searchParams.toString();
    return this.request<{
      products: Product[];
      total: number;
      page: number;
      limit: number;
    }>(`/products${query ? `?${query}` : ""}`);
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  // Cart endpoints
  async getCart(): Promise<{ cart: Cart }> {
    return this.request<{ cart: Cart }>("/cart");
  }

  async addToCart(data: {
    productId: number;
    quantity: number;
  }): Promise<CartItem> {
    return this.request<CartItem>("/cart/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCartItem(
    itemId: number,
    data: { quantity: number }
  ): Promise<CartItem> {
    return this.request<CartItem>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async removeFromCart(itemId: number): Promise<void> {
    return this.request<void>(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
  }

  async clearCart(): Promise<void> {
    return this.request<void>("/cart", {
      method: "DELETE",
    });
  }

  // Orders endpoints
  async createOrder(data: {
    shippingAddress: string;
    notes?: string;
  }): Promise<Order> {
    return this.request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request<{
      orders: Order[];
      total: number;
      page: number;
      limit: number;
    }>(`/orders${query ? `?${query}` : ""}`);
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  // Categories endpoints
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/categories");
  }

  async getCategory(id: number): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  // Admin endpoints
  // Admin - Products
  async adminCreateProduct(data: {
    title: string;
    categoryId: number;
    subcategoryId?: number;
    price: number;
    description: string;
    stock?: number;
    isActive?: boolean;
    sku?: string;
    weight?: number;
  }): Promise<Product> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async adminUpdateProduct(
    id: number,
    data: Partial<{
      title: string;
      categoryId: number;
      subcategoryId?: number;
      price: number;
      description: string;
      stock?: number;
      isActive?: boolean;
      sku?: string;
      weight?: number;
    }>
  ): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async adminDeleteProduct(id: number): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Admin - Categories
  async adminCreateCategory(data: {
    name: string;
    description?: string;
  }): Promise<Category> {
    return this.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async adminUpdateCategory(
    id: number,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async adminDeleteCategory(id: number): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // Admin - Subcategories
  async adminCreateSubcategory(data: {
    name: string;
    description?: string;
    categoryId: number;
  }): Promise<Subcategory> {
    return this.request<Subcategory>("/subcategories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async adminUpdateSubcategory(
    id: number,
    data: {
      name?: string;
      description?: string;
      categoryId?: number;
    }
  ): Promise<Subcategory> {
    return this.request<Subcategory>(`/subcategories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async adminDeleteSubcategory(id: number): Promise<void> {
    return this.request<void>(`/subcategories/${id}`, {
      method: "DELETE",
    });
  }

  // Admin - Users
  async adminGetUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.role) searchParams.append("role", params.role);

    const query = searchParams.toString();
    return this.request<{
      data: User[];
      total: number;
      page: number;
      limit: number;
    }>(`/users${query ? `?${query}` : ""}`);
  }

  async adminCreateUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: Role;
  }): Promise<User> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async adminUpdateUser(
    id: number,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: Role;
    }
  ): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async adminDeleteUser(id: number): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  // Admin - Orders
  async adminGetOrders(params?: { page?: number; limit?: number }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request<{
      orders: Order[];
      total: number;
      page: number;
      limit: number;
    }>(`/orders/admin${query ? `?${query}` : ""}`);
  }

  async adminUpdateOrder(
    id: number,
    data: {
      status?: string;
      shippingAddress?: string;
      notes?: string;
    }
  ): Promise<Order> {
    return this.request<Order>(`/orders/admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async adminDeleteOrder(id: number): Promise<void> {
    return this.request<void>(`/orders/admin/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
