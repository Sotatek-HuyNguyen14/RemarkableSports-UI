import {
  VStack,
  IconButton,
  HStack,
  Heading,
  Pressable,
  Text,
  Divider,
} from "native-base";
import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import {
  getAllDivisionMatchResults,
  getFixture,
  getLeagues,
  getMaxNumberOfRound,
  getMinNumberOfRound,
} from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";
import NoDataComponent from "../../../components/NoDataComponent";
import FilterIconV2 from "../../../components/Icons/FilterIconV2";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import SingleSelectModalV2 from "../../../components/Modal/SingleSelectModalV2";
import {
  format24HTo12H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../../utils/date";
import { useAuth } from "../../../hooks/UseAuth";
import WrapCardSlider from "../../../components/WrapCardSlider";
import { SCREEN_WIDTH } from "../../../constants/constants";
import RightArrowIcon from "../../../components/Icons/RightArrowIcon";
import { TeamApplicationStatus } from "../../../models/responses/League";
import { truncate } from "../../../utils/name";

export type LeaguePlayerDivisionProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeaguePlayerDivision"
>;

const t = getTranslation([
  "screen.LeaguePlayerDivision",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

export enum LeagueFlow {
  audience = "audience",
  player = "player",
}

function LeaguePlayerDivision({
  navigation,
  route,
}: LeaguePlayerDivisionProps) {
  const { league, division } = route.params;

  const {
    data: fixtures,
    isValidating: fixturesValidating,
    error: fixturesError,
    mutate: fixturesMutate,
  } = useSWR(division.id ? formatCoreUrl("/fixture") : undefined, () => {
    return getFixture({
      divisionId: division.id,
      teamId: myTeamId,
    });
  });

  const {
    data: matchResultsData,
    isValidating: matchResultValidating,
    error: matchError,
    mutate: matchResultMutate,
  } = useSWR(formatCoreUrl("/result"), () => {
    if (division.id) {
      return getAllDivisionMatchResults({
        divisionId: division.id,
      });
    }
  });

  const statisticSelection = () => {
    return (
      <VStack space="2">
        <Heading fontSize="md">{t("Statistics")}</Heading>
        <HStack space="4">
          {/* Player */}
          <Pressable
            flex="1"
            onPress={() => {
              navigation.navigate("AudiencePlayerStatistic", {
                division,
                flow: LeagueFlow.player,
              });
            }}
          >
            <HStack
              flex="1"
              p="defaultLayoutSpacing"
              justifyContent="center"
              alignItems="center"
              bg="#E86A104D"
              borderRadius="lg"
            >
              <Text fontWeight="bold">{t("Player")}</Text>
            </HStack>
          </Pressable>
          {/* Teams */}
          <Pressable
            flex="1"
            onPress={() => {
              navigation.navigate("AudienceTeamStatistic", {
                division,
                flow: LeagueFlow.player,
              });
            }}
          >
            <HStack
              flex="1"
              p="defaultLayoutSpacing"
              justifyContent="center"
              alignItems="center"
              bg="#E86A104D"
              borderRadius="lg"
            >
              <Text fontWeight="bold">{t("Teams")}</Text>
            </HStack>
          </Pressable>
        </HStack>
      </VStack>
    );
  };

  const isValidating = fixturesValidating || matchResultValidating;

  const { user } = useAuth();
  const isCurrentPlayerHasJoinedThisDivisionTeams =
    division.teams.findIndex((team) => {
      return (
        team.members.findIndex((member) => {
          return (
            member.userId === user?.id &&
            member.status === TeamApplicationStatus.Approved
          );
        }) !== -1
      );
    }) !== -1;
  const isPlayerDidJoinAnotherTeamInOtherDivision =
    league.divisions.findIndex((d) => {
      return (
        d.teams.findIndex((team) => {
          return (
            team.members.findIndex((member) => {
              return (
                member.userId === user?.id &&
                member.status === TeamApplicationStatus.Approved
              );
            }) !== -1
          );
        }) !== -1
      );
    }) !== -1;
  const myTeamId = division.teams.find((team) => {
    return (
      team.members.findIndex((member) => {
        return (
          member.userId === user?.id &&
          member.status === TeamApplicationStatus.Approved
        );
      }) !== -1
    );
  })?.id;
  // const isPlayerDidJoinAnotherTeamInOtherDivision = false;
  // const isCurrentPlayerHasJoinedThisDivisionTeams = true;

  if (isValidating) {
    return <Loading />;
  }

  const upcomingFixture = () => {
    const unwrappedFixtures = fixtures
      ? fixtures.sort((a, b) => {
          return new Date(a.date).getTime() > new Date(b.date).getTime();
        })
      : [];
    const unwrappedMatchResult = matchResultsData || [];
    const upComingFixtures = unwrappedFixtures
      .filter((f) => {
        return (
          new Date(f.date).getTime() > new Date().getTime() &&
          unwrappedMatchResult.filter((result) => {
            return result.fixture.id === f.id;
          }).length === 0 &&
          (f.awayTeam.id === myTeamId || f.homeTeam.id === myTeamId)
        );
      })
      .slice(0, 3);
    return (
      <VStack space="3">
        <HStack alignItems="center" justifyContent="space-between">
          <Heading>{t("Upcoming Fixtures")}</Heading>
          <Pressable
            onPress={() => {
              navigation.navigate("LeagueViewAllFixtureV2", {
                flow: LeagueFlow.player,
                divisionId: division.id,
                league,
              });
            }}
          >
            <Text fontSize="md" color="#31095E">
              {t("View All")}
            </Text>
          </Pressable>
        </HStack>
        {unwrappedFixtures.length === 0 && (
          <VStack
            space="1"
            shadow="9"
            p="6"
            style={{
              shadowOffset: {
                width: 5,
                height: 5,
              },
              shadowOpacity: 0.1,
              elevation: 3,
            }}
            h="60%"
            bg="white"
            borderRadius="2xl"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize="md" fontWeight="bold">
              {t("No Upcoming Fixture")}
            </Text>
          </VStack>
        )}
        <WrapCardSlider>
          {upComingFixtures.map((fixture) => {
            const matchResult = unwrappedMatchResult.filter((result) => {
              return result.fixture.id === fixture.id;
            })[0];
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
            const isHomeTeamPlayer = fixture.homeTeam.members
              .map((p) => p.userId)
              .join(", ")
              .includes(user?.id);
            const isAwayTeamPlayer = fixture.awayTeam.members
              .map((p) => p.userId)
              .join(", ")
              .includes(user?.id);
            return (
              <VStack
                space="1"
                shadow="9"
                p="6"
                style={{
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 0.1,
                  elevation: 3,
                }}
                bg="white"
                width={SCREEN_WIDTH - 32}
                borderRadius="2xl"
              >
                {/* Fixture time */}
                <Text fontSize="md">{`${formatUtcToLocalDate(
                  fixture.date
                )} ${format24HTo12H(fixture.time.toString())}`}</Text>
                {/* Fixture venue */}
                <Text fontSize="sm" color="#6D6D6D">
                  {fixture.venue}
                </Text>
                {/* Result */}
                <VStack w="100%" space="3">
                  {/* Point - set title */}
                  <HStack alignSelf="flex-end" space="8">
                    <Text color="#6D6D6D">{t("Point")}</Text>
                    <Text color="#6D6D6D">{t("Set")}</Text>
                  </HStack>
                  <HStack w="100%" justifyContent="space-between">
                    {/* Home team name */}
                    <Text
                      fontWeight={isHomeTeamPlayer ? "bold" : "normal"}
                      color={
                        isHomeTeamPlayer ? "rs.primary_purple" : "rs.black"
                      }
                    >
                      {fixture.homeTeam.name}
                    </Text>
                    <HStack alignSelf="flex-end" space="12" mr="2">
                      {/* Home team point */}
                      <Text>{homeTeamPoint}</Text>
                      {/* Home team set */}
                      <Text>{numberOfSetHomeTeamWin}</Text>
                    </HStack>
                  </HStack>

                  <HStack w="100%" justifyContent="space-between">
                    {/* Away team name */}
                    <Text
                      fontWeight={isAwayTeamPlayer ? "bold" : "normal"}
                      color={
                        isAwayTeamPlayer ? "rs.primary_purple" : "rs.black"
                      }
                    >
                      {fixture.awayTeam.name}
                    </Text>
                    <HStack alignSelf="flex-end" space="12" mr="2">
                      {/* Away team point */}
                      <Text>{awayTeamPoint}</Text>
                      {/* Away team set */}
                      <Text>{numberOfSetAwayTeamWin}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </VStack>
            );
          })}
        </WrapCardSlider>
      </VStack>
    );
  };

  const functionalButtons = (
    buttons: {
      title: string;
      description: string;
      onPress: () => void;
      isDisabled: boolean;
    }[]
  ) => {
    const functionalButton = (button: {
      title: string;
      description: string;
      onPress: () => void;
      isDisabled: boolean;
      bg?: string;
    }) => {
      return (
        <Pressable
          disabled={button.isDisabled}
          onPress={() => {
            button.onPress();
          }}
        >
          <HStack
            space="2"
            bg={button.isDisabled ? "#00000033" : button.bg || "#66CEE133"}
            alignItems="center"
            p="5"
            borderRadius="xl"
          >
            <VStack space="2" flex="1">
              <Heading color={button.bg ? "rs.white" : "rs.black"}>
                {button.title}
              </Heading>
              <Text color={button.bg ? "rs.white" : "rs.black"}>
                {button.description}
              </Text>
            </VStack>
            {!button.isDisabled && (
              <RightArrowIcon color={button.bg ? "white" : "black"} />
            )}
          </HStack>
        </Pressable>
      );
    };

    return (
      <VStack space="3">
        {buttons.map((button) => {
          return functionalButton(button);
        })}
      </VStack>
    );
  };

  const playerDidJoinDivisionView = () => {
    return (
      <VStack space="4">
        {/* Upcomming fixture */}
        {upcomingFixture()}
        {/* Functional buttons */}
        {functionalButtons([
          {
            title: t("Team Management"),
            description: t(
              "View your recent matches and manage applications for your team"
            ),
            onPress: () => {
              navigation.navigate("LeagueTeamManagement", {
                teamId: division.teams.find((team) => {
                  return team.members.find((member) => {
                    return (
                      member.userId === user?.id &&
                      member.status !== TeamApplicationStatus.Rejected
                    );
                  });
                })?.id,
                divisionId: division.id,
              });
            },
            isDisabled: false,
          },
          {
            title: t("Submit Results"),
            description: t(
              "As a home team player, you have to submit the results and pass to away team players to confirm"
            ),
            onPress: () => {
              const currentUserTeam = division.teams.find((team) => {
                return (
                  team.members
                    // where status is not Rejected
                    .filter((member) => {
                      return member.status !== TeamApplicationStatus.Rejected;
                    })
                    .map((member) => member.userId)
                    .includes(user?.id)
                );
              });
              if (currentUserTeam) {
                navigation.navigate("LeagueViewSubmitResults", {
                  divisionId: division.id,
                  teamId: currentUserTeam.id,
                  currentUserTeam,
                });
              }
            },
            isDisabled: false,
          },
          {
            title: t("Review Results"),
            description: t(
              "As a away team player, you have to acknowledge the results inputted by home team players"
            ),
            onPress: () => {
              const currentUserTeam = division.teams.find((team) => {
                return team.members
                  .filter((member) => {
                    // where status is not Rejected
                    return member.status !== TeamApplicationStatus.Rejected;
                  })
                  .map((member) => member.userId)
                  .includes(user?.id);
              });
              if (currentUserTeam) {
                navigation.navigate("LeagueReviewMatchResult", {
                  divisionId: division.id,
                  teamId: currentUserTeam.id,
                  currentUserTeam,
                });
              }
            },
            isDisabled: false,
          },
        ])}
      </VStack>
    );
  };

  const playerDidJoinOtherDivisionView = () => {
    const buttonData = isPlayerDidJoinAnotherTeamInOtherDivision
      ? [
          {
            title: t("Switch to Audience View"),
            description: t(
              "You have joined team in other division, please use audience view to check all fixtures and results in this division"
            ),
            onPress: () => {
              navigation.navigate("LeagueAudienceDivision", {
                league,
                selectedDivisionId: division.id,
              });
            },
            isDisabled: false,
            bg: "#31095E",
          },
          {
            title: t("Join Team"),
            description: t(
              "Join your team to view your recent matches and gain access to manage results"
            ),
            onPress: () => {},
            isDisabled: true,
          },
          {
            title: t("Submit Results"),
            description: t(
              "As a home team player, you have to submit the results and pass to away team players to confirm"
            ),
            onPress: () => {},
            isDisabled: true,
          },
          {
            title: t("Review Results"),
            description: t(
              "As a away team player, you have to acknowledge the results inputted by home team players"
            ),
            onPress: () => {},
            isDisabled: true,
          },
        ]
      : [
          {
            title: t("Join Team"),
            description: t(
              "Join your team to view your recent matches and gain access to manage results"
            ),
            onPress: () => {
              navigation.navigate("LeaguePlayerSubmitJoinTeamRequest", {
                division,
              });
            },
            isDisabled: false,
            bg: "#31095E",
          },
          {
            title: t("Submit Results"),
            description: t(
              "As a home team player, you have to submit the results and pass to away team players to confirm"
            ),
            onPress: () => {},
            isDisabled: true,
          },
          {
            title: t("Review Results"),
            description: t(
              "As a away team player, you have to acknowledge the results inputted by home team players"
            ),
            onPress: () => {},
            isDisabled: true,
          },
        ];
    return (
      <VStack space="4">
        {/* Functional buttons */}
        {functionalButtons(buttonData)}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: `${
          league.name.length > 15 ? truncate(league.name, 5) : league.name
        } - ${t("Season")} ${league.season}`,
      }}
      isSticky
    >
      <VStack space="4" flex="1" mx="defaultLayoutSpacing">
        {/* Statistics Players - teams */}
        {statisticSelection()}
        {/* Main view */}
        {isCurrentPlayerHasJoinedThisDivisionTeams
          ? playerDidJoinDivisionView()
          : playerDidJoinOtherDivisionView()}
      </VStack>
    </HeaderLayout>
  );
}

export default LeaguePlayerDivision;
