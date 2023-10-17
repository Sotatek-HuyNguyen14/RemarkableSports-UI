/* eslint-disable react/no-array-index-key */
import {
  VStack,
  useTheme,
  Text,
  HStack,
  Heading,
  Button,
  Box,
  Badge,
  Pressable,
  Toast,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Alert, LayoutAnimation, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import GhostTabbar from "../../components/GhostTabBar";
import {
  TeamModel,
  TeamApplicationStatus,
  GroupedMatchResultsByFixtureSessionAndRound,
  DivisionMatchResultStatus,
  DivisionMatchResultResponse,
} from "../../models/responses/League";
import TipsComponent from "../../components/TipsComponent";
import FilterIcon from "../../components/Icons/FilterIcon";
import RightArrowIcon from "../../components/Icons/RightArrowIcon";
import {
  applicationLeague,
  cancelLeague,
  getAllDivisionMatchResults,
  getdivisionById,
  getFixture,
  getTeamsInDivision,
  getTeamsStats,
  groupFixtures,
  groupMatchResultsByFixtureSessionAndRound,
} from "../../services/LeagueServices";
import { useAuth } from "../../hooks/UseAuth";
import { showApiToastError } from "../../components/ApiToastError";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { formatCoreUrl } from "../../services/ServiceUtil";
import FixtureCard from "../../components/Card/FixtureCard";
import { formatUtcToLocalDate } from "../../utils/date";
import NoDataComponent from "../../components/NoDataComponent";
import DivisionMatchResultItem from "../OrganizerScreens/ManageDivision/DivisionResultItem";
import OneColumnPickerModal from "../../components/Modal/OneColumnPickerModal";
import FilterIconV2 from "../../components/Icons/FilterIconV2";
import CoffeeIcon from "../../components/Icons/CoffeeIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";

export type DivisionScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "DivisionScreen"
>;

const t = getTranslation([
  "screen.DivisionScreen",
  "constant.button",
  "leagueTerms",
  "toastMessage",
]);

enum ActiveTab {
  Team = "Team",
  Fixture = "Fixture",
  Result = "Result",
}

interface FormValue {
  selectedFilterMatchRoundId: string;
  selectedFilterFixtureRoundId: string;
}

export function DivisionScreen({ navigation, route }: DivisionScreenProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { division, defaultTabIndex, divisionId, startTime } = route.params;
  const today = new Date();

  const {
    control,
    formState: { isValid, isSubmitting, isDirty },
    watch,
  } = useForm<FormValue>({
    mode: "onBlur",
    defaultValues: {
      selectedFilterMatchRoundId: "All round",
      selectedFilterFixtureRoundId: "All round",
    },
  });

  const {
    data: fixtures,
    isValidating: fixturesValidating,
    error: fixturesError,
    mutate: fixturesMutate,
  } = useSWR(
    division || divisionId ? formatCoreUrl("/fixture") : undefined,
    () => {
      if (division || divisionId) {
        let myTeamId;
        division?.teams.forEach((team) => {
          team.members.forEach((member) => {
            if (member.userId === user?.id) {
              myTeamId = team.id;
            }
          });
        });
        return getFixture({
          divisionId: division?.id || divisionId,
        });
      }
    }
  );

  const {
    data: divisionData,
    isValidating: divisionValidating,
    error: divisionError,
    mutate: divisionMutate,
  } = useSWR(
    divisionId ? formatCoreUrl(`/division/${divisionId}`) : undefined,
    () => {
      if (divisionId) {
        return getdivisionById(divisionId);
      }
    }
  );

  const {
    data: matchResultsData,
    isValidating: matchResultValidating,
    error: matchError,
    mutate: matchResultMutate,
  } = useSWR(formatCoreUrl("/result"), () => {
    return getAllDivisionMatchResults({
      divisionId: divisionId || division?.id,
    });
  });

  const matchRoundOptions =
    matchResultsData && matchResultsData.length > 0
      ? matchResultsData
          ?.map((result) => {
            return result.fixture.round;
          })
          .map((r) => {
            return {
              label: `${t("Round")} ${r}`,
              value: r.toString(),
            };
          })
      : [];

  const fixtureRoundOptions =
    fixtures && fixtures.length > 0
      ? fixtures
          ?.map((result) => {
            return result.round;
          })
          .map((r) => {
            return {
              label: `${t("Round")} ${r}`,
              value: r.toString(),
            };
          })
      : [];

  const resultDivision = division || divisionData;
  const [teams, setTeams] = useState<TeamModel[]>(resultDivision?.teams || []);
  const [activeTabIndex, setActiveTabIndex] = React.useState(
    defaultTabIndex ?? 0
  );
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [selectedFilterMatchRoundModal, setSelectedFilterMatchRoundModal] =
    React.useState(false);
  const [selectedFilterFixtureRoundModal, setSelectedFilterFixtureRoundModal] =
    React.useState(false);

  const availableTabs = [
    t(ActiveTab.Team),
    t(ActiveTab.Fixture),
    t(ActiveTab.Result),
  ];

  function removeDuplicateObjects(array: [], property: any) {
    const uniqueIds = [];

    const unique = array.filter((element) => {
      const isDuplicate = uniqueIds.includes(element[property]);

      if (!isDuplicate) {
        uniqueIds.push(element[property]);

        return true;
      }

      return false;
    });

    return unique;
  }

  const currentUserTeam = teams
    ? teams?.find((team) =>
        team.members.find(
          (member) =>
            member.userId === user?.id &&
            member.status === TeamApplicationStatus.Approved
        )
      )
    : undefined;

  const pendingApprovals =
    matchResultsData && currentUserTeam
      ? matchResultsData.find(
          (val) =>
            val.status === DivisionMatchResultStatus.Pending &&
            val.submitted &&
            currentUserTeam.members.find(
              (player) => player.userId === user?.sub
            ) &&
            val.fixture?.awayTeam?.id === currentUserTeam.id
        )
      : undefined;

  useFocusEffect(
    React.useCallback(() => {
      matchResultMutate();
      if (divisionId && activeTabIndex === 0) divisionMutate();
    }, [activeTabIndex, divisionId, divisionMutate, matchResultMutate])
  );

  useEffect(() => {
    if (activeTabIndex === 0 && resultDivision) {
      setTeams(resultDivision.teams);
    }
  }, [activeTabIndex, resultDivision]);

  const onRefresh = async () => {
    try {
      if (resultDivision?.id) {
        setError(true);
        const newTeams = await getTeamsInDivision(resultDivision?.id);
        setTeams(newTeams);
        setError(false);
      }
    } catch (e: any) {
      showApiToastError(e);
      setError(true);
    }
  };

  const onCancel = async (teamId: number) => {
    try {
      setLoading(true);
      await cancelLeague(teamId);
      await onRefresh();
      setLoading(false);
      if (!Toast.isActive("cancelLeaguee_Toast")) {
        Toast.show({
          id: "cancelLeaguee_Toast",
          placement: "top",
          duration: 2000,
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Successfully")}
                body={`${t("Cancel")}${t("Successfully")}`}
              />
            );
          },
        });
      }
    } catch (error: any) {
      showApiToastError(error);
      setLoading(false);
    }
  };

  const onApply = async (teamId: number) => {
    try {
      setLoading(true);
      await applicationLeague(teamId);
      await onRefresh();
      setLoading(false);
      if (!Toast.isActive("ApplicationLeague_Toast")) {
        Toast.show({
          id: "ApplicationLeague_Toast",
          placement: "top",
          duration: 2000,
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Successfully")}
                body={`${t("Apply")}${t("Successfully")}`}
              />
            );
          },
        });
      }
    } catch (error: any) {
      console.log("error:", error);
      showApiToastError(error);
      setLoading(false);
    }
  };

  const isPending = teams?.find((team) =>
    team.members.find(
      (member) =>
        member.userId === user?.id &&
        member.status === TeamApplicationStatus.Pending
    )
  );
  const isTeamMember = teams?.find((team) =>
    team.members.find(
      (member) =>
        member.userId === user?.id &&
        member.status === TeamApplicationStatus.Approved
    )
  );
  const renderTeam = (team: TeamModel, index: number) => {
    const isCreator = team.creatorId === user?.sub;
    const isMember = team.members.find(
      (val) =>
        val.userId === user?.id && val.status === TeamApplicationStatus.Approved
    );
    const isApply = team.members.find(
      (val) =>
        val.userId === user?.id && val.status === TeamApplicationStatus.Pending
    );
    const pendingList = team.members.filter(
      (val) => val.status === TeamApplicationStatus.Pending
    );
    return (
      <VStack
        key={`team_${team.name}_${team.id}`}
        bg={index % 2 !== 0 ? "rs.bg_grey" : "rs.lightGrey"}
        p="defaultLayoutSpacing"
        space={1}
      >
        {(isCreator || isMember) && (
          <Badge
            bgColor="rs.primary_purple"
            borderColor="rs.primary_purple"
            w="67"
            h="26"
          >
            <Text color="rs.white" fontSize={12} lineHeight={18}>
              {t("My team")}
            </Text>
          </Badge>
        )}
        <HStack
          bg={index % 2 !== 0 ? "rs.bg_grey" : "rs.lightGrey"}
          justifyContent="space-between"
          alignItems="center"
        >
          <HStack space={4} alignItems="center">
            <Heading>{index + 1}</Heading>
            <Heading>{team.name}</Heading>
          </HStack>
          {(isCreator || isMember) && (
            <Pressable
              flexDirection="row"
              _pressed={{ opacity: 0.5 }}
              justifyContent="center"
              alignItems="center"
              onPress={() => {
                navigation.navigate("ManageTeam", {
                  teamId: isMember?.teamId,
                });
              }}
            >
              <Box
                w="6"
                h="6"
                bg="rs.green"
                borderRadius="full"
                justifyContent="center"
                alignItems="center"
                mr={0.5}
              >
                <Text color="rs.white" fontWeight={600}>
                  {pendingList?.length ?? 0}
                </Text>
              </Box>
              <RightArrowIcon alignSelf="center" />
            </Pressable>
          )}
          {!isCreator && !isMember && !isApply && !isPending && !isTeamMember && (
            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              isLoadingText={t("Loading")}
              alignItems="center"
              justifyContent="center"
              variant="ghost"
              onPress={() => {
                if (team.id) onApply(team.id);
              }}
            >
              {t("Apply")}
            </Button>
          )}
          {isApply && !isCreator && (
            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              isLoadingText={t("Loading")}
              alignItems="center"
              justifyContent="center"
              variant="ghost"
              onPress={() => {
                if (team.id) onCancel(team.id);
              }}
            >
              {t("Cancel request")}
            </Button>
          )}
        </HStack>
      </VStack>
    );
  };

  const noDataRender = () => {
    return (
      <Box>
        {activeTabIndex === 0 && (
          <NoDataComponent content={t("There is no Team")} />
        )}
        {activeTabIndex === 1 && (
          <NoDataComponent content={t("There is no Fixture")} />
        )}
        {activeTabIndex === 2 && (
          <NoDataComponent content={t("There is no Result")} />
        )}
      </Box>
    );
  };

  const fixtureView = (isResult?: boolean) => {
    const selectedFilterFixtureRoundId = watch("selectedFilterFixtureRoundId");
    let localFixtures = fixtures;
    if (isResult) {
      localFixtures = fixtures?.filter((fixture, index) => {
        if (matchResultsData?.length) {
          return matchResultsData.find((match) => {
            return (
              fixture.id !== match.fixture.id &&
              fixture.homeTeam.id === isTeamMember?.id
            );
          });
        }

        return fixture.homeTeam.id === isTeamMember?.id;
      });
    }

    const groupedFixtureBySessionAndRound = localFixtures
      ? groupFixtures(
          localFixtures,
          selectedFilterFixtureRoundId === "All round"
            ? undefined
            : parseInt(selectedFilterFixtureRoundId, 10)
        )
      : [];

    return (
      <VStack space="4">
        {!isResult && filterBar("selectedFilterFixtureRoundId")}
        {groupedFixtureBySessionAndRound
          .filter((group) => {
            if (selectedFilterFixtureRoundId === "All round") {
              return true;
            }
            return group.round === parseInt(selectedFilterFixtureRoundId, 10);
          })
          .map((group, p) => {
            return (
              <VStack space="2" key={`group_season_round_${p}`}>
                {!isResult && (
                  <HStack width="100%" alignItems="center" my="2">
                    <Text
                      flex="1"
                      textAlign="center"
                      fontWeight="bold"
                      color="rs_secondary.orange"
                      fontSize="md"
                      ml="1"
                    >
                      {`${t("Season")} ${group.season} - ${t("Round")} ${
                        group.round
                      }`}
                    </Text>
                  </HStack>
                )}
                {group.fixtures &&
                  group.fixtures.length > 0 &&
                  group.fixtures.map((f) => {
                    const isExist = matchResultsData?.some(
                      (val) => val.fixture.id === f.id
                    );
                    const havePlayer =
                      f.homeTeam?.members?.filter(
                        (val) => val.status === TeamApplicationStatus.Approved
                      ).length > 0 &&
                      f.awayTeam?.members?.filter(
                        (val) => val.status === TeamApplicationStatus.Approved
                      )?.length > 0;

                    if (isResult && !isExist) {
                      return (
                        <FixtureCard
                          fixture={f}
                          isShowSubmit={isResult && havePlayer && !isExist}
                          onPress={() => {
                            navigation.navigate("SubmitMatchResult", {
                              fixture: f,
                            });
                          }}
                          key={`${group.round}_${group.season}_${f.id}`}
                        />
                      );
                    }
                    if (!isResult) {
                      return (
                        <FixtureCard
                          fixture={f}
                          onPress={() => {
                            navigation.navigate("SubmitMatchResult", {
                              fixture: f,
                            });
                          }}
                          key={`${group.round}_${group.season}_${f.id}`}
                        />
                      );
                    }
                    return null;
                  })}
              </VStack>
            );
          })}
      </VStack>
    );
  };

  const filterBar = (
    key: "selectedFilterMatchRoundId" | "selectedFilterFixtureRoundId"
  ) => {
    const selectedFilterMatchRoundId = watch(key);
    const filterText =
      selectedFilterMatchRoundId === "All round"
        ? t("All round")
        : `${t("Round")} ${selectedFilterMatchRoundId}`;
    const options =
      key === "selectedFilterMatchRoundId"
        ? removeDuplicateObjects(matchRoundOptions, "value")
        : removeDuplicateObjects(fixtureRoundOptions, "value");

    const isModalShow =
      key === "selectedFilterMatchRoundId"
        ? selectedFilterMatchRoundModal
        : selectedFilterFixtureRoundModal;
    const setModalOpen =
      key === "selectedFilterMatchRoundId"
        ? setSelectedFilterMatchRoundModal
        : setSelectedFilterFixtureRoundModal;
    return (
      <VStack>
        <Pressable
          onPress={() => {
            setModalOpen(true);
          }}
        >
          <VStack
            shadow="9"
            style={{
              shadowOffset: {
                width: 5,
                height: 5,
              },
              shadowOpacity: 0.1,
            }}
            borderColor="gray.300"
            borderRadius="lg"
            borderWidth="1"
            bgColor="gray.300"
            py="2"
            px="4"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <VStack space="1">
                <HStack space="2" justifyContent="center" alignItems="center">
                  <Text fontSize="md">{filterText}</Text>
                </HStack>
              </VStack>
              <FilterIconV2 />
            </HStack>
          </VStack>
        </Pressable>
        {/* <OneColumnPickerModal
          isOpen={isModalShow}
          onClose={() => {
            setModalOpen(false);
          }}
          headerLabel={t("Filter")}
          options={[
            {
              label: t("All round"),
              value: "All round",
            },
            ...options,
          ]}
          controllerProps={{
            name: key,
            control,
          }}
        /> */}
        <SingleSelectModal
          isOpen={isModalShow}
          onClose={() => {
            setModalOpen(false);
          }}
          headerLabel={t("Filter")}
          options={[
            {
              label: t("All round"),
              value: "All round",
            },
            ...options,
          ]}
          controllerProps={{
            name: key,
            control,
            rules: {
              required: true,
            },
          }}
          confirmButtonText={t("Confirm")}
        />
      </VStack>
    );
  };

  const resultView = () => {
    if (
      !matchResultValidating &&
      matchError &&
      !fixturesValidating &&
      fixturesError
    ) {
      return <ErrorMessage />;
    }
    if (
      (!matchResultsData ||
        (matchResultsData.length === 0 && matchResultsData)) &&
      (!fixtures || !fixtures?.length)
    ) {
      return noDataRender();
    }
    const localData = matchResultsData;
    // ?.filter((val) => {
    //   if (val.fixture.homeTeam.id === isTeamMember?.id) {
    //     return true;
    //   }
    //   if (val.fixture.awayTeam.id === isTeamMember?.id && val.submitted) {
    //     return true;
    //   }
    //   return val.status === DivisionMatchResultStatus.Approved;
    // });

    const selectedFilterMatchRoundId = watch("selectedFilterMatchRoundId");
    const results: GroupedMatchResultsByFixtureSessionAndRound[] =
      groupMatchResultsByFixtureSessionAndRound(
        localData ?? [],
        selectedFilterMatchRoundId === "All round"
          ? undefined
          : parseInt(selectedFilterMatchRoundId, 2)
      );
    return (
      <VStack space={2} borderRadius="8">
        {filterBar("selectedFilterMatchRoundId")}
        {pendingApprovals && (
          <HStack bg="orange.100" space={2} p="4" borderRadius="10">
            <Box
              w="8"
              h="8"
              alignItems="center"
              pl="1.5"
              pt="1"
              justifyContent="center"
              borderRadius="full"
              bgColor="rgba(232, 106, 16, 0.15)"
              mt="2"
            >
              <CoffeeIcon />
            </Box>

            <VStack space="3" p="2" flex={1}>
              <Heading fontSize="md">{t("Pending Approval")}</Heading>
              <Text flexWrap="wrap">
                {t(
                  "%{homeTeamName} has submitted the results, please verify the results as soon as possible",
                  { homeTeamName: pendingApprovals?.fixture?.homeTeam?.name }
                )}
              </Text>
              <Button
                onPress={() => {
                  if (isTeamMember?.id && resultDivision?.id) {
                    navigation.navigate("PendingApproval", {
                      teamId: isTeamMember?.id,
                      divisionId: resultDivision?.id,
                      myTeam: teams?.find((team) =>
                        team.members.find(
                          (member) =>
                            member.userId === user?.id &&
                            member.status === TeamApplicationStatus.Approved
                        )
                      ),
                    });
                  }
                }}
                p="2"
                variant="solid"
                borderRadius="full"
              >
                {t("View")}
              </Button>
            </VStack>
          </HStack>
        )}
        {fixtureView(true)}
        {results
          .filter((group) => {
            if (selectedFilterMatchRoundId === "All round") {
              return true;
            }
            return group.round === parseInt(selectedFilterMatchRoundId, 10);
          })
          .map((group, s) => {
            return (
              <VStack
                space="2"
                key={`group_${group.season}_${group.round}_${s}`}
              >
                <HStack width="100%" alignItems="center" my="2">
                  <Text
                    flex="1"
                    textAlign="center"
                    fontWeight="bold"
                    color="rs_secondary.orange"
                    fontSize="md"
                    ml="1"
                  >
                    {`${t("Season")} ${group.season} - ${t("Round")} ${
                      group.round
                    }`}
                  </Text>
                </HStack>
                {group.matchResults &&
                  group.matchResults.length > 0 &&
                  group.matchResults.map((matchResult) => {
                    const myTeam = teams?.find((team) =>
                      team.members.find(
                        (member) =>
                          member.userId === user?.id &&
                          member.status === TeamApplicationStatus.Approved
                      )
                    );
                    const isShow =
                      matchResult.status ===
                        DivisionMatchResultStatus.Pending &&
                      !matchResult.submitted &&
                      myTeam?.id === matchResult.fixture.homeTeam.id;
                    const isShowApproval =
                      matchResult.status ===
                        DivisionMatchResultStatus.Pending &&
                      matchResult.submitted &&
                      myTeam?.members.find(
                        (player) => player.userId === user?.sub
                      ) &&
                      matchResult.fixture.awayTeam.id === myTeam?.id;
                    return (
                      <Pressable key={matchResult.id}>
                        <DivisionMatchResultItem
                          onPressDetail={() => {
                            navigation.navigate("MatchResult", {
                              matchResultId: matchResult.id,
                              isShowApproval,
                            });
                          }}
                          matchResult={matchResult}
                          isShowSubmit={!!isShow}
                          key={matchResult.id}
                          onPress={() => {
                            const findFixture = fixtures?.find(
                              (fixture) => fixture.id === matchResult.fixture.id
                            );
                            if (findFixture) {
                              const newMatchResult = {
                                ...matchResult,
                                fixture: findFixture,
                              };
                              const localResult = JSON.parse(
                                JSON.stringify(newMatchResult)
                              );
                              if (localResult)
                                navigation.navigate("SubmitMatchResult", {
                                  matchResult: localResult,
                                });
                            } else {
                              fixturesMutate();
                            }
                          }}
                        />
                      </Pressable>
                    );
                  })}
              </VStack>
            );
          })}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: resultDivision?.name || "",
        containerStyle: { marginHorizontal: 0 },
        hasBackButton: true,
      }}
      supportPullToRefresh
      onRefresh={() => {
        matchResultMutate();
        fixturesMutate();
        if (divisionId && activeTabIndex === 0) divisionMutate();
      }}
      isSticky
    >
      <VStack space={4} py="defaultLayoutSpacing">
        <VStack px="defaultLayoutSpacing" space={4}>
          <GhostTabbar
            isShowBottomLine
            isFlex
            defaultIndex={activeTabIndex}
            items={availableTabs}
            onPress={(item: string, index: number) => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setActiveTabIndex(index);
            }}
            activateColor={theme.colors.rs.primary_purple}
            unActivateColor={theme.colors.rs.inputLabel_grey}
            tabProps={{
              fontSize: 16,
              textAlign: "center",
              flex: 1,
            }}
          />
          {isTeamMember && activeTabIndex === 0 && (
            <TipsComponent
              icon={
                <FilterIcon props={{ size: "2xl" }} color="rgba(36,166,67,1)" />
              }
              iconProps={{
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}
              title={t("Approve request")}
              body={t("You may click to your team and check all application")}
              bg={theme.colors.rs.lightGrey}
            />
          )}
        </VStack>
        {activeTabIndex === 0 && (isLoading || divisionValidating) && (
          <Loading />
        )}
        {activeTabIndex === 1 && fixturesValidating && <Loading />}
        {activeTabIndex === 2 && matchResultValidating && <Loading />}
        {activeTabIndex === 0 &&
          ((!isLoading && isError) ||
            (!divisionValidating && divisionError)) && <ErrorMessage />}
        {activeTabIndex === 1 && !fixturesValidating && fixturesError && (
          <ErrorMessage />
        )}

        {!divisionValidating &&
          !divisionError &&
          !isLoading &&
          !isError &&
          activeTabIndex === 0 && (
            <VStack>
              <VStack px="defaultLayoutSpacing" space={4} mb={4}>
                <Text fontWeight={600}>{resultDivision?.leagueName}</Text>
                <Text fontWeight={600}># {t("Team")}</Text>
              </VStack>
              {teams?.map((team: TeamModel, index: number) =>
                renderTeam(team, index)
              )}
              {!teams?.length && noDataRender()}
            </VStack>
          )}
        {activeTabIndex === 1 && !fixturesValidating && !fixturesError && (
          <VStack space={4} p="defaultLayoutSpacing">
            {fixtures && fixtures.length > 0 && fixtureView(false)}
            {!fixtures?.length && noDataRender()}
          </VStack>
        )}

        {activeTabIndex === 2 && (
          <VStack space={4} p="defaultLayoutSpacing">
            {resultView()}
          </VStack>
        )}
      </VStack>
    </HeaderLayout>
  );
}
