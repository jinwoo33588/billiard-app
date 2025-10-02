import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import axiosInstance from './api/axiosInstance';
import { User } from './components/Login';
import { Game } from './components/GameList';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import RecordPage from './pages/RecordPage';
import RankingPage from './pages/RankingPage';
import UserProfilePage from './pages/UserProfilePage';
import { AppShell, Group, Title, Center, Loader, Button, Text, ActionIcon, Container } from '@mantine/core';
import { IconHome, IconList, IconChartBar } from '@tabler/icons-react';

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
    <AppShell
      header={{ height: 60 }}
      footer={user ? { height: 60 } : undefined}
      // [수정] padding을 반응형으로 변경합니다.
      // base(모바일)에서는 0, xs(작은 태블릿) 이상에서는 md(중간) 크기의 여백을 줍니다.
      
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" px="md" justify="space-between">
            <Title order={3}>🎱 당구 기록</Title>
            {user && (
              <Group>
                <Text size="sm" visibleFrom="xs">{user.nickname}님!</Text>
                <Button onClick={handleLogout} variant="light" size="xs">로그아웃</Button>
              </Group>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      {user && (
        <AppShell.Footer>
          <Group h="100%" grow justify="center" gap={0}>
            <ActionIcon component={NavLink} to="/" variant="subtle" size="xl"><IconHome /></ActionIcon>
            <ActionIcon component={NavLink} to="/record" variant="subtle" size="xl"><IconList /></ActionIcon>
            <ActionIcon component={NavLink} to="/ranking" variant="subtle" size="xl"><IconChartBar /></ActionIcon>
          </Group>
        </AppShell.Footer>
      )}

      <AppShell.Main>
        {/* [수정] Container의 my(상하 여백)을 p(전체 여백)으로 변경하여 모바일에서 좌우 여백을 줍니다. */}
        <Container fluid p={{ base: 'sm', sm: 'md' }} >
          <Routes>
            <Route path="/auth" element={!user ? <AuthPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />} />
            <Route path="/" element={user ? <HomePage user={user} games={games} /> : <Navigate to="/auth" replace />} />
            <Route path="/record" element={user ? <RecordPage onGameAdded={fetchGames} /> : <Navigate to="/auth" replace />} />
            <Route path="/ranking" element={user ? <RankingPage /> : <Navigate to="/auth" replace />} />
            <Route path="/users/:userId" element={user ? <UserProfilePage /> : <Navigate to="/auth" replace />} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;