const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}, authToken?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An unexpected error occurred." }));
    throw new Error(errorData.detail || errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}

// User Profile Check via FastAPI
export async function getMeApi(token?: string | null) {
  return fetchApi<any>("/api/v1/auth/me", {}, token);
}

// Research Execution API Calls
export async function startResearchApi(query: string, token?: string | null) {
  return fetchApi<{ session_id: string; status: string; message: string }>("/api/v1/research/start", {
    method: "POST",
    body: JSON.stringify({ query }),
  }, token);
}

export async function getResearchSessionApi(sessionId: string, token?: string | null) {
  return fetchApi<any>(`/api/v1/research/session/${sessionId}`, {}, token);
}

export async function chatResearchApi(sessionId: string, message: string, token?: string | null, reportContext?: string) {
  return fetchApi<{ status: string; answer: string; session_id: string }>("/api/v1/research/chat", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, message, report_context: reportContext }),
  }, token);
}

// Reports & History API Calls
export async function getHistoryApi(token?: string | null) {
  return fetchApi<{ status: string; history: any[] }>("/api/v1/reports/history", {}, token);
}

export async function getReportApi(reportId: string, token?: string | null) {
  return fetchApi<{ status: string; report: any }>(`/api/v1/reports/${reportId}`, {}, token);
}

export async function deleteReportApi(reportId: string, token?: string | null) {
  return fetchApi<{ status: string; message: string }>(`/api/v1/reports/${reportId}`, {
    method: "DELETE",
  }, token);
}

export function getExportPdfUrl(reportId: string): string {
  return `${API_BASE_URL}/api/v1/reports/${reportId}/export/pdf`;
}

export function getExportMarkdownUrl(reportId: string): string {
  return `${API_BASE_URL}/api/v1/reports/${reportId}/export/markdown`;
}
