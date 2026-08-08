export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function normalizePagination(params: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Math.floor(Number(params.page ?? 1)));
  const rawLimit = Math.floor(Number(params.limit ?? 20));
  const limit = Math.min(100, Math.max(1, rawLimit));
  return { page, limit };
}

export function applyPagination<T>(items: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
