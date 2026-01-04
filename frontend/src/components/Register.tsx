import React from "react";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Button, Card, Stack, Text, Anchor, NumberInput } from "@mantine/core";
import { useAuth } from "../features/auth/useAuth";

interface RegisterProps {
  onToggleForm: () => void;
}

function Register({ onToggleForm }: RegisterProps) {
  const { register } = useAuth();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      nickname: "",
      handicap: 15,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "유효한 이메일이 아닙니다."),
      password: (value) => (value.length < 6 ? "비밀번호는 6자 이상이어야 합니다." : null),
      nickname: (value) => (value.length < 2 ? "닉네임은 2자 이상이어야 합니다." : null),
      handicap: (value) => (Number(value) > 0 ? null : "점수를 입력하세요."),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await register({
        email: values.email,
        password: values.password,
        nickname: values.nickname,
        handicap: Number(values.handicap) || 0,
      });
      alert("회원가입에 성공했습니다! 이제 로그인해주세요.");
      onToggleForm();
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <Card shadow="sm" p={{ base: "md", sm: "lg" }} radius="md" withBorder w={400}>
      <Stack>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="이메일" placeholder="your@email.com" required {...form.getInputProps("email")} />
          <PasswordInput mt="md" label="비밀번호" placeholder="비밀번호" required {...form.getInputProps("password")} />
          <TextInput mt="md" label="닉네임" placeholder="사용할 닉네임" required {...form.getInputProps("nickname")} />
          <NumberInput
            mt="md"
            label="핸디캡 점수"
            placeholder="본인의 점수를 입력하세요"
            required
            {...form.getInputProps("handicap")}
          />
          <Button type="submit" fullWidth mt="xl">
            가입하기
          </Button>
        </form>

        <Text ta="center" mt="sm">
          이미 계정이 있으신가요?{" "}
          <Anchor component="button" type="button" onClick={onToggleForm}>
            로그인
          </Anchor>
        </Text>
      </Stack>
    </Card>
  );
}

export default Register;