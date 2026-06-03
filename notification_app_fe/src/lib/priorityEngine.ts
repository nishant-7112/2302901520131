// src/lib/priorityEngine.ts

import { Notification } from "./api";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export interface ScoredNotification extends Notification {
  priorityScore: number;
}

export function scoreNotification(n: Notification): ScoredNotification {
  const typeWeight = TYPE_WEIGHT[n.Type] ?? 0;
  const now = Date.now();
  const created = new Date(n.Timestamp).getTime();
  const hoursElapsed = (now - created) / (1000 * 60 * 60);
  const recencyScore = 1 / (1 + hoursElapsed);
  const priorityScore = typeWeight * 10 + recencyScore;
  return { ...n, priorityScore };
}

export function getTopNPriority(
  notifications: Notification[],
  n: number,
  includeRead = false
): ScoredNotification[] {
  const filtered = includeRead ? notifications : notifications.filter((n) => !n.is_read);
  const scored = filtered.map(scoreNotification);
  scored.sort((a, b) => b.priorityScore - a.priorityScore);
  return scored.slice(0, n);
}
