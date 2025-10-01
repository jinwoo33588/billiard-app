import React from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Card, Title, Stack } from '@mantine/core';

function Register() {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      nickname: '',
    },
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
      form.reset();
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입에 실패했습니다.');
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack>
        <Title order={3}>회원가입</Title>
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
      </Stack>
    </Card>
  );
}

export default Register;