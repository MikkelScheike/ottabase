import type { NewShortlink, Shortlink } from "./schema";

export type { NewShortlink, Shortlink };

/**
 * Shortlink type enum for categorization
 */
export const ShortlinkTypes = {
  REDIRECT: "redirect",
  TRACKING: "tracking",
  INTERNAL: "internal",
  EXTERNAL: "external",
} as const;

export type ShortlinkType =
  (typeof ShortlinkTypes)[keyof typeof ShortlinkTypes];

/**
 * Request payload for creating a new shortlink
 */
export interface CreateShortlinkRequest {
  fullUrl: string;
  shortCode: string;
  type?: ShortlinkType;
  appId?: string;
  expiryDate?: Date | null;
}

/**
 * Request payload for updating an existing shortlink
 */
export interface UpdateShortlinkRequest {
  fullUrl?: string;
  shortCode?: string;
  type?: ShortlinkType;
  expiryDate?: Date | null;
}

/**
 * Response for shortlink operations
 */
export interface ShortlinkResponse {
  success: boolean;
  data?: Shortlink;
  error?: string;
}

/**
 * Response for list operations
 * @deprecated Use ShortlinksPaginatedResponse instead for new implementations
 */
export interface ShortlinksListResponse {
  success: boolean;
  data?: Shortlink[];
  total?: number;
  error?: string;
}

// ============================================================
// Pagination Types (Simplified)
// ============================================================

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  next: string | null;
  prev: string | null;
}

/**
 * Paginated response for shortlinks
 */
export interface ShortlinksPaginatedResponse {
  data: Shortlink[];
  pagination: Pagination;
}

/**
 * Query parameters for paginated shortlink requests
 */
export interface ShortlinksQueryParams {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: "asc" | "desc";
  appId?: string;
  type?: ShortlinkType;
  search?: string;
}
