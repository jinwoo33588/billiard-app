import React from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Card, Title, Stack, Text, Anchor } from '@mantine/core';

// [추가] onToggleForm prop을 받기 위한 인터페이스
interface RegisterProps {
  onToggleForm: () => void;
}

function Register({ onToggleForm }: RegisterProps) {
  const form = useForm({
    initialValues: { email: '', password: '', nickname: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '유효한 이메일이 아닙니다.'),
      password: (value) => (value.length < 6 ? '비밀번호는 6자 이상이어야 합니다.' : null),
      nickname: (value) => (value.length < 2 ? '닉네임은 2자 이상이어야 합니다.' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await axiosInstance.post('/users/register', values);
      alert('회원가입에 성공했습니다! 이제 로그인해주세요.');
      onToggleForm(); // 회원가입 성공 후 로그인 폼으로 전환
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입에 실패했습니다.');
    }
  };

  return (
    <Card shadow="sm" p={{ base: 'md', sm: 'lg' }} radius="md" withBorder w={400}>
      <Stack>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="이메일"
            placeholder="your@email.com"
            required
            {...form.getInputProps('email')}
          />
          <PasswordInput
            mt="md"
            label="비밀번호"
            placeholder="비밀번호"
            required
            {...form.getInputProps('password')}
          />
          <TextInput
            mt="md"
            label="닉네임"
            placeholder="사용할 닉네임"
            required
            {...form.getInputProps('nickname')}
          />
          <Button type="submit" fullWidth mt="xl">
            가입하기
          </Button>
        </form>

        {/* [추가] 로그인 페이지로 이동하는 링크 */}
        <Text ta="center" mt="sm">
          이미 계정이 있으신가요?{' '}
          <Anchor component="button" type="button" onClick={onToggleForm}>
            로그인
          </Anchor>
        </Text>
      </Stack>
    </Card>
  );
}

export default Register;