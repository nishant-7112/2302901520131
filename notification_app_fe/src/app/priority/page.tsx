"use client";
// src/app/priority/page.tsx — Priority Inbox

import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, CircularProgress, Alert,
  Slider, FormControlLabel, Switch, Chip, Stack, Paper, Button,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import { fetchNotifications, Notification } from "../../lib/api";
import { getTopNPriority, ScoredNotification } from "../../lib/priorityEngine";
import { logger } from "../../lib/logger";
import NotificationCard from "../../components/NotificationCard";
import Navbar from "../../components/Navbar";

const TYPE_FILTER = ["All", "Event", "Result", "Placement"];

export default function PriorityPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topN, setTopN] = useState(10);
  const [includeRead, setIncludeRead] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logger.info("component", "Priority Inbox: fetching notifications for scoring");
// API max limit is 10, fetch multiple pages
const pages = await Promise.all(
  [1, 2, 3, 4, 5].map((p) =>
    fetchNotifications({ limit: 10, page: p })
  )
);
const allItems = pages.flatMap((d) => d.notifications).map((n) => ({
  ...n,
  is_read: readIds.has(n.ID),
}));
setAllNotifications(allItems);
logger.info("component", `Priority Inbox: loaded ${allItems.length} notifications`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      logger.error("component", `Priority Inbox fetch failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, []);

  const handleRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
    setAllNotifications((prev) => prev.map((n) => (n.ID === id ? { ...n, is_read: true } : n)));
  };

  const filtered = typeFilter === "All"
    ? allNotifications
    : allNotifications.filter((n) => n.Type === typeFilter);

  const prioritized: ScoredNotification[] = getTopNPriority(filtered, topN, includeRead);
  const unreadCount = allNotifications.filter((n) => !n.is_read).length;

  return (
    <>
      <Navbar unreadCount={unreadCount} />
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StarIcon color="warning" />
              <Typography variant="h5">Priority Inbox</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Top {topN} notifications by importance</Typography>
          </Box>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={loadAll}>Refresh</Button>
        </Box>

        <Paper sx={{ p: 2.5, mb: 3 }} elevation={0} variant="outlined">
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" gutterBottom fontWeight={600}>
                Show top N: <strong>{topN}</strong>
              </Typography>
              <Slider
                value={topN} min={5} max={30} step={5}
                marks={[5,10,15,20,25,30].map(v=>({value:v,label:`${v}`}))}
                onChange={(_, val) => setTopN(val as number)}
                sx={{ maxWidth: 400 }}
              />
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box>
                <Typography variant="body2" fontWeight={600} gutterBottom>Filter by type:</Typography>
                <Stack direction="row" spacing={1}>
                  {TYPE_FILTER.map((t) => (
                    <Chip key={t} label={t} size="small"
                      onClick={() => setTypeFilter(t)}
                      color={typeFilter === t ? "primary" : "default"}
                      variant={typeFilter === t ? "filled" : "outlined"}
                    />
                  ))}
                </Stack>
              </Box>
              <FormControlLabel
                control={<Switch checked={includeRead} onChange={(e) => setIncludeRead(e.target.checked)} size="small" />}
                label={<Typography variant="body2">Include read</Typography>}
              />
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: 1.5, mb: 3, bgcolor: "grey.50" }} elevation={0} variant="outlined">
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Priority Weight: </Typography>
          <Chip label="Placement = 3×" color="error" size="small" sx={{ mr: 0.5, fontSize: "0.7rem" }} />
          <Chip label="Result = 2×" color="warning" size="small" sx={{ mr: 0.5, fontSize: "0.7rem" }} />
          <Chip label="Event = 1×" color="info" size="small" sx={{ fontSize: "0.7rem" }} />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>+ Recency bonus</Typography>
        </Paper>

        {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && prioritized.length === 0 && (
          <Alert severity="info">No unread notifications. Toggle "Include read" to see all.</Alert>
        )}
        {!loading && prioritized.map((n, idx) => (
          <Box key={n.ID} sx={{ position: "relative" }}>
            <Typography variant="caption" sx={{
              position: "absolute", left: -28, top: "50%", transform: "translateY(-50%)",
              color: "text.disabled", fontWeight: 700, display: { xs: "none", sm: "block" }
            }}>#{idx + 1}</Typography>
            <NotificationCard notification={n} onRead={handleRead} priorityScore={n.priorityScore} />
          </Box>
        ))}
      </Container>
    </>
  );
}
