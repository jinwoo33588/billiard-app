import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import axiosInstance from './api/axiosInstance';
import { User } from './components/Login';
import { Game } from './components/GameList';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import { AppShell, Group, Title, Center, Loader, Button, Text, Anchor } from '@mantine/core';

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
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Anchor component={Link} to="/" underline="never">
              <Title order={3}>🎱 당구 기록 프로그램</Title>
            </Anchor>
          </Group>
          {user && (
            <Group>
              <Text size="sm">{user.nickname}님, 환영합니다!</Text>
              <Button onClick={handleLogout} variant="light">로그아웃</Button>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Routes>
          <Route path="/auth" element={!user ? <AuthPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />} />
          <Route path="/users/:userId" element={user ? <UserProfilePage /> : <Navigate to="/auth" replace />} />
          <Route path="/" element={ user ? <DashboardPage games={games} refreshGames={fetchGames} /> : <Navigate to="/auth" replace /> } />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;