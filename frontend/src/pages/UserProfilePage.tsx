import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Statistics from '../components/Statistics';
import GameList, { Game } from '../components/GameList';
import { Container, Title, Stack, Center, Loader, Alert, Button, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        // 사용자 닉네임과 경기 기록을 동시에 요청합니다.
        const [userResponse, gamesResponse] = await Promise.all([
          axiosInstance.get(`/users/${userId}`),
          axiosInstance.get(`/games/user/${userId}`)
        ]);
        setNickname(userResponse.data.nickname);
        setGames(gamesResponse.data);
      } catch (err) {
        setError('사용자 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  if (loading) {
    return <Center style={{ height: 200 }}><Loader /></Center>;
  }

  if (error) {
    return <Alert icon={<IconAlertCircle size="1rem" />} title="오류 발생!" color="red">{error}</Alert>;
  }

  return (
    <Container>
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={2}>{nickname}님의 기록</Title>
          <Button variant="light" onClick={() => navigate(-1)}>뒤로가기</Button>
        </Group>
        <Statistics games={games} />
        {/* onListChange는 필요 없으므로 빈 함수를, showActions는 생략하여 메뉴를 숨깁니다. */}
        <GameList games={games} onListChange={() => {}} />
      </Stack>
    </Container>
  );
}

export default UserProfilePage;