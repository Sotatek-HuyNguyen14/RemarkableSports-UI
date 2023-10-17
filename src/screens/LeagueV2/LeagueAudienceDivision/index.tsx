/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { VStack, HStack, Heading, Pressable, Text, Divider } from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { parseISO } from "date-fns";

import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import {
  getAllDivisionMatchResults,
  getFixture,
  getMaxNumberOfRound,
  getMinNumberOfRound,
  groupFixtures,
} from "../../../services/LeagueServices";
import Loading from "../../../components/Loading";
import FilterIconV2 from "../../../components/Icons/FilterIconV2";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import SingleSelectModalV2 from "../../../components/Modal/SingleSelectModalV2";
import {
  DivisionMatchResultStatus,
  FixtureResponse,
} from "../../../models/responses/League";
import { truncate } from "../../../utils/name";
import { MatchCardV2 } from "../../OrganizerScreens/MatchResult";
import { useAuth } from "../../../hooks/UseAuth";
import ExclaimationIcon from "../../../components/Icons/ExclaimationIcon";
import FlashListLayout from "../../../components/Layout/FlashListLayout";

export type LeagueAudienceDivisionProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeagueAudienceDivision"
>;

const t = getTranslation([
  "screen.LeagueAudienceDivision",
  "screen.leagueTerms",
  "constant.button",
  "formInput",
  "leagueTerms",
]);

export enum LeagueFlow {
  audience = "audience",
  player = "player",
}

interface FormValue {
  selectedDivisionId?: string;
}

