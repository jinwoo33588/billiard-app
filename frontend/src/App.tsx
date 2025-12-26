import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import axiosInstance from './api/axiosInstance';
import { User } from './components/Login';
import { Game } from './components/GameList';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import RankingPage from './pages/RankingPage';
import UserProfilePage from './pages/UserProfilePage';
import { AppShell, Group, Title, Center, Loader, Button, Text, ActionIcon, Container } from '@mantine/core';
import { IconHome, IconArchive, IconChartBar } from '@tabler/icons-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get('/games');
      setGames(response.data);
    } catch (error) {
      console.error("경기 기록을 불러오는 데 실패했습니다:", error);
    }
  }, [user]);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axiosInstance.get('/users/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchGames();
    } else {
      setGames([]);
    }
  }, [user, fetchGames]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <Center style={{ height: '100vh' }}><Loader /></Center>;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      footer={user ? { height: 60 } : undefined}
     
    >
      <AppShell.Header>
        <Container fluid px="sm" h="100%">
          <Group h="100%" justify="space-between">
            <Title order={4}>🎱 테크노 당구 기록</Title>
            {user && (
              <Button size="xs" variant="light" onClick={handleLogout}>
                로그아웃
              </Button>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      {user && (
        <AppShell.Footer>
          <Group h="100%" grow justify="center" gap={0}>
            <ActionIcon component={NavLink} to="/" variant="subtle" size="xl"><IconHome /></ActionIcon>
            <ActionIcon component={NavLink} to="/archive" variant="subtle" size="xl"><IconArchive /></ActionIcon>
            <ActionIcon component={NavLink} to="/ranking" variant="subtle" size="xl"><IconChartBar /></ActionIcon>
          </Group>
        </AppShell.Footer>
      )}

      <AppShell.Main>
      <Container style={{ paddingBottom: '80px' }}>
          <Routes>
            <Route path="/auth" element={!user ? <AuthPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />} />
            <Route path="/" element={user ? <HomePage user={user} games={games} refreshGames={fetchGames} /> : <Navigate to="/auth" replace />} />
            <Route path="/archive" element={user ? <ArchivePage games={games} /> : <Navigate to="/auth" replace />} />
            <Route path="/ranking" element={user ? <RankingPage /> : <Navigate to="/auth" replace />} />
            <Route path="/users/:userId" element={user ? <UserProfilePage /> : <Navigate to="/auth" replace />} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;