import React from "react";
import { Outlet } from "react-router-dom";
import { AppShell, Container, Modal, Stack, Text, TextInput, NumberInput, Group, Button, Transition, ActionIcon, } from "@mantine/core";
import { IconPencil, IconArrowUp } from "@tabler/icons-react";

import { useAuth } from "../features/auth/useAuth";

import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

export default function AppShellLayout() {
  const {user} = useAuth();
  
  return (
    <AppShell header={{ height: 56 }} footer={{ height: 72 }} padding={0}>
      <AppShell.Header>
        <TopBar user={user}/>
      </AppShell.Header>

      <AppShell.Main>
        {/* main만 스크롤 */}
        <div style={{ height: "calc(100dvh - 56px - 72px)", overflow: "auto", padding: 0 }}>
          <Outlet />
        </div>
      </AppShell.Main>

      <AppShell.Footer>
        <BottomNav />
      </AppShell.Footer>
    </AppShell>
  );
}