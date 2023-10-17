/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-await-in-loop */
import axios from "axios";
import {
  ApproveTeamRequest,
  TeamApprovalAction,
} from "../models/requests/Language";
import {
  CreateLeagueRequest,
  SubmitMatchResultRequest,
  UpdateMatchResultRequest,
} from "../models/requests/Leagues";
import { Action } from "../models/Response";
import {
  DivisionMatchResultResponse,
  DivisionModel,
  FixtureResponse,
  GroupedFixtureBySessionAndRound,
  GroupedMatchResultsByFixtureSessionAndRound,
  IndividualMatchRecordsResponse,
  LeaderboardIndividualResponse,
  LeaderboardTeamResponse,
  LeagueResponse,
  MatchGameResult,
  MatchPlayer,
  TeamModel,
  TeamsStatisticResponse,
  Tier,
} from "../models/responses/League";
import { FilterResult } from "../screens/FilterFixtureResult";
import { FixtureUpdateItem } from "../screens/OrganizerScreens/EditFixture";
import { createRandomString } from "../utils/strings";
import { formatCoreUrl } from "./ServiceUtil";

export async function getLeagues() {
  const res = await axios.get<LeagueResponse[]>(formatCoreUrl("/league"));
  return res?.data;
}

export async function getLeagueById(id: string | number) {
  const res = await axios.get<LeagueResponse>(formatCoreUrl(`/league/${id}`));
  return res.data;
}

export async function getFixture(payload: {
  divisionId?: number | string;
  fromDate?: string;
  toDate?: string;
  homeTeamId?: number;
  awayTeamId?: number;
  teamId?: number | string;
  userId?: string | number;
}) {
  const res = await axios.get<FixtureResponse[]>(formatCoreUrl("/fixture"), {
    params: payload,
  });
  const returnedFixture = res.data || [];
  if (payload.userId) {
    return returnedFixture.filter((fixture) => {
      if (
        fixture.homeTeam.members.findIndex(
          (member) => member.userId === payload.userId
        ) !== -1 ||
        fixture.awayTeam.members.findIndex(
          (member) => member.userId === payload.userId
        ) !== -1
      ) {
        return true;
      }
    });
  }
  return returnedFixture;
}

export async function getDivisionsInLeague(LeagueId: number) {
  const res = await axios.get<DivisionModel[]>(
    formatCoreUrl(`/league/${LeagueId}`)
  );
  return res?.data;
}

export async function getTeamsInDivision(divisionId: number) {
  const res = await axios.get<TeamModel[]>(
    formatCoreUrl(`/division/${divisionId}/teams`)
  );
  return res?.data;
}

export async function createLeague(payload: CreateLeagueRequest) {
  const res = await axios.post(formatCoreUrl("/league"), payload);
  return res.data;
}

export async function updateLeague(
  id: string | number,
  payload: CreateLeagueRequest
) {
  const res = await axios.put(formatCoreUrl(`/league/${id}`), payload);
  return res.data;
}

export async function addTeamToDivision({
  teamName,
  divisionId,
}: {
  teamName: string;
  divisionId: string | number;
}) {
  await axios.post(formatCoreUrl(`/division/${divisionId}/team`), {
    name: teamName,
  });
}

export async function updateTeamToDivision({
  newName,
  teamId,
}: {
  newName: string;
  teamId: string | number;
}) {
  await axios.patch(formatCoreUrl(`/team/${teamId}`), {
    name: newName,
  });
}

export async function deleteTeamFromDivision({
  teamId,
}: {
  teamId: string | number;
}) {
  await axios.delete(formatCoreUrl(`/team/${teamId}`));
}

export async function getTeamById(teamId: string | number) {
  const res = await axios.get<TeamModel>(formatCoreUrl(`/team/${teamId}`));
  return res.data;
}

export async function updateJoinTeamRequestForMember(payload: {
  memberId: string | number;
  action: Action;
  rejectReason: string;
}) {
  const res = await axios.patch(
    formatCoreUrl(`/team/member/${payload.memberId}`),
    {
      action: payload.action,
      parameters: {
        rejectReason: payload.rejectReason,
      },
    }
  );
  return res.data;
}

export async function addDivisionForLeague(payload: {
  leagueId: string | number;
  name: string;
  tier: Tier | string;
}) {
  const res = await axios.post(
    formatCoreUrl(`/league/${payload.leagueId}/division`),
    payload
  );
}

