import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Card, Table, Title, Text, Center, Loader } from '@mantine/core';

interface RankItem {
  nickname: string;
  totalGames: number;
  average: number;
}

function RankingPage() {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/users/ranking');
        setRanking(response.data);
      } catch (error) {
        console.error('랭킹 정보를 불러오는 데 실패했습니다.', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  if (loading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  const rows = ranking.map((item, index) => (
    <Table.Tr key={item.nickname}>
      <Table.Td>{index + 1}</Table.Td>
      <Table.Td>{item.nickname}</Table.Td>
      <Table.Td>{item.average.toFixed(3)}</Table.Td>
      <Table.Td>{item.totalGames}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={2} mb="md">🏆 전체 랭킹</Title>
      {ranking.length === 0 ? (
        <Text>랭킹 데이터가 없습니다.</Text>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>순위</Table.Th>
              <Table.Th>닉네임</Table.Th>
              <Table.Th>에버리지</Table.Th>
              <Table.Th>총 경기수</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </Card>
  );
}

export default RankingPage;