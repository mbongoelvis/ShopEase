import { Platform } from 'react-native';

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL;
const defaultBaseUrl = Platform.OS === 'android' ? 'http://192.168.1.182:5000' : 'http://localhost:5000';
export const API_BASE_URL = (configuredBaseUrl || defaultBaseUrl).replace(/\/$/, '');

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }
  return data as T;
}

export async function uploadFile<T>(path: string, file: { uri: string; name: string; mimeType?: string }) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'text/csv',
  } as any);

  const headers = new Headers();
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: formData });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `Upload failed with status ${response.status}`);
  return data as T;
}

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId: string | null;
  storeName: string | null;
  mustResetPassword: boolean;
};

export type LoginResponse = { token: string; user: ApiUser };

export async function loginRequest(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function formatXaf(amount: number) {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(amount))} XAF`;
}
