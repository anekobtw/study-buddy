import { TokenProvider } from "./auth";
import {
  HealthResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  NextBatchResponse,
  SubmitSwipeRequest,
  SubmitSwipeResponse,
  MatchesResponse,
} from "./types";

export interface ClientOptions {
  baseUrl: string; // e.g. http://localhost:8000
  tokenProvider: TokenProvider; // obtains Firebase ID token
  fetchImpl?: typeof fetch; // allow custom fetch (node polyfill)
}

export class ApiClient {
  private baseUrl: string;
  private tokenProvider: TokenProvider;
  private fetchImpl: typeof fetch;

  constructor(opts: ClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.tokenProvider = opts.tokenProvider;
    this.fetchImpl = opts.fetchImpl ?? fetch.bind(globalThis);
  }

  private async authHeaders(): Promise<HeadersInit> {
    const token = await this.tokenProvider();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  private async get<T>(path: string): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: await this.authHeaders(),
    });
    if (!res.ok) throw await this.errorFromResponse(res);
    return (await res.json()) as T;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: await this.authHeaders(),
      body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) throw await this.errorFromResponse(res);
    return (await res.json()) as T;
  }

  private async errorFromResponse(res: Response): Promise<Error> {
    let text = await res.text();
    try {
      const data = JSON.parse(text);
      text = data.detail || data.message || text;
    } catch {}
    const err = new Error(`${res.status} ${res.statusText}: ${text}`);
    return err;
  }

  // ---- Endpoints ----
  health(): Promise<HealthResponse> {
    return this.get<HealthResponse>(`/health`);
  }

  updateProfile(payload: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return this.post<UpdateProfileResponse>(`/api/update-profile`, payload);
  }

  nextBatch(): Promise<NextBatchResponse> {
    return this.get<NextBatchResponse>(`/api/next_batch`);
  }

  submitSwipe(payload: SubmitSwipeRequest): Promise<SubmitSwipeResponse> {
    return this.post<SubmitSwipeResponse>(`/api/submit_swipe`, payload);
  }

  getMatches(): Promise<MatchesResponse> {
    return this.get<MatchesResponse>(`/api/matches`);
  }
}
