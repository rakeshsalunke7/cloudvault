import { type AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;

  if (axiosError?.response) {
    const { status, data } = axiosError.response;

    if (data?.message) return data.message;
    if (data?.error) return data.error;

    switch (status) {
      case 400:
        return 'Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 413:
        return 'That file is too large. Maximum size is 50 MB.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return `Request failed (${status}).`;
    }
  }

  if (axiosError?.request) {
    return 'Network error. Please check your connection and try again.';
  }

  return fallback;
}
