import React, { useState } from "react";
import Register from "../features/auth/components/Register";
import Login from "../features/auth/components/Login";
import { Title, Stack, Center } from "@mantine/core";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  const toggleForm = () => setShowLogin((cur) => !cur);

  return (
    <Stack>
      <Title order={2} ta="center">
        {showLogin ? "로그인" : "회원가입"}
      </Title>

      <Center>{showLogin ? <Login onToggleForm={toggleForm} /> : <Register onToggleForm={toggleForm} />}</Center>
    </Stack>
  );
}