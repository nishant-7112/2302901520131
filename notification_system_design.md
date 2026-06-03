# Notification System Design

## Stage 1

### Problem
Users lose track of important notifications due to high volume. We need a **Priority Inbox** that always displays the top 'n' most important unread notifications first.

### Priority Scoring Approach

Each notification is assigned a **priority score** based on two factors:

#### 1. Type Weight
| Notification Type | Weight |
|-------------------|--------|
| Placement         | 3      |
| Result            | 2      |
| Event             | 1      |

Placement notifications are the most critical (career-impacting), followed by Results (academic-impacting), and Events (general interest).

#### 2. Recency Score
Newer notifications should rank higher within the same type. We compute recency as:

```
recencyScore = 1 / (1 + hoursElapsed)
```

This gives a value between 0 and 1 — newer notifications score closer to 1.

#### 3. Final Priority Score Formula

```
priorityScore = typeWeight * 10 + recencyScore
```

Multiplying typeWeight by 10 ensures type always dominates over recency, while recency breaks ties within the same type.

### Algorithm to Get Top N Notifications

```typescript
function getTopNPriorityNotifications(notifications: Notification[], n: number): Notification[] {
  const now = Date.now();

  const unread = notifications.filter(n => !n.is_read);

  const scored = unread.map(notification => {
    const typeWeight = { Placement: 3, Result: 2, Event: 1 }[notification.notification_type] ?? 0;
    const hoursElapsed = (now - new Date(notification.created_at).getTime()) / (1000 * 60 * 60);
    const recencyScore = 1 / (1 + hoursElapsed);
    const priorityScore = typeWeight * 10 + recencyScore;
    return { ...notification, priorityScore };
  });

  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  return scored.slice(0, n);
}
```

### Handling New Notifications Efficiently

To maintain the top N efficiently as new notifications arrive:

- Use a **Min-Heap of size N** (priority queue)
- When a new notification arrives, compare its score with the minimum in the heap
- If higher, replace the minimum and re-heapify
- This gives **O(log N)** insertion vs O(n log n) full sort every time
- In a React frontend, this is implemented reactively — new notifications trigger a re-score and re-sort of the priority list

### Why This Approach?
- **Simple and explainable** — type weight is the primary driver, recency is the tiebreaker
- **No DB query needed** — pure in-memory computation
- **Efficient** — heap-based approach scales well with large notification volumes
- **Flexible** — 'n' is user-configurable (10, 15, 20, etc.)

---

## Stage 2

### Frontend Architecture

The React/Next.js application is structured as follows:

```
notification_app_fe/
├── src/
│   ├── app/
│   │   ├── page.tsx              # All Notifications page
│   │   ├── priority/page.tsx     # Priority Inbox page
│   │   └── layout.tsx            # Root layout with MUI theme
│   ├── components/
│   │   ├── NotificationCard.tsx  # Individual notification card
│   │   ├── NotificationList.tsx  # Paginated list
│   │   ├── PriorityInbox.tsx     # Priority inbox with top-N selector
│   │   └── Navbar.tsx            # Navigation bar
│   └── lib/
│       ├── api.ts                # API calls + auth token management
│       ├── priorityEngine.ts     # Top-N scoring algorithm
│       └── logger.ts             # Logging middleware integration
```

### Read/Unread Distinction
- Notifications are marked as **read** in local state when clicked (frontend-only tracking using localStorage)
- Unread notifications display a colored left border and bold title
- Read notifications appear muted

### API Integration
- `GET /evaluation-service/notifications?limit=20&page=1&notification_type=Event`
- Token is fetched on app load via the auth endpoint and stored in memory
- All API calls include `Authorization: Bearer <token>` header
