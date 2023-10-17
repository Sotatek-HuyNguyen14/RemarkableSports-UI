import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Heading,
  useTheme,
  VStack,
  Text,
  HStack,
  Center,
  Avatar,
  Badge,
} from "native-base";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useSWR from "swr";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { Store } from "../../../stores";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { isBlank, isPositiveNumber } from "../../../utils/strings";
import { useAuth } from "../../../hooks/UseAuth";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import { showApiToastError } from "../../../components/ApiToastError";
import {
  approveMatchResult,
  getAcknowledgeResults,
  getMatchResultById,
} from "../../../services/LeagueServices";
import { CreateLeagueRequest } from "../../../models/requests/Leagues";
import ExclaimationIcon from "../../../components/Icons/ExclaimationIcon";
import MatchGameResultItem from "./MatchGameResultItem";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import { Role, User, UserType } from "../../../models/User";
import Card from "../../../components/Card/Card";
import LocationIcon from "../../../components/Icons/LocationIcon";
import {
  DivisionMatchResultResponse,
  DivisionMatchResultStatus,
  FixtureResponse,
} from "../../../models/responses/League";
import RejectWithReasonModal from "../../../components/Modal/RejectWithReasonModal";
import { formatCoreUrl, formatFileUrl } from "../../../services/ServiceUtil";
import Loading from "../../../components/Loading";
import {
  format24HTo12H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import ImageDirectory from "../../../assets";
import { LeagueFlow } from "../../LeagueV2/LeagueScreenV2";

export type MatchResultPropsNavigationProp = NativeStackNavigationProp<
  MainStackNavigatorParamList,
  "MatchResult"
>;

type MatchResultPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "MatchResult"
>;

export interface MatchResultProps extends MatchResultPropsBaseProps {
  store: Store;
  route: MatchResultPropsBaseProps;
  navigation: MatchResultPropsNavigationProp;
}

export interface FormValue extends CreateLeagueRequest {
  test: string;
}

const t = getTranslation([
  "constant.district",
  "constant.eventType",
  "screen.OrganizerScreens.UpdateMatchResult",
  "screen.OrganizerScreens.League",
  "constant.profile",
  "component.FixtureItem",
  "constant.button",
  "leagueTerms",
  "toastMessage",
]);
export function MatchCardV2({
  matchResult,
  user,
  fixture,
  badgeStatus,
  flow,
}: {
  matchResult: DivisionMatchResultResponse;
  user: User;
  fixture: FixtureResponse;
  badgeStatus?: JSX.Element;
  flow: LeagueFlow;
}) {
  const isHomeTeamPlayer = fixture.homeTeam.members
    .map((p) => p.userId)
    .join(", ")
    .includes(user?.id);
  const isAwayTeamPlayer = fixture.awayTeam.members
    .map((p) => p.userId)
    .join(", ")
    .includes(user?.id);
  const isViewAsAudience = flow === LeagueFlow.audience;
  const homeTeamPoint = matchResult
    ? matchResult.homeAdditionalPoint +
      matchResult.homePlayerPoint +
      matchResult.homeTotalPoints
    : "-";
  const awayTeamPoint = matchResult
    ? matchResult.awayAdditionalPoint +
      matchResult.awayPlayerPoint +
      matchResult.awayTotalPoints
    : "-";
  const isWin = isHomeTeamPlayer
    ? homeTeamPoint > awayTeamPoint
    : homeTeamPoint < awayTeamPoint;
  const isLose = isHomeTeamPlayer
    ? homeTeamPoint < awayTeamPoint
    : homeTeamPoint > awayTeamPoint;
  const resultColor = isWin
    ? "rs_secondary.green"
    : isLose
    ? "rs_secondary.error"
    : "#6D6D6D";
  const status = isWin ? t("WIN") : isLose ? t("LOSE") : t("DRAW");
  const bg = isWin ? "#00B81233" : isLose ? "#E7101033" : "rs.white";

  const numberOfSetHomeTeamWin =
    matchResult && matchResult.gameResults
      ? matchResult.gameResults.filter(
          (match) => match.homeSetResult > match.awaySetResult
        ).length
      : "-";
  const numberOfSetAwayTeamWin =
    matchResult && matchResult.gameResults
      ? matchResult.gameResults.filter(
          (match) => match.homeSetResult < match.awaySetResult
        ).length
      : "-";
  const winText = () => {
    return (
      <Text fontWeight="bold" color="rs_secondary.green">
        {t("WIN")}
      </Text>
    );
  };
  return (
    <Card
      body={
        <VStack p="4" flex="1" space="3">
          {/* Fixture time - Win lose status */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text fontSize="md">{`${formatUtcToLocalDate(
                fixture.date
              )} ${format24HTo12H(fixture.time.toString())}`}</Text>
              {/* Fixture venue */}
              <Text fontSize="sm" color="#6D6D6D">
                {fixture.venue}
              </Text>
            </VStack>
            {/* Status */}
            {badgeStatus !== undefined && badgeStatus}
            {!isViewAsAudience && !badgeStatus && matchResult && (
              <Badge
                borderColor={bg}
                variant="outline"
                bg={bg}
                mr={3}
                borderRadius="3xl"
                _text={{ color: resultColor, fontSize: "md" }}
              >
                {status}
              </Badge>
            )}
          </HStack>
          {/* Result */}
          <VStack w="100%" space="3">
            {/* Point - set title */}
            <HStack w="100%">
              <HStack flex={0.7} />
              <HStack flex={0.3}>
                <Text w="50%" color="#6D6D6D" textAlign="center">
                  {t("Point")}
                </Text>
                <Text w="50%" color="#6D6D6D" textAlign="center">
                  {t("Set")}
                </Text>
              </HStack>
            </HStack>
            <HStack w="100%">
              {/* Home team name */}
              <HStack flex={0.7} alignItems="center" space={2}>
                <Text
                  fontWeight={
                    isHomeTeamPlayer && !isViewAsAudience ? "bold" : "normal"
                  }
                  color={
                    isHomeTeamPlayer && !isViewAsAudience
                      ? "rs.primary_purple"
                      : "rs.black"
                  }
                >
                  {fixture.homeTeam.name}
                </Text>
                {homeTeamPoint > awayTeamPoint && isViewAsAudience && winText()}
              </HStack>
              <HStack flex={0.3}>
                {/* Home team point */}
                <Text
                  w="50%"
                  fontSize="md"
                  fontWeight={!isViewAsAudience ? "bold" : "normal"}
                  color={
                    !isViewAsAudience
                      ? isHomeTeamPlayer && homeTeamPoint > awayTeamPoint
                        ? "#00B812"
                        : isHomeTeamPlayer && homeTeamPoint < awayTeamPoint
                        ? "#E71010"
                        : "rs.black"
                      : "rs.black"
                  }
                  textAlign="center"
                >
                  {matchResult ? homeTeamPoint : "-"}
                </Text>
                {/* Home team set */}
                <Text
                  w="50%"
                  fontSize="md"
                  fontWeight={!isViewAsAudience ? "bold" : "normal"}
                  color={
                    !isViewAsAudience
                      ? isHomeTeamPlayer &&
                        numberOfSetHomeTeamWin > numberOfSetAwayTeamWin
                        ? "#00B812"
                        : isHomeTeamPlayer &&
                          numberOfSetHomeTeamWin < numberOfSetAwayTeamWin
                        ? "#E71010"
                        : "rs.black"
                      : "rs.black"
                  }
                  textAlign="center"
                >
                  {numberOfSetHomeTeamWin}
                </Text>
              </HStack>
            </HStack>

            <HStack w="100%">
              {/* Away team name */}
              <HStack flex={0.7} alignItems="center" space={2}>
                <Text
                  fontWeight={
                    isAwayTeamPlayer && !isViewAsAudience ? "bold" : "normal"
                  }
                  color={
                    isAwayTeamPlayer && !isViewAsAudience
                      ? "rs.primary_purple"
                      : "rs.black"
                  }
                >
                  {fixture.awayTeam.name}
                </Text>
                {awayTeamPoint > homeTeamPoint && isViewAsAudience && winText()}
              </HStack>
              <HStack flex={0.3}>
                {/* Away team point */}
                <Text
                  w="50%"
                  fontSize="md"
                  fontWeight={!isViewAsAudience ? "bold" : "normal"}
                  color={
                    !isViewAsAudience
                      ? isAwayTeamPlayer && awayTeamPoint > homeTeamPoint
                        ? "#00B812"
                        : isAwayTeamPlayer && awayTeamPoint < homeTeamPoint
                        ? "#E71010"
                        : "rs.black"
                      : "rs.black"
                  }
                  textAlign="center"
                >
                  {awayTeamPoint}
                </Text>
                {/* Away team set */}
                <Text
                  w="50%"
                  fontSize="md"
                  fontWeight={!isViewAsAudience ? "bold" : "normal"}
                  color={
                    !isViewAsAudience
                      ? isAwayTeamPlayer &&
                        numberOfSetAwayTeamWin > numberOfSetHomeTeamWin
                        ? "#00B812"
                        : isAwayTeamPlayer &&
                          numberOfSetAwayTeamWin < numberOfSetHomeTeamWin
                        ? "#E71010"
                        : "rs.black"
                      : "rs.black"
                  }
                  textAlign="center"
                >
                  {numberOfSetAwayTeamWin}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </VStack>
      }
    />
  );
}
export default function MatchResult({ navigation, route }: MatchResultProps) {
  const theme = useTheme();
  const [confirmModal, setConfirmModal] = useState(false);
  const { isShowApproval, matchResultId, fromTeam } = route.params;
  const [isOpen, setOpen] = useState({ confirmModal: false, reject: false });
  const { user } = useAuth();

  const {
    data: matchResult,
    isValidating: matchResultValidating,
    error: matchError,
    mutate: matchResultMutate,
  } = useSWR(
    matchResultId ? formatCoreUrl(`/result/${matchResultId}`) : undefined,
    () => {
      if (matchResultId) {
        return getMatchResultById(matchResultId);
      }
    }
  );

  useFocusEffect(
    React.useCallback(() => {
      matchResultMutate();
    }, [matchResultMutate])
  );

  const rejectReason = () => {
    const reason = matchResult ? matchResult.rejectReason : "";
    return (
      <HStack space={2} alignItems="center" p="4" borderRadius="8">
        <ExclaimationIcon />
        <VStack>
          <Heading color="#E71010" fontSize="md">
            {t("Reject reason")}
          </Heading>
          <Text>{reason}</Text>
        </VStack>
      </HStack>
    );
  };

  let isPlayerFromHomeTeam = false;
  let isPlayerFromAwayTeam = false;
  // if fromTeam = home isPlayerFromHomeTeam = true, if fromTeam = away isPlayerFromAwayTeam = true
  // if user was included in homeTeam and then isPlayerFromHomeTeam = true
  // if user was included in awayTeam and then isPlayerFromAwayTeam = true
  // if user was excluded in awayTeam and homeTeam  and then isPlayerFromAwayTeam = true
  if (fromTeam === "home") {
    isPlayerFromHomeTeam = true;
  }
  if (fromTeam === "away") {
    isPlayerFromAwayTeam = true;
  }
  if (!fromTeam) {
    isPlayerFromAwayTeam =
      matchResult?.fixture?.awayTeam?.members?.findIndex(
        (player) => player.userId === user?.id
      ) !== -1;

    const homeResult =
      matchResult?.fixture?.homeTeam?.members?.findIndex(
        (player) => player.userId === user?.id
      ) !== -1;
    if (!isPlayerFromAwayTeam && homeResult) {
      isPlayerFromHomeTeam = homeResult;
    }
    if (!isPlayerFromAwayTeam && !homeResult) {
      isPlayerFromHomeTeam = true;
    }
  }
  const flow = route.params.flow || LeagueFlow.audience;
  const isViewAsAudience = flow === LeagueFlow.audience;
  const matchCard = () => {
    if (!matchResult) {
      return <VStack />;
    }
    const {
      fixture,
      homeTotalPoints,
      homeAdditionalPoint,
      homePlayerPoint,
      awayTotalPoints,
      awayAdditionalPoint,
      awayPlayerPoint,
      gameResults,
      id,
    } = matchResult;

    const isHomeTeamPlayer = fixture.homeTeam.members
      .map((p) => p.userId)
      .join(", ")
      .includes(user?.id);
    const isAwayTeamPlayer = fixture.awayTeam.members
      .map((p) => p.userId)
      .join(", ")
      .includes(user?.id);

    const totalHomePoint =
      homeTotalPoints + homeAdditionalPoint + homePlayerPoint;
    const totalAwayPoint =
      awayTotalPoints + awayAdditionalPoint + awayPlayerPoint;
    const isWin = isHomeTeamPlayer
      ? totalHomePoint > totalAwayPoint
      : totalHomePoint < totalAwayPoint;
    const isLose = isHomeTeamPlayer
      ? totalHomePoint < totalAwayPoint
      : totalHomePoint > totalAwayPoint;
    const resultColor = isWin
      ? "rs_secondary.green"
      : isLose
      ? "rs_secondary.error"
      : "#6D6D6D";
    const status = isWin ? t("WIN") : isLose ? t("LOSE") : t("DRAW");
    const bg = isWin ? "#00B81233" : isLose ? "#E7101033" : "rs.white";
    const homeTeamPoint = matchResult
      ? matchResult.homeAdditionalPoint +
        matchResult.homePlayerPoint +
        matchResult.homeTotalPoints
      : "-";
    const awayTeamPoint = matchResult
      ? matchResult.awayAdditionalPoint +
        matchResult.awayPlayerPoint +
        matchResult.awayTotalPoints
      : "-";
    const numberOfSetHomeTeamWin =
      matchResult && matchResult.gameResults
        ? matchResult.gameResults.filter(
            (match) => match.homeSetResult > match.awaySetResult
          ).length
        : "-";
    const numberOfSetAwayTeamWin =
      matchResult && matchResult.gameResults
        ? matchResult.gameResults.filter(
            (match) => match.homeSetResult < match.awaySetResult
          ).length
        : "-";
    const winText = () => {
      return (
        <Text fontWeight="bold" color="rs_secondary.green">
          {t("WIN")}
        </Text>
      );
    };

    return (
      <VStack space="2" mt="4">
        <MatchCardV2
          matchResult={matchResult}
          fixture={fixture}
          user={user}
          flow={flow}
        />
        <VStack mx="2" mt="2" space="3">
          {/* Details points */}
          <Heading fontSize="lg">{`${t("Match")} ${"Statistics"}`}</Heading>
          <HStack justifyContent="space-between">
            <Text
              color={
                isViewAsAudience
                  ? "rs.black"
                  : isHomeTeamPlayer
                  ? "rs.primary_purple"
                  : "rs.black"
              }
              fontWeight={
                isViewAsAudience
                  ? "normal"
                  : isHomeTeamPlayer
                  ? "bold"
                  : "normal"
              }
            >
              {fixture.homeTeam.name}
            </Text>
            <Text
              color={
                isViewAsAudience
                  ? "rs.black"
                  : isAwayTeamPlayer
                  ? "rs.primary_purple"
                  : "rs.black"
              }
              fontWeight={
                isViewAsAudience
                  ? "normal"
                  : isAwayTeamPlayer
                  ? "bold"
                  : "normal"
              }
              textAlign="center"
            >
              {fixture.awayTeam.name}
            </Text>
          </HStack>
          <VStack w="100%" space="2">
            <HStack
              space="4"
              justifyContent="space-between"
              alignItems="center"
              w="100%"
            >
              <Text
                color={
                  isViewAsAudience
                    ? "rs.black"
                    : isHomeTeamPlayer
                    ? "rs.primary_purple"
                    : "rs.black"
                }
                fontWeight={
                  isViewAsAudience
                    ? "normal"
                    : isHomeTeamPlayer
                    ? "bold"
                    : "normal"
                }
                fontSize="lg"
                textAlign="center"
              >
                {matchResult.homeTotalPoints}
              </Text>
              <Text color="#6D6D6D">{t("Points from each match")}</Text>
              <Text
                fontSize="lg"
                color={
                  isViewAsAudience
                    ? "rs.black"
                    : isAwayTeamPlayer
                    ? "rs.primary_purple"
                    : "rs.black"
                }
                fontWeight={
                  isViewAsAudience
                    ? "normal"
                    : isAwayTeamPlayer
                    ? "bold"
                    : "normal"
                }
              >
                {matchResult.awayTotalPoints}
              </Text>
            </HStack>

            <HStack
              space="4"
              justifyContent="space-between"
              alignItems="center"
              w="100%"
            >
              <Text
                fontSize="lg"
                color={
                  isViewAsAudience
                    ? "rs.black"
                    : isHomeTeamPlayer
                    ? "rs.primary_purple"
                    : "rs.black"
                }
                fontWeight={
                  isViewAsAudience
                    ? "normal"
                    : isHomeTeamPlayer
                    ? "bold"
                    : "normal"
                }
              >
                {matchResult.homePlayerPoint}
              </Text>
              <Text color="#6D6D6D">{t("Points from no of players")}</Text>
              <Text
                fontSize="lg"
                color={
                  isViewAsAudience
                    ? "rs.black"
                    : isAwayTeamPlayer
                    ? "rs.primary_purple"
                    : "rs.black"
                }
                fontWeight={
                  isViewAsAudience
                    ? "normal"
                    : isAwayTeamPlayer
                    ? "bold"
                    : "normal"
                }
              >
                {matchResult.awayPlayerPoint}
              </Text>
            </HStack>

            <HStack
              space="4"
              justifyContent="space-between"
              alignItems="center"
              w="100%"
            >
              <Text
                fontSize="lg"
                color={
                  isViewAsAudience
                    ? "rs.black"
                    : isHomeTeamPlayer
                    ? "rs.primary_purple"
                    : "rs.black"
                }
                fontWeight={
                  isViewAsAudience
                    ? "normal"
                    : isHomeTeamPlayer
                    ? "bold"
                    : "normal"
                }
              >
                {matchResult.homeAdditionalPoint}
              </Text>
              <Text color="#6D6D6D">{t("Additional points")}</Text>
              <Text
                fontSize="lg"
                color={
                  isViewAsAudience
                    ? "rs.black"
                    : isAwayTeamPlayer
                    ? "rs.primary_purple"
                    : "rs.black"
                }
                fontWeight={
                  isViewAsAudience
                    ? "normal"
                    : isAwayTeamPlayer
                    ? "bold"
                    : "normal"
                }
              >
                {matchResult.awayAdditionalPoint}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    );
  };

  const setsInfo = () => {
    if (!matchResult) {
      return <VStack />;
    }
    const { gameResults } = matchResult;
    return (
      <VStack space="2" mt="4">
        <Heading fontSize="lg">{t("Sets")}</Heading>
        {gameResults &&
          gameResults.length > 0 &&
          gameResults.map((game, index) => {
            const isHomeTeamPlayer = matchResult.fixture.homeTeam.members
              .map((p) => p.userId)
              .join(", ")
              .includes(user?.id);
            const isAwayTeamPlayer = matchResult.fixture.awayTeam.members
              .map((p) => p.userId)
              .join(", ")
              .includes(user?.id);
            const isHomeTeamWin = game.homeSetResult > game.awaySetResult;
            const isAwayTeamWin = game.homeSetResult < game.awaySetResult;
            const isDraw = game.homeSetResult === game.awaySetResult;
            const bgHomeTeam = isHomeTeamPlayer ? "#66CEE133" : "#EDEFF0";
            const bgAwayTeam = isAwayTeamPlayer ? "#66CEE133" : "#EDEFF0";
            const homeTeamResultColor = isHomeTeamWin
              ? "rs.green"
              : isAwayTeamWin
              ? "rs.red"
              : "rs.black";

            const awayTeamResultColor = isAwayTeamWin
              ? "rs.green"
              : isHomeTeamWin
              ? "rs.red"
              : "rs.black";
            return (
              <VStack space="0" mt="2">
                <Text fontSize="md" fontWeight="bold" mb="2">{`${t("Set")} ${
                  index + 1
                }`}</Text>
                {/* Home team */}
                <HStack
                  alignItems="center"
                  bg={isViewAsAudience ? "#66CEE133" : bgHomeTeam}
                  px="4"
                  py="2"
                >
                  {/* Team name + Avatar */}
                  <HStack space="2" alignItems="center" flex="0.6">
                    <Avatar
                      size="sm"
                      source={
                        game.homePlayerAvatarURL
                          ? { uri: formatFileUrl(game.homePlayerAvatarURL) }
                          : ImageDirectory.DRAFT_AVT
                      }
                    >
                      Thumbnail
                    </Avatar>
                    <VStack space="1">
                      <Text
                        fontWeight={
                          isHomeTeamPlayer && !isViewAsAudience
                            ? "bold"
                            : "normal"
                        }
                        color={
                          isHomeTeamPlayer && !isViewAsAudience
                            ? "rs.primary_purple"
                            : "rs.black"
                        }
                      >
                        {game.homePlayerName}
                      </Text>
                      <Text
                        fontWeight={
                          isHomeTeamPlayer && !isViewAsAudience
                            ? "bold"
                            : "normal"
                        }
                        color={
                          isHomeTeamPlayer && !isViewAsAudience
                            ? "rs.primary_purple"
                            : "rs.black"
                        }
                      >
                        {matchResult.fixture.homeTeam.name}
                      </Text>
                    </VStack>
                  </HStack>
                  {/* Points */}
                  <HStack flex="0.4" alignItems="center">
                    <Text
                      flex={1 / (game.setResults.length + 1)}
                      fontWeight="bold"
                      fontSize="lg"
                      color={
                        isHomeTeamPlayer && !isViewAsAudience
                          ? homeTeamResultColor
                          : "rs.black"
                      }
                      textAlign="center"
                    >
                      {game.homeSetResult}
                    </Text>
                    {game.setResults.map((result) => {
                      return (
                        <Text
                          flex={1 / (game.setResults.length + 1)}
                          textAlign="center"
                          color="#6D6D6D"
                        >
                          {result.homePlayerScore}
                        </Text>
                      );
                    })}
                  </HStack>
                </HStack>

                {/* Away team */}
                <HStack
                  alignItems="center"
                  bg={isViewAsAudience ? "#EDEFF0" : bgAwayTeam}
                  px="4"
                  py="2"
                >
                  {/* Team name + Avatar */}
                  <HStack space="2" alignItems="center" flex="0.6">
                    <Avatar
                      size="sm"
                      source={
                        game.awayPlayerAvatarURL
                          ? { uri: formatFileUrl(game.awayPlayerAvatarURL) }
                          : ImageDirectory.DRAFT_AVT
                      }
                    >
                      Thumbnail
                    </Avatar>
                    <VStack space="1">
                      <Text
                        fontWeight={
                          isAwayTeamPlayer && !isViewAsAudience
                            ? "bold"
                            : "normal"
                        }
                        color={
                          isAwayTeamPlayer && !isViewAsAudience
                            ? "rs.primary_purple"
                            : "rs.black"
                        }
                      >
                        {game.awayPlayerName}
                      </Text>
                      <Text
                        fontWeight={
                          isAwayTeamPlayer && !isViewAsAudience
                            ? "bold"
                            : "normal"
                        }
                        color={
                          isAwayTeamPlayer && !isViewAsAudience
                            ? "rs.primary_purple"
                            : "rs.black"
                        }
                      >
                        {matchResult.fixture.awayTeam.name}
                      </Text>
                    </VStack>
                  </HStack>
                  {/* Points */}
                  <HStack flex="0.4" alignItems="center">
                    <Text
                      color={
                        isAwayTeamPlayer && !isViewAsAudience
                          ? awayTeamResultColor
                          : "rs.black"
                      }
                      fontWeight="bold"
                      fontSize="lg"
                      flex={1 / (game.setResults.length + 1)}
                      textAlign="center"
                    >
                      {game.awaySetResult}
                    </Text>
                    {game.setResults.map((result) => {
                      return (
                        <Text
                          flex={1 / (game.setResults.length + 1)}
                          textAlign="center"
                          color="#6D6D6D"
                        >
                          {result.awayPlayerScore}
                        </Text>
                      );
                    })}
                  </HStack>
                </HStack>
              </VStack>
            );
          })}
      </VStack>
    );
  };

  const shouldShowApproveEdit = user && user.userType === UserType.Organizer;

  if (matchResultValidating) {
    return <Loading />;
  }
  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Match result"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
    >
      {matchResult && (
        <VStack mx="defaultLayoutSpacing">
          {/* Reject reason */}
          {matchResult.rejectReason &&
            !isBlank(matchResult.rejectReason) &&
            rejectReason()}
          {/* Match card */}
          {matchCard()}
          {/* Sets info */}
          {setsInfo()}
          {/* Approve edit */}
          {shouldShowApproveEdit && (
            <VStack space="3" mt="4">
              {(matchResult.status === DivisionMatchResultStatus.Acknowledged ||
                matchResult.status === DivisionMatchResultStatus.Rejected) && (
                <Button
                  onPress={() => {
                    setConfirmModal(true);
                  }}
                >
                  {t("Approve")}
                </Button>
              )}
              <Button
                onPress={() => {
                  navigation.navigate("UpdateMatchResult", { matchResult });
                }}
                variant="outline"
              >
                {t("Edit")}
              </Button>
            </VStack>
          )}

          {isShowApproval && (
            <VStack space="3" mt="4">
              {matchResult.status === DivisionMatchResultStatus.Pending && (
                <Button
                  onPress={() => {
                    setOpen((pre) => ({ ...pre, confirmModal: true }));
                  }}
                >
                  {t("Accept")}
                </Button>
              )}
              <Button
                variant="outline"
                onPress={() => {
                  setOpen((pre) => ({ ...pre, reject: true }));
                }}
              >
                {t("Reject")}
              </Button>
            </VStack>
          )}
          <ConfirmationModal
            alertType="Fail"
            confirmText={t("Yes")}
            cancelText={t("Cancel")}
            isOpen={confirmModal}
            onCancel={() => {
              setConfirmModal(false);
            }}
            title={`${t("Approve")} ${t("Result")}`}
            description={t("Are you sure to approve the match results")}
            onConfirm={async () => {
              setConfirmModal(false);
              try {
                await approveMatchResult(matchResult.id);
                showApiToastSuccess({
                  title: `${t("Confirm")}${t("Success")}`,
                  body: t("Match results will be posted on Leaderboard"),
                });
                navigation.goBack();
              } catch (error) {
                showApiToastError(error);
              }
            }}
          />

          <ConfirmationModal
            alertType="Fail"
            confirmText={t("Yes")}
            cancelText={t("Cancel")}
            isOpen={isOpen.confirmModal}
            onCancel={() => {
              setOpen((pre) => ({ ...pre, confirmModal: false }));
            }}
            title={`${t("Accept")} ${t("Result")}`}
            description={t("Are you sure to accept the match results?")}
            onConfirm={async () => {
              setOpen((pre) => ({ ...pre, confirmModal: false }));
              try {
                await getAcknowledgeResults({
                  action: "Acknowledge",
                  resultId: matchResult.id,
                });
                showApiToastSuccess({
                  title: `${t("Accept")}${t("Success")}`,
                  body: t("The result will be reviewed by the Organizer"),
                });
                navigation.goBack();
              } catch (error) {
                showApiToastError(error);
              }
            }}
          />
          <RejectWithReasonModal
            isOpen={isOpen.reject}
            onClose={() => setOpen((pre) => ({ ...pre, reject: false }))}
            onPressSubmit={async (reasonReject) => {
              setOpen((pre) => ({ ...pre, reject: false }));
              try {
                await getAcknowledgeResults({
                  action: "Reject",
                  resultId: matchResult.id,
                  reasonReject,
                });
                navigation?.goBack();
              } catch (error) {
                showApiToastError(error);
              }
            }}
            rejectObject={{ name: t("onboarding as a MatchResult") }}
          />
        </VStack>
      )}
    </HeaderLayout>
  );
}
