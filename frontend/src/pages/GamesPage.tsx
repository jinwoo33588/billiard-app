import React from "react";
import { useGames } from "../features/games/useGames";
import GameList from "../features/games/components/GameList";

export default function GamesPage() {
  const { loading, error, games } = useGames({ limit: 50 });

  if (loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (error) return <div style={{ padding: 12, whiteSpace: "pre-wrap" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>게임</div>
      <GameList games={games} />
    </div>
  );
}