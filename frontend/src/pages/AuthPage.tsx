import React from 'react';
import Register from '../components/Register';
import Login, { User } from '../components/Login';
import { Grid, Title, Stack } from '@mantine/core';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

function AuthPage({ onLoginSuccess }: AuthPageProps) {
  return (
    // [수정] spacing -> gap
    <Stack gap="xl">
      {/* [수정] align -> ta */}
      <Title order={2} ta="center">
        로그인 또는 회원가입
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Register />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Login onLoginSuccess={onLoginSuccess} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export default AuthPage;