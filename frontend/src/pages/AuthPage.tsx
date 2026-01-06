import React, { useState } from "react";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
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