export async function importFixture(payload: {
  file: string;
  leagueId: string | number;
}) {
  const bodyFormData = new FormData();
  bodyFormData.append("File", {
    uri: payload.file,
    name: `fixture_${createRandomString(8)}.csv`,
    type: "file/csv",
  });
  const res = await axios.post(
    formatCoreUrl(`/league/${payload.leagueId}/fixture/import`),
    bodyFormData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
}

export async function applicationLeague(teamId: number) {
  const res = await axios.put(formatCoreUrl(`/team/${teamId}/application`));
  return res;
}

export async function cancelLeague(teamId: number) {
  const res = await axios.delete(formatCoreUrl(`/team/${teamId}/application`));
  return res;
}

export function filterFixtureBySeasonAndRound(
  data: FixtureResponse[],
  season: number,
  round: number
) {
  return data.filter((d) => d.season === season && d.round === round);
}

export function getMaxNumberOfSeason(data: FixtureResponse[]) {
  let max = 0;
  data.forEach((d) => {
    if (d.season > max) {
      max = d.season;
    }
  });
  return max;
}

export function getMinNumberOfSeason(data: FixtureResponse[]) {
  let min = 9999999999999;
  data.forEach((d) => {
    if (d.season < min) {
      min = d.season;
    }
  });
  return min;
}

export function getMaxNumberOfRound(data: FixtureResponse[]) {
  let max = 0;
  data.forEach((d) => {
    if (d.round > max) {
      max = d.round;
    }
  });
  return max;
}

export function getMinNumberOfRound(data: FixtureResponse[]) {
  let min = 9999999999999;
  data.forEach((d) => {
    if (d.round < min) {
      min = d.round;
    }
  });
  return min;
}

export function groupFixtures(data: FixtureResponse[], roundId?: number) {
  const result: GroupedFixtureBySessionAndRound[] = [];
  const allSeasons = Array.from(Array(getMaxNumberOfSeason(data)).keys()).map(
    (val) => val + 1
  );
  const allRound = Array.from(Array(getMaxNumberOfRound(data)).keys()).map(
    (val) => val + 1
  );
  allSeasons.forEach((season) => {
    allRound.forEach((round) => {
      const relatedData = filterFixtureBySeasonAndRound(
        data,
        season,
        roundId || round
      );
      if (relatedData.length > 0) {
        result.push({ season, round, fixtures: relatedData });
      }
    });
  });
  return result;
}

export async function updateFixtures(payload: {
  fixture: FixtureUpdateItem[];
}) {
  await axios.put(formatCoreUrl("/fixture"), payload.fixture);
}

export async function exportFixture(
  divisionId: string | number,
  seasonId: string | number
) {
  await axios.get(
    formatCoreUrl(`/division/${divisionId}/season/${seasonId}/fixture/export`)
  );
}
export async function approveOrRejectJoinTeam(payload: ApproveTeamRequest) {
  if (payload.action === TeamApprovalAction.Reject) {
    const parameters = { reasonReject: payload.rejectReason };
    const res = await axios.patch(
      formatCoreUrl(`/team/member/${payload.memberId}`),
      {
        action: payload.action,
        parameters,
      }
    );
    return res;
  }
  const res = await axios.patch(
    formatCoreUrl(`/team/member/${payload.memberId}`),
    {
      action: payload.action,
    }
  );
  return res;
}

export async function removeTeamMembers(memberId: number) {
  const res = await axios.delete(formatCoreUrl(`/team/member/${memberId}`));
  return res;
}

export async function getFixtureById(fixturId?: number) {
  const res = await axios.get<FixtureResponse>(
    formatCoreUrl(`/fixture/${fixturId}`)
  );
  return res?.data;
}

export async function getdivisionById(divisionId?: number) {
  const res = await axios.get<DivisionModel>(
    formatCoreUrl(`/division/${divisionId}`)
  );
  return res?.data;
}

export async function getAllDivisionMatchResults(payload: {
  divisionId: string | number | undefined;
  season?: number;
  round?: number;
  userId?: string;
}) {
  const res = await axios.get<DivisionMatchResultResponse[]>(
    formatCoreUrl(`/result`),
    {
      params: payload,
    }
  );
  const returnedMatch = res.data || [];
  if (payload.userId) {
    return returnedMatch.filter((match) => {
      if (
        match.awayTeamPlayers.findIndex(
          (member) => member.userId === payload.userId
        ) !== -1 ||
        match.homeTeamPlayers.findIndex(
          (member) => member.userId === payload.userId
        ) !== -1
      ) {
        return true;
      }
    });
  }
  return res.data;
}

export function getMaxNumberOfRoundForMatchResults(
  data: DivisionMatchResultResponse[]
) {
  let max = 0;
  data.forEach((d) => {
    if (d.fixture?.round > max) {
      max = d.fixture?.round;
    }
  });
  return max;
}

export function getMaxNumberOfSessionForMatchResults(
  data: DivisionMatchResultResponse[]
) {
  let max = 0;
  data.forEach((d) => {
    if (d.fixture?.season > max) {
      max = d.fixture?.season;
    }
  });
  return max;
}

export function filterMatchResultByFixtureSeasonAndRound(
  data: DivisionMatchResultResponse[],
  season: number,
  round: number
) {
  return data.filter(
    (d) => d.fixture.season === season && d.fixture.round === round
  );
}

export function groupMatchResultsByFixtureSessionAndRound(
  data: DivisionMatchResultResponse[],
  roundId?: number
) {
  const result: GroupedMatchResultsByFixtureSessionAndRound[] = [];
  const allSeasons = Array.from(
    Array(getMaxNumberOfSessionForMatchResults(data)).keys()
  ).map((val) => val + 1);
  const allRound = Array.from(
    Array(getMaxNumberOfRoundForMatchResults(data)).keys()
  ).map((val) => val + 1);
  allSeasons.forEach((season) => {
    allRound.forEach((round) => {
      const relatedData = filterMatchResultByFixtureSeasonAndRound(
        data,
        season,
        roundId || round
      );
      if (relatedData.length > 0) {
        result.push({ season, round, matchResults: relatedData });
      }
    });
  });
  return result;
}

export async function saveMatchResult(payload: UpdateMatchResultRequest) {
  const res = await axios.put(
    formatCoreUrl(`/result/${payload.resultId}`),
    payload
  );
  return res;
}

export async function approveMatchResult(resultId: string | number) {
  await axios.patch(formatCoreUrl(`/result/${resultId}`), {
    action: Action.Approve,
  });
}

export async function bulkApprove(matchResults: DivisionMatchResultResponse[]) {
  for (const match of matchResults) {
    try {
      await approveMatchResult(match.id);
    } catch (error) {
      console.log("Ignored", error);
    }
  }
}

export async function getLeaderboard(payload: {
  divisionId: number | string;
  type: "individual" | "team";
}) {
  const { divisionId, type } = payload;
  if (type === "individual") {
    const res = await axios.get<LeaderboardIndividualResponse[]>(
      formatCoreUrl(`/result/division/${divisionId}/${type}/leaderboard`)
    );
    return res?.data;
  }
  const res = await axios.get<LeaderboardTeamResponse[]>(
    formatCoreUrl(`/result/division/${divisionId}/${type}/leaderboard`)
  );
  return res?.data;
}

export async function getIndividualMatchRecords(payload: {
  divisionId: number | string;
  teamId: number | string;
  playerId: string;
}) {
  const { divisionId, teamId, playerId } = payload;
  const res = await axios.get<IndividualMatchRecordsResponse>(
    formatCoreUrl(
      `/result/division/${divisionId}/team/${teamId}/player/${playerId}`
    )
  );
  return res?.data;
}

export async function searchMatchResults(payload: {
  divisionId?: string | number | undefined;
  teamId?: string | number | undefined;
  date?: string | undefined;
}) {
  const res = await axios.get<DivisionMatchResultResponse[]>(
    formatCoreUrl("/result"),
    {
      params: payload,
    }
  );
  return res.data;
}

export async function getTeamsStats(payload: {
  divisionId: number | string;
  teamId: number | string;
}) {
  const { divisionId, teamId } = payload;
  const res = await axios.get<TeamsStatisticResponse>(
    formatCoreUrl(`/result/division/${divisionId}/team/${teamId}`)
  );
  return res?.data;
}

export async function getAcknowledgeResults(payload: {
  resultId: number | string;
  action: "Acknowledge" | "Reject";
  reasonReject?: string;
}) {
  const { resultId, action, reasonReject } = payload;
  const formValue = {
    Action: action,
    Parameters: {
      RejectReason: reasonReject,
    },
  };
  const res = await axios.put(
    formatCoreUrl(`/result/${resultId}/acknowledge`),
    formValue
  );

  return res?.data;
}

export async function submitMatchResult(payload: SubmitMatchResultRequest) {
  const { fixtureId } = payload;
  const res = await axios.post(formatCoreUrl(`/result/${fixtureId}`), payload);
  return res;
}

export async function getMatchResultById(id: string | number) {
  const res = await axios.get<DivisionMatchResultResponse>(
    formatCoreUrl(`/result/${id}`)
  );
  return res.data;
}

export function combineFixturesWithMatchResultData(
  fixtures: FixtureResponse[],
  matchResults: DivisionMatchResultResponse[]
) {
  const result: {
    fixture: FixtureResponse;
    matchResult?: DivisionMatchResultResponse;
  }[] = [];
  fixtures.forEach((fixture) => {
    const matchedMatchResult = matchResults.filter(
      (match) =>
        (match.fixture &&
          match.fixture.id &&
          match.fixture.id === fixture.id) ||
        (match.fixtureId && match.fixtureId === fixture.id)
    )[0];
    if (matchedMatchResult) {
      result.push({ fixture, matchResult: matchedMatchResult });
    } else {
      result.push({ fixture, matchResult: undefined });
    }
  });
  return result;
}

export default {
  getLeagues,
  getDivisionsInLeague,
  getTeamsInDivision,
  applicationLeague,
  cancelLeague,
  getFixtureById,
  getdivisionById,
};
