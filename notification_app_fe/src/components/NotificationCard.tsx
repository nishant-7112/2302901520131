"use client";
// src/components/NotificationCard.tsx

import { Card, CardContent, Typography, Chip, Box, Tooltip } from "@mui/material";
import { Notification } from "../lib/api";

const TYPE_COLOR: Record<string, "error" | "warning" | "info"> = {
  Placement: "error",
  Result: "warning",
  Event: "info",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  notification: Notification;
  onRead: (id: string) => void;
  priorityScore?: number;
}

export default function NotificationCard({ notification, onRead, priorityScore }: Props) {
  const isUnread = !notification.is_read;
  const color = TYPE_COLOR[notification.Type] ?? "info";

  return (
    <Card
      onClick={() => onRead(notification.ID)}
      sx={{
        cursor: "pointer",
        borderLeft: isUnread ? "4px solid" : "4px solid transparent",
        borderLeftColor: isUnread ? `${color}.main` : "transparent",
        bgcolor: isUnread ? "background.paper" : "grey.50",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.12)", transform: "translateY(-1px)" },
        mb: 1.5,
      }}
    >
      <CardContent sx={{ pb: "12px !important" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={notification.Type} color={color} size="small" sx={{ fontSize: "0.7rem", height: 22 }} />
            {isUnread && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {priorityScore !== undefined && (
              <Tooltip title="Priority Score">
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  ★ {priorityScore.toFixed(2)}
                </Typography>
              </Tooltip>
            )}
            <Typography variant="caption" color="text.secondary">
              {timeAgo(notification.Timestamp)}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="subtitle2"
          sx={{ fontWeight: isUnread ? 700 : 500, color: isUnread ? "text.primary" : "text.secondary" }}
        >
          {notification.Message}
        </Typography>
      </CardContent>
    </Card>
  );
}
