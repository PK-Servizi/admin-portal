/**
 * API Response Types
 * Matches the StandardResponseInterceptor format from the backend
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    pages: number;
    skip: number;
    take: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}
