"use client";
// src/app/page.tsx — All Notifications Page

import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, CircularProgress, Alert,
  Pagination, Chip, Stack, Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { fetchNotifications, Notification } from "../lib/api";
import { logger } from "../lib/logger";
import NotificationCard from "../components/NotificationCard";
import Navbar from "../components/Navbar";

const ITEMS_PER_PAGE = 10;
const FILTER_TYPES = ["All", "Event", "Result", "Placement"];

export default function HomePage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logger.info("component", `Fetching notifications — page ${page}, filter: ${filter}`);
      const data = await fetchNotifications({
        limit: ITEMS_PER_PAGE,
        page,
        notification_type: filter !== "All" ? filter : undefined,
      });
      const items = data.notifications.map((n) => ({ ...n, is_read: readIds.has(n.ID) }));
      setNotifications(items);
      setTotal(data.total);
      logger.info("component", `Loaded ${items.length} notifications`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      logger.error("component", `Failed to fetch notifications: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { loadNotifications(); }, [page, filter]);

  const handleRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
    setNotifications((prev) => prev.map((n) => (n.ID === id ? { ...n, is_read: true } : n)));
    logger.debug("component", `Notification ${id} marked as read`);
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.ID);
    setReadIds((prev) => new Set([...prev, ...allIds]));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  return (
    <>
      <Navbar unreadCount={unreadCount} />
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h5">All Notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {unreadCount > 0 && (
              <Button size="small" variant="outlined" onClick={handleMarkAllRead}>Mark all read</Button>
            )}
            <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={loadNotifications}>
              Refresh
            </Button>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {FILTER_TYPES.map((type) => (
            <Chip
              key={type} label={type}
              onClick={() => { setFilter(type); setPage(1); }}
              color={filter === type ? "primary" : "default"}
              variant={filter === type ? "filled" : "outlined"}
            />
          ))}
        </Stack>

        {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!loading && !error && notifications.length === 0 && <Alert severity="info">No notifications found.</Alert>}
        {!loading && notifications.map((n) => (
          <NotificationCard key={n.ID} notification={n} onRead={handleRead} />
        ))}

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} color="primary" />
          </Box>
        )}
      </Container>
    </>
  );
}