function LeagueAudienceDivision({
  navigation,
  route,
}: LeagueAudienceDivisionProps) {
  const { league, selectedDivisionId: selectedDivisionIdParam } = route.params;

  const { control, watch } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      selectedDivisionId:
        selectedDivisionIdParam?.toString() ||
        league.divisions[0].id.toString() ||
        undefined,
    },
  });

  const [isFiltering, setIsFiltering] = useState(false);
  const { user } = useAuth();
  const selectedDivisionId = watch("selectedDivisionId");
  const selectedDivision = league.divisions.filter(
    (d) => d.id.toString() === selectedDivisionId
  )[0];

  const [showDivisionSelectModal, setShowDivisionSelectModal] = useState(false);

  const divisionOptions = useMemo(() => {
    return league.divisions.map((d) => {
      return {
        label: d.name,
        value: d.id.toString(),
      };
    });
  }, [league]);

  const {
    data: fixtures,
    isValidating: fixturesValidating,
    error: fixturesError,
    mutate: fixturesMutate,
  } = useSWR(selectedDivisionId ? formatCoreUrl("/fixture") : undefined, () => {
    if (selectedDivisionId) {
      return getFixture({
        divisionId: selectedDivisionId,
      });
    }
  });

  const {
    data: matchResultsData,
    isValidating: matchResultValidating,
    error: matchError,
    mutate: matchResultMutate,
  } = useSWR(formatCoreUrl("/result"), () => {
    if (selectedDivisionId) {
      return getAllDivisionMatchResults({
        divisionId: selectedDivisionId,
      });
    }
  });

  const roundsData: {
    divisionId: string | number;
    round: string | number;
  }[] = [];
  if (selectedDivisionId) {
    fixtures?.forEach((fixture) => {
      const entry = { divisionId: selectedDivisionId, round: fixture.round };
      // if not duplicate
      if (
        roundsData.findIndex(
          (x) => x.divisionId === entry.divisionId && x.round === entry.round
        ) === -1
      ) {
        roundsData.push(entry);
      }
    });
  }
  useEffect(() => {
    fixturesMutate();
    matchResultMutate();
  }, [selectedDivisionId, fixturesMutate, matchResultMutate]);

  const divisionSelection = () => {
    if (selectedDivision) {
      return (
        <Pressable
          onPress={() => {
            setShowDivisionSelectModal(true);
          }}
        >
          <HStack
            alignItems="center"
            py="3"
            px="4"
            justifyContent="space-between"
            bg="#F3F3F3"
            borderRadius="2xl"
          >
            <VStack space="1">
              <Text fontSize="sm">{t("Division")}</Text>
              <Text fontSize="md">{selectedDivision.name}</Text>
            </VStack>
            <DownArrowIcon />
          </HStack>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={() => {
          setShowDivisionSelectModal(true);
        }}
      >
        <HStack
          alignItems="center"
          py="3"
          px="4"
          justifyContent="space-between"
          bg="#F3F3F3"
          h="16"
          borderRadius="2xl"
        >
          <Text fontSize="md">{t("Division")}</Text>
          <DownArrowIcon />
        </HStack>
      </Pressable>
    );
  };

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
                division: selectedDivision,
                flow: LeagueFlow.audience,
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
                division: selectedDivision,
                flow: LeagueFlow.audience,
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

  const filterView = () => {
    return (
      <HStack alignItems="center" justifyContent="space-between">
        <Text fontSize="md" fontWeight="bold">
          {t("Fixtures & Results")}
        </Text>
        <Pressable
          onPress={() => {
            setIsFiltering(true);
            // get round options
            setIsFiltering(false);
            navigation.navigate("LeagueFilteringV2", {
              league,
              selectedDivisionId: selectedDivision.id,
              roundsData,
              flow: LeagueFlow.audience,
            });
          }}
        >
          <FilterIconV2 props={{ size: "xl" }} />
        </Pressable>
      </HStack>
    );
  };

  const unwrappedFixtures = fixtures || [];
  const unwrappedMatchResult = matchResultsData || [];
  const allRounds = Array.from(
    Array(getMaxNumberOfRound(unwrappedFixtures)).keys()
  )
    .map((val) => val + 1)
    .sort((a, b) => {
      return a < b;
    });

  const groupedFixtures: { round: number; fixtures: FixtureResponse[] }[] = [];
  allRounds.forEach((round) => {
    const relatedData = unwrappedFixtures.filter((d) => d.round === round);
    if (relatedData.length > 0) {
      groupedFixtures.push({ round, fixtures: relatedData });
    }
  });
  groupedFixtures.sort((a, b) => (a.round > b.round ? 1 : -1));

  const isValidating =
    matchResultValidating || fixturesValidating || isFiltering;

  if (isValidating) {
    return <Loading />;
  }

  const headerComponent = (
    <VStack space="4" flex="1" mx="defaultLayoutSpacing">
      {/* Division Selection */}
      {divisionSelection()}
      {/* Statistics Players - teams */}
      {statisticSelection()}
      {/* Filter and sort */}
      {filterView()}
      {/* Modals */}
      <SingleSelectModalV2
        isOpen={showDivisionSelectModal}
        onClose={() => {
          setShowDivisionSelectModal(false);
        }}
        title={`${t("Select")} ${t("Division")}`}
        options={divisionOptions}
        controllerProps={{
          name: "selectedDivisionId",
          control,
        }}
        confirmButtonText={t("Confirm")}
        renderItem={(item) => {
          return <Text>{item.label}</Text>;
        }}
      />
    </VStack>
  );

  const emptyOrloading = (
    <HStack
      space="2"
      alignItems="center"
      bg="#66CEE126"
      px="4"
      py="4"
      borderRadius="md"
    >
      <ExclaimationIcon props={{ customFill: "#66CEE1", size: "xl" }} />
      <Text fontSize="md" fontWeight="bold">
        {t("No Fixtures & Result")}
      </Text>
    </HStack>
  );
  return (
    <FlashListLayout
      headerProps={{
        title: `${
          league.name.length > 15 ? truncate(league.name, 5) : league.name
        } - ${t("Season")} ${league.season}`,
      }}
      refreshing={false}
      isSticky
      flashListProps={{
        data: groupedFixtures,
        renderItem: ({ item }) => (
          <VStack space="4" flex="1" mx="defaultLayoutSpacing" mt={4}>
            <Text fontSize="md" fontWeight="bold" color="#E08700">
              {`${t("Round")} ${item.round}`}
            </Text>
            <Divider />
            {item.fixtures
              .sort((a, b) => {
                return (
                  parseISO(`${a.date} ${a.time}`).getTime() <
                  parseISO(`${b.date} ${b.time}`).getTime()
                );
              })
              .map((fixture) => {
                const matchResult = unwrappedMatchResult.filter((result) => {
                  return (
                    result.fixture.id === fixture.id &&
                    result.status === DivisionMatchResultStatus.Approved
                  );
                })[0];
                return (
                  <Pressable
                    disabled={matchResult === undefined}
                    onPress={() => {
                      if (matchResult) {
                        // Navigate to Match result details page
                        navigation.navigate("MatchResult", {
                          matchResultId: matchResult.id,
                          flow: LeagueFlow.audience,
                        });
                      }
                    }}
                  >
                    <MatchCardV2
                      flow={LeagueFlow.audience}
                      fixture={fixture}
                      user={user}
                      matchResult={matchResult}
                    />
                  </Pressable>
                );
              })}
          </VStack>
        ),
        ListHeaderComponent: headerComponent,
        ListEmptyComponent: emptyOrloading,
      }}
    />
  );
}

export default LeagueAudienceDivision;
