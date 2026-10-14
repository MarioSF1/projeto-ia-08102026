const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TOKEN_STORAGE_KEY = 'gastocerto_auth_token';
const GEMINI_MODEL_STORAGE_KEY = 'gastocerto_gemini_model';
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
const ALLOWED_GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
];

type UnauthorizedListener = () => void;
let onUnauthorizedCallback: UnauthorizedListener | null = null;

export function setOnUnauthorized(listener: UnauthorizedListener | null) {
  onUnauthorizedCallback = listener;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getStoredGeminiModel(): string {
  if (typeof window === 'undefined') return DEFAULT_GEMINI_MODEL;
  const stored = window.localStorage.getItem(GEMINI_MODEL_STORAGE_KEY);
  if (stored && ALLOWED_GEMINI_MODELS.includes(stored)) {
    return stored;
  }
  return DEFAULT_GEMINI_MODEL;
}

export function setStoredGeminiModel(model: string) {
  if (typeof window === 'undefined') return;
  if (model && model.trim()) {
    window.localStorage.setItem(GEMINI_MODEL_STORAGE_KEY, model.trim());
  }
}

export async function httpClient<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const selectedModel = getStoredGeminiModel();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Gemini-Model': selectedModel,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return null as T;

  let data: { errors?: string[] } & Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    // Resposta sem corpo JSON
  }

  if (!res.ok) {
    if (res.status === 401 && onUnauthorizedCallback && !path.startsWith('/auth/login')) {
      onUnauthorizedCallback();
    }
    throw new Error((data.errors || ['Erro inesperado na comunicação com o servidor']).join('\n'));
  }

  return data as T;
}
