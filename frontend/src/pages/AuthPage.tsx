import React, { useState } from 'react';
import Register from '../components/Register';
import Login, { User } from '../components/Login';
import { Title, Stack, Center } from '@mantine/core';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

function AuthPage({ onLoginSuccess }: AuthPageProps) {
  // [추가] 로그인 폼을 보여줄지, 회원가입 폼을 보여줄지 결정하는 상태
  const [showLogin, setShowLogin] = useState(true);

  // 폼 전환 함수
  const toggleForm = () => setShowLogin((current) => !current);

  return (
    <Stack>
      <Title order={2} ta="center">
        {showLogin ? '로그인' : '회원가입'}
      </Title>
      
      {/* [수정] showLogin 상태에 따라 하나의 컴포넌트만 렌더링 */}
      <Center>
        {showLogin ? (
          <Login onLoginSuccess={onLoginSuccess} onToggleForm={toggleForm} />
        ) : (
          <Register onToggleForm={toggleForm} />
        )}
      </Center>
    </Stack>
  );
}

export default AuthPage;