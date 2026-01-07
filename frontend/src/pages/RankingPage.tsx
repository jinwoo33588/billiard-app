import React from "react";
import { Center, Container, Loader, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { EP } from "../shared/api/endpoints";
import { useAuth } from "../features/auth/useAuth";
import { useRankings } from "../features/rankings/useRankings";

import RankingHeader from "../features/rankings/components/RankingHeader";
import RankingMyCard from "../features/rankings/components/RankingMyCard";
import RankingSortBar from "../features/rankings/components/RankingSortBar";
import RankingList from "../features/rankings/components/RankingList";

export default function RankingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const r = useRankings();

  if (!user) return null;

  if (r.loading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <Container>
      <Stack gap="sm">
        <RankingHeader
          titleText={r.titleText}
          mode={r.mode}
          setMode={r.setMode}
          monthValue={r.monthValue}
          setMonthValue={r.setMonthValue}
        />

        <RankingMyCard me={r.me} myGhost={r.myGhost} myRankLabel={r.myRankLabel} myRef={r.myRef} />

        <RankingSortBar
          sortBy={r.sortBy}
          sortDirection={r.sortDirection}
          handleSortChange={r.handleSortChange}
          toggleSortDirection={r.toggleSortDirection}
        />

        <RankingList
          items={r.renderList}
          mode={r.mode}
          myUserId={r.myUserId}
          myGhost={r.myGhost}
          myRef={r.myRef}
          onClickUser={(userId) => navigate(EP.users.profile(userId))}
        />
      </Stack>
    </Container>
  );
}