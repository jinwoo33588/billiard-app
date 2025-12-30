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
import InsightsPage from './pages/InsightsPage';
import { IconAnalyze } from '@tabler/icons-react';

import {
  AppShell,
  Group,
  Title,
  Center,
  Loader,
  Button,
  Text,
  ActionIcon,
  Container,
  Modal,
  Stack,
  TextInput,
  NumberInput,
  Badge,
} from '@mantine/core';
import { IconHome, IconArchive, IconChartBar, IconUser, IconPencil } from '@tabler/icons-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ 프로필 모달 상태
  const [profileOpen, setProfileOpen] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editHandicap, setEditHandicap] = useState<number>(0);

  const openProfile = () => {
    if (!user) return;
    setEditNickname(user.nickname ?? '');
    setEditHandicap(Number(user.handicap ?? 0));
    setProfileOpen(true);
  };

  const closeProfile = () => setProfileOpen(false);

  const saveProfile = async () => {
    try {
      const payload = {
        nickname: editNickname.trim(),
        handicap: Number(editHandicap) || 0,
      };

      const res = await axiosInstance.put('/users/me', payload);
      // ✅ 백엔드가 수정된 user를 반환한다는 전제 (우리가 PUT /users/me에서 그렇게 구현)
      setUser(res.data);
      setProfileOpen(false);
    } catch (e) {
      console.error(e);
      alert('프로필 수정에 실패했습니다.');
    }
  };

  const fetchGames = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axiosInstance.get('/games');
      setGames(response.data);
    } catch (error) {
      console.error('경기 기록을 불러오는 데 실패했습니다:', error);
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
    setProfileOpen(false);
  };

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  return (
    <AppShell  padding="md" header={{ height: 60 }} footer={user ? { height: 60 } : undefined}>
      <AppShell.Header>
        <Container fluid px="sm" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Title order={4}>🎱 테크노 당구 기록</Title>

            {user ? (
              <Group gap="xs" wrap="nowrap">
                {/* ✅ 프로필 요약 배지 */}
                <Badge variant="light" radius="xl">
                  {user.nickname} · {user.handicap}점
                </Badge>

                {/* ✅ 프로필 버튼 */}
                <ActionIcon variant="light" radius="xl" size="lg" onClick={openProfile}>
                  <IconUser size={18} />
                </ActionIcon>

                <Button size="xs" variant="light" onClick={handleLogout}>
                  로그아웃
                </Button>
              </Group>
            ) : null}
          </Group>
        </Container>
      </AppShell.Header>

      {user && (
        <AppShell.Footer>
          <Group h="100%" grow justify="center" gap={0}>
            <ActionIcon component={NavLink} to="/" variant="subtle" size="xl">
              <IconHome />
            </ActionIcon>
            <ActionIcon component={NavLink} to="/archive" variant="subtle" size="xl">
              <IconArchive />
            </ActionIcon>
            <ActionIcon component={NavLink} to="/insights" variant="subtle" size="xl"><IconAnalyze /></ActionIcon>
            <ActionIcon component={NavLink} to="/ranking" variant="subtle" size="xl">
              <IconChartBar />
            </ActionIcon>
          </Group>
        </AppShell.Footer>
      )}

      <AppShell.Main>
        <Container style={{ paddingBottom: '80px' }}>
          <Routes>
            <Route
              path="/auth"
              element={!user ? <AuthPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/"
              element={user ? <HomePage user={user} games={games} refreshGames={fetchGames} /> : <Navigate to="/auth" replace />}
            />
            <Route path="/archive" element={user ? <ArchivePage games={games} /> : <Navigate to="/auth" replace />} />
            <Route path="/insights" element={user ? <InsightsPage /> : <Navigate to="/auth" replace />} />
            <Route path="/ranking" element={user ? <RankingPage /> : <Navigate to="/auth" replace />} />
            <Route path="/users/:userId" element={user ? <UserProfilePage /> : <Navigate to="/auth" replace />} />
          </Routes>
        </Container>

        {/* ✅ 프로필 수정 모달 (닉네임/핸디캡) */}
        <Modal opened={profileOpen} onClose={closeProfile} title="프로필 수정" centered>
          <Stack>
            <Text size="sm" c="dimmed">
              닉네임과 핸디캡(내 점수)을 수정할 수 있어요.
            </Text>

            <TextInput
              label="닉네임"
              value={editNickname}
              onChange={(e) => setEditNickname(e.currentTarget.value)}
              placeholder="예: jinwoo"
              rightSection={<IconPencil size={16} />}
            />

            <NumberInput
              label="핸디캡(점수)"
              value={editHandicap}
              onChange={(v) => setEditHandicap(Number(v) || 0)}
              min={0}
              clampBehavior="strict"
              placeholder="예: 25"
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={closeProfile}>
                취소
              </Button>
              <Button onClick={saveProfile} disabled={!editNickname.trim()}>
                저장
              </Button>
            </Group>
          </Stack>
        </Modal>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;