import { MatchGameResult, MatchPlayer } from "../responses/League";

export interface CreateLeagueRequest {
  name: string;
  season: string;
  divisions: [
    {
      name: string;
      tier: string;
    }
  ];
}

export interface UpdateMatchResultRequest {
  resultId: string | number;
  fixtureId?: string | number;
  homeTeamPlayers: MatchPlayer[];
  awayTeamPlayers: MatchPlayer[];
  gameResults: MatchGameResult[];
  homePlayerPoint: number | string;
  awayPlayerPoint: number | string;
  homeAdditionalPoint: number | string;
  awayAdditionalPoint: number | string;
  homeTotalPoints: number | string;
  awayTotalPoints: number | string;
  submitted?: boolean;
}

export interface SubmitMatchResultRequest {
  resultId?: string | number;
  fixtureId: string | number;
  homeTeamPlayers: MatchPlayer[];
  awayTeamPlayers: MatchPlayer[];
  gameResults: MatchGameResult[];
  homePlayerPoint: number | string;
  awayPlayerPoint: number | string;
  homeAdditionalPoint: number | string;
  awayAdditionalPoint: number | string;
  homeTotalPoints: number | string;
  awayTotalPoints: number | string;
  submitted?: boolean;
}
