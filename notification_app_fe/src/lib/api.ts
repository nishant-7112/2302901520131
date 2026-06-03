// src/lib/api.ts

const BASE_URL = "/api/proxy";

const AUTH_CREDENTIALS = {
  email: "nishantraj8826@gmail.com",
  name: "Nishant Raj",
  rollNo: "2302901520131",
  accessCode: "sdWWgc",
  clientID: "f0b7a0a6-1105-4dee-8ba8-197cc6120182",
  clientSecret: "fABMrHapsdQVetQh",
};

let cachedToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

export async function getAuthToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  if (tokenPromise) return tokenPromise;

  tokenPromise = fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AUTH_CREDENTIALS),
  })
    .then((res) => res.json())
    .then((data) => {
      cachedToken = data.access_token;
      tokenPromise = null;
      return cachedToken as string;
    });

  return tokenPromise;
}

// Matches actual API response shape
export interface Notification {
  ID: string;
  Type: "Event" | "Result" | "Placement";
  Message: string;
  Timestamp: string;
  is_read?: boolean; // managed locally in frontend
}

export async function fetchNotifications(params: {
  limit?: number;
  page?: number;
  notification_type?: string;
}): Promise<{ notifications: Notification[]; total: number }> {
  const token = await getAuthToken();

  const query = new URLSearchParams();
  query.set("limit", String(params.limit ?? 10));
  if (params.page) query.set("page", String(params.page));
  if (params.notification_type && params.notification_type !== "All") {
    query.set("notification_type", params.notification_type);
  }

  const res = await fetch(`${BASE_URL}/notifications?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Token expired — refresh and retry
  if (res.status === 401) {
    cachedToken = null;
    const freshToken = await getAuthToken();
    const retry = await fetch(`${BASE_URL}/notifications?${query.toString()}`, {
      headers: { Authorization: `Bearer ${freshToken}` },
    });
    const retryData = await retry.json();
    const items: Notification[] = retryData.notifications ?? [];
    return { notifications: items, total: retryData.total ?? items.length };
  }

  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

  const data = await res.json();
  const items: Notification[] = data.notifications ?? [];
  return { notifications: items, total: data.total ?? items.length };
}

export async function sendLog(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  try {
    const token = await getAuthToken();
    await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch {
    // Logging must never crash the app
  }
}
