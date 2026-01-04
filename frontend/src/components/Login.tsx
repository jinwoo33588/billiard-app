import React from "react";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Button, Card, Stack, Text, Anchor } from "@mantine/core";
import { useAuth } from "../features/auth/useAuth";

interface LoginProps {
  onToggleForm: () => void;
}

function Login({ onToggleForm }: LoginProps) {
  const { login } = useAuth();

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "유효한 이메일이 아닙니다."),
      password: (value) => (value.length < 6 ? "비밀번호는 6자 이상이어야 합니다." : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <Card shadow="sm" p={{ base: "md", sm: "lg" }} radius="md" withBorder w={400}>
      <Stack>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="이메일" placeholder="your@email.com" required {...form.getInputProps("email")} />
          <PasswordInput mt="md" label="비밀번호" placeholder="비밀번호" required {...form.getInputProps("password")} />
          <Button type="submit" fullWidth mt="xl">
            로그인
          </Button>
        </form>

        <Text ta="center" mt="sm">
          계정이 없으신가요?{" "}
          <Anchor component="button" type="button" onClick={onToggleForm}>
            회원가입
          </Anchor>
        </Text>
      </Stack>
    </Card>
  );
}

export default Login;