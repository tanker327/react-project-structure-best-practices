export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return new ApiError(
      error.response.data?.message || 'API request failed',
      error.response.status,
      error.response.data?.code || 'UNKNOWN_ERROR',
      error.response.data?.details
    );
  }

  if (error.request) {
    return new ApiError(
      'Network error - no response received',
      0,
      'NETWORK_ERROR'
    );
  }

  return new ApiError(
    error.message || 'Unknown error occurred',
    0,
    'UNKNOWN_ERROR'
  );
};