// Public SDK TypeScript types aligned with the API schemas

export type Direction = "left" | "right";
export type Year = "freshman" | "sophomore" | "junior" | "senior";

export interface UpdateProfileRequest {
  FullName: string;
  UsfEmail: string;
  PreferredStudyTime: "morning" | "afternoon" | "evening" | "night";
  Classes: Record<string, 0 | 1 | 2>;
  major: string;
  year: Year;
  description: string;
}

export interface UpdateProfileResponse {
  status: string; // "success"
  uid: string;
}

export interface NextBatchUser {
  uid: string;
  fullName: string;
  preferredStudyTime: string; // server returns capitalized e.g. MORNING
  classes: Record<string, number>;
  major: string;
  year: Year;
  description: string;
}

export interface NextBatchResponse {
  batch: NextBatchUser[];
}

export interface SubmitSwipeRequest {
  targetUid: string;
  direction: Direction;
}

export interface MatchModel {
  matchId: string;
  userA: string;
  userB: string;
}

export interface SubmitSwipeResponse {
  match: MatchModel | null;
}

export interface MatchesResponse {
  matches: MatchModel[];
}

export interface HealthResponse {
  status: string;
  firebase_initialized: boolean;
  firestore_initialized: boolean;
}
