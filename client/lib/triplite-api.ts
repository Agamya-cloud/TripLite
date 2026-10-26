export type RecordData = Record<string, any>;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Could not reach the TripLite service. Check your connection and try again.",
      0,
    );
  }
  let body: any = null;
  try {
    body = await response.json();
  } catch {
    /* empty response */
  }
  if (!response.ok || body?.error) {
    const message =
      typeof body?.error === "string" ? body.error : body?.error?.message;
    throw new ApiError(
      message || `Request failed (${response.status}). Please try again.`,
      response.status,
    );
  }
  return (
    body && Object.prototype.hasOwnProperty.call(body, "data")
      ? body.data
      : body
  ) as T;
}

export const json = (method: string, value?: unknown): RequestInit => ({
  method,
  ...(value === undefined ? {} : { body: JSON.stringify(value) }),
});

export function records(value: any): RecordData[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.trips)) return value.trips;
  if (Array.isArray(value?.expenses)) return value.expenses;
  if (Array.isArray(value?.checklists)) return value.checklists;
  return [];
}

export const idOf = (item: RecordData) =>
  String(item?.id ?? item?._id ?? item?.tripId ?? "");
export const labelOf = (item: RecordData) =>
  String(item?.name ?? item?.title ?? item?.destination ?? "Untitled");
export const money = (value: number | string, currency = "USD") => {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
};
