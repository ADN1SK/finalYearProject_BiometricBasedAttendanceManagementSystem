/**
 * Minimal API client for interacting with the Django backend.
 */

// Dynamically determine the backend URL based on the current hostname
const BASE_URL = `http://${window.location.hostname}:8000`;

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  // Ensure we have a CSRF token for mutating requests
  const method = options.method?.toUpperCase() || 'GET';
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  
  const headers = new Headers(options.headers || {});
  
  if (isMutating) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  console.log(`[API] Request: ${method} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for sessions/cookies
  });

  if (!response.ok) {
    console.error(`[API] Error: ${response.status} ${response.statusText}`);
    let errorData;
    try {
      errorData = await response.json();
      console.error(`[API] Error Body:`, errorData);
    } catch {
      throw new Error(`API Request failed: ${response.statusText}`);
    }
    throw new Error(errorData.error || errorData.detail || `API Request failed: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[API] Success:`, data);
  return data;
}

/**
 * Ensures the CSRF cookie is set by calling the backend's CSRF endpoint.
 */
export async function ensureCsrf() {
  return apiRequest('/accounts/api/csrf/');
}
