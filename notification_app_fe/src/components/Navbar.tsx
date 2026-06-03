"use client";
// src/components/Navbar.tsx

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  unreadCount?: number;
}

export default function Navbar({ unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: "primary.main" }}>
      <Toolbar>
        <NotificationsIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Campus Notifications
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={Link}
            href="/"
            color="inherit"
            variant={pathname === "/" ? "outlined" : "text"}
            startIcon={
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon />
              </Badge>
            }
            sx={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            All
          </Button>
          <Button
            component={Link}
            href="/priority"
            color="inherit"
            variant={pathname === "/priority" ? "outlined" : "text"}
            startIcon={<StarIcon />}
            sx={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            Priority
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